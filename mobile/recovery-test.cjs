/* Recovery-state matrix for recoverQueuedAssessments with mocked FileSystem. */
const fs = require('fs');
const path = require('path');
const ts = require(path.join(__dirname, 'node_modules', 'typescript'));

let pass = 0, fail = 0;
const check = (n, c, d) => { if (c) { pass++; console.log(`  PASS [${n}]`); } else { fail++; console.log(`  FAIL [${n}] ${d || ''}`); } };

const storage = new Map();
const asyncStorageStub = {
  getItem: async k => (storage.has(k) ? storage.get(k) : null),
  setItem: async (k, v) => { storage.set(k, String(v)); },
  removeItem: async k => { storage.delete(k); }
};

// Configurable FileSystem mock
let fileSystemBehavior = 'default'; // 'default' | 'all-missing' | 'throwing'
const fileSystemStub = {
  getInfoAsync: async uri => {
    if (fileSystemBehavior === 'throwing') throw new Error('unsupported platform');
    if (fileSystemBehavior === 'all-missing') return { exists: false };
    // default: exists only for /videos/ok- paths
    return { exists: String(uri).includes('/ok-') };
  },
  makeDirectoryAsync: async () => {},
  writeAsStringAsync: async () => {},
  readAsStringAsync: async () => ''
};

function loadModule() {
  // Compile assessmentQueue fresh each boot (shares `storage` → simulates disk persistence)
  const qSrc = fs.readFileSync(path.join(__dirname, 'src', 'services', 'assessmentQueue.ts'), 'utf8');
  const qJs = ts.transpileModule(qSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } }).outputText;
  const qMod = { exports: {} };
  new Function('require', 'module', 'exports', qJs)(n => {
    if (n.includes('async-storage')) { const m = asyncStorageStub; return { ...m, default: m }; }
    throw new Error('unexpected ' + n);
  }, qMod, qMod.exports);

  const src = fs.readFileSync(path.join(__dirname, 'src', 'services', 'syncEngine.ts'), 'utf8');
  let js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
  }).outputText;
  js = js.replace(
    'const assessmentQueue_1 = require("./assessmentQueue");',
    'const assessmentQueue_1 = require("./assessmentQueue"); globalThis.__QPROBE = assessmentQueue_1;'
  );
  const mod = { exports: {} };
  const stubRequire = name => {
    if (name.includes('async-storage')) { const m = asyncStorageStub; return { ...m, default: m }; }
    if (name.includes('expo-file-system')) { const m = fileSystemStub; return { ...m, default: m }; }
    if (name.includes('react-native')) return { Platform: { OS: 'android' } };
    if (name.includes('assessmentQueue')) { console.log('  [dbg] queue exports:', Object.keys(qMod.exports).join(',')); return qMod; }
    if (name.includes('./api')) return {
      createAssessment: async () => ({ data: { _id: 'srv-new-1' } }),
      updateAssessmentStatus: async () => ({}),
      getAssessmentHistory: async () => ({ data: [] })
    };
    if (name.includes('./network')) return { getNetworkStatus: () => 'offline', subscribeToNetwork: () => () => {} };
    throw new Error('unexpected import: ' + name);
  };
  new Function('require', 'module', 'exports', js)(stubRequire, mod, mod.exports);
  return { sync: mod.exports, queue: qMod.exports };
}

const mkEntry = over => ({
  localId: Math.random().toString(36).slice(2), idempotencyKey: Math.random().toString(36).slice(2),
  serverId: null, athleteId: 'ath-1', sport: 'Athletics', testType: 'countermovement_jump',
  localVideoUri: '/videos/ok-1.mp4', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  syncStatus: 'pending', retryCount: 0, lastSyncAttemptAt: null, error: null,
  errorCategory: null, nextAttemptAt: null, ...over
});

(async () => {
  let Q, Engine;

  console.log('[1] uploading without serverId → pending');
  ({ sync: Engine, queue: Q } = loadModule());
  await Q.addQueuedAssessment({ athleteId: 'ath-1', sport: 'Athletics', testType: 'countermovement_jump', localVideoUri: '/videos/ok-1.mp4', idempotencyKey: 'k1' });
  const all = await Q.getQueuedAssessments();
  await Q.updateQueuedAssessment(all[0].localId, { syncStatus: 'uploading' });
  await Engine.recoverQueuedAssessments();
  check('normalized to pending', (await Q.getQueuedAssessmentById(all[0].localId)).syncStatus === 'pending');

  storage.clear();

  console.log('[2] uploading WITH serverId → processing');
  Engine = loadModule().sync; Q = loadModule().queue;
  await Q.addQueuedAssessment({ athleteId: 'ath-1', sport: 'Athletics', testType: 'countermovement_jump', idempotencyKey: 'k2' });
  let e2 = (await Q.getQueuedAssessments())[0];
  await Q.updateQueuedAssessment(e2.localId, { syncStatus: 'uploading', serverId: '6a8a7d50a7e5ff7b76826544' });
  await Engine.recoverQueuedAssessments();
  check('normalized to processing (deterministic)', (await Q.getQueuedAssessmentById(e2.localId)).syncStatus === 'processing');

  storage.clear();

  console.log('[3] missing local video reference → failed with recoverable reason');
  Engine = loadModule().sync; Q = loadModule().queue;
  fileSystemBehavior = 'all-missing';
  await Q.addQueuedAssessment({ athleteId: 'ath-1', sport: 'Athletics', testType: 'landing_mechanics', localVideoUri: '/videos/gone.mp4', idempotencyKey: 'k3' });
  await Engine.recoverQueuedAssessments();
  e2 = (await Q.getQueuedAssessments())[0];
  check('marked failed', e2.syncStatus === 'failed');
  check('recoverable reason recorded', /no longer available/i.test(e2.error || '') && e2.errorCategory === 'upload_failed');
  check('entry NOT deleted (no data loss)', !!e2.localId && !!e2.sport);

  console.log('[4] unverifiable filesystem → left untouched');
  storage.clear();
  Engine = loadModule().sync; Q = loadModule().queue;
  fileSystemBehavior = 'throwing';
  await Q.addQueuedAssessment({ athleteId: 'ath-1', sport: 'Athletics', testType: 'sprint_acceleration', localVideoUri: '/videos/unknown.mp4', idempotencyKey: 'k4' });
  await Engine.recoverQueuedAssessments();
  e2 = (await Q.getQueuedAssessments())[0];
  check('state unchanged (pending)', e2.syncStatus === 'pending');

  fileSystemBehavior = 'default';

  console.log('[5] completed entries never touched / nothing auto-deleted');
  storage.clear();
  Engine = loadModule().sync; Q = loadModule().queue;
  await Q.addQueuedAssessment({ athleteId: 'ath-1', sport: 'Athletics', testType: 'countermovement_jump', idempotencyKey: 'k5' });
  e2 = (await Q.getQueuedAssessments())[0];
  await Q.updateQueuedAssessment(e2.localId, { syncStatus: 'completed' });
  await Q.addQueuedAssessment({ athleteId: 'ath-1', sport: 'Athletics', testType: 'sprint_acceleration', idempotencyKey: 'k6' });
  await Engine.recoverQueuedAssessments();
  const finalQ = await Q.getQueuedAssessments();
  check('completed preserved as completed', finalQ.find(x => x.localId === e2.localId)?.syncStatus === 'completed');
  check('both entries still present (no deletion)', finalQ.length === 2);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('[FATAL]', e); process.exit(1); });
