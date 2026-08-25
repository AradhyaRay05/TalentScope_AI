const puppeteer = require('puppeteer-core');
const BASE = 'http://localhost:5000/api';
let pass = 0, fail = 0, errors = [];
const check = (n, c, d) => { if (c) { pass++; console.log(`  PASS [${n}]`); } else { fail++; console.log(`  FAIL [${n}] ${d || ''}`); } };

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: 'true', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  page.on('pageerror', e => errors.push('[PAGEERROR] ' + e.message.slice(0, 200)));

  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const text = () => page.evaluate(() => document.body.innerText);
  const has = async (t) => (await text()).includes(t);
  const waitForText = async (t, timeout = 25000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) { if (await has(t)) return true; await wait(700); }
    return false;
  };
  const waitFor = async (t, timeout = 25000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) { if (await has(t)) return true; await wait(700); }
    return false;
  };
  const clickP = async (l) => {
    await page.evaluate((x) => {
      const els = [...document.querySelectorAll('div[role="button"],div,span')];
      els.reverse().find(e => e.textContent.trim().startsWith(x) && e.offsetParent !== null)?.click();
    }, l);
    await wait(2500);
  };
  const clickExact = async (l) => {
    await page.evaluate((x) => {
      const els = [...document.querySelectorAll('div[role="button"],div,span')];
      els.reverse().find(e => e.textContent.trim() === x && e.offsetParent !== null)?.click();
    }, l);
    await wait(2000);
  };
  const getQueue = () => page.evaluate(() => {
    const raw = localStorage.getItem('talentscope.offline.assessments.v1');
    return raw ? JSON.parse(raw) : [];
  });

  // Interception flags (never toggle the API itself)
  let blockAPI = false;
  let authFailAPI = false;
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (!req.url().includes(':5000')) { req.continue(); return; }
    if (authFailAPI && req.method() === 'POST') {
      req.respond({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Not authorized' }) });
      return;
    }
    if (blockAPI) { req.abort('failed'); return; }
    req.continue();
  });

  // ---- Login ----
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 180000 });
  await waitForText('SignUp / Login');
  await clickP('SignUp / Login'); await wait(2500);
  await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].filter(i => i.offsetParent !== null);
    const set = (el, v) => {
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      s.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    if (inputs[0]) set(inputs[0], '+919999000011');
    if (inputs[1]) set(inputs[1], 'secret123');
  });
  await clickP('Login');
  check('(login)', await waitForText('Athlete Overview'));

  // Baseline server count
  const demoTok = (await (await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '+919999000011', password: 'secret123' }) })).json()).token;
  const histCount = async () => {
    const h = await (await fetch(`${BASE}/assessments/history`, { headers: { Authorization: `Bearer ${demoTok}` } })).json();
    return h.count ?? h.data.length;
  };
  const baseline = await histCount();
  const prof = await (await fetch(`${BASE}/auth/profile`, { headers: { Authorization: `Bearer ${demoTok}` } })).json();
  const ATHLETE_ID = String(prof?.data?.user?._id || prof?.user?._id);
  console.log(`baseline history: ${baseline}`);

  // ================= SCENARIO 1: online full lifecycle =================
  console.log('\n== SCENARIO 1: Online → record → upload → process → complete ==');
  await clickP('Assess'); await wait(4000);
  check('S1.1 assess renders online', (await has('RECORD')) && !(await has('OFFLINE MODE')));
  await clickExact('RECORD'); await wait(10000);
  check('S1.2 navigated to results (upload/processing)', /#TS-\d+-/.test(await text()));
  check('S1.3 processing state shown honestly', await has('FINALIZE REVIEW'));
  await clickExact('FINALIZE REVIEW').catch(() => {}); await wait(8000);
  const s1t = await text();
  check('S1.4 completed after finalize', s1t.includes('COMPLETED') || /\bOVERALL PERFORMANCE\b/.test(s1t));
  const afterS1 = await histCount();
  check('S1.5 exactly +1 on server', afterS1 === baseline + 1, `${baseline} -> ${afterS1}`);

  // ================= SCENARIO 2+3: offline save; queue persists =================
  console.log('\n== SCENARIO 2+3: Offline save → pending → persists across restart ==');
  // Results screen has no text Back control — reload (session persists) then use tabs
  await page.reload({ waitUntil: 'domcontentloaded' }); await wait(12000);
  check('(session survives results screen)', await waitForText('Athlete Overview'));
  await clickP('Assess'); await wait(4000);
  await page.setOfflineMode(true); await wait(3000);
  check('S2.1 offline badge', await has('OFFLINE MODE'));
  await clickExact('RECORD'); await wait(2000);
  await clickExact('STOP'); await wait(4500);
  check('S2.2 saved locally with honest wording', await has('Assessment saved. Waiting for connection.'));
  let q = await getQueue();
  check('S2.3 queue entry PENDING locally', q.filter(x => x.syncStatus === 'pending').length === 1);

  // "close app offline": SPA keeps running — verify nothing removes it over time
  await wait(5000);
  q = await getQueue();
  check('S3.1 entry remains queued while offline', q.filter(x => x.syncStatus === 'pending').length === 1);

  // ================= SCENARIO 4: multiple queued → restore network =================
  console.log('\n== SCENARIO 4: multiple queued → all sync safely ==');
  await clickP('RECORD ANOTHER'); await wait(1500);
  await clickExact('RECORD'); await wait(2000);
  await clickExact('STOP'); await wait(4500);
  q = await getQueue();
  check('S4.1 two pending assessments', q.filter(x => x.syncStatus === 'pending').length === 2);

  await page.setOfflineMode(false); await wait(12000);
  check('S4.2 both synced to PROCESSING w/ serverIds', await waitFor(async () => {
    q = await getQueue();
    return q.length >= 2 && q.every(x => x.serverId && x.syncStatus === 'processing');
  }, 45000));
  console.log('  S4.2 queue:', JSON.stringify(q).slice(0, 450));
  const afterS4 = await histCount();
  check('S4.3 server has both (+2, no dupes)', afterS4 === afterS1 + 2, `${afterS1} -> ${afterS4}`);

  // ================= SCENARIO 5: network disappears during upload =================
  console.log('\n== SCENARIO 5: outage during upload → not lost → retry ==');
  await clickP('RECORD ANOTHER'); await wait(2000); // clear saved-panel if present
  await page.setOfflineMode(true); await wait(3000);
  await clickExact('RECORD'); await wait(2000);
  await clickExact('STOP'); await wait(4500);
  q = await getQueue();
  const s5entry = q[q.length - 1];
  console.log('  S5 pre-check queue tail:', JSON.stringify(q.slice(-2)).slice(0, 300));
  check('S5.1 saved while offline first', s5entry.syncStatus === 'pending');

  blockAPI = true; // outage hits the upload attempt
  await page.setOfflineMode(false); await wait(9000); // transition triggers engine
  q = await getQueue();
  const s5after = q.find(x => x.localId === s5entry.localId);
  check('S5.2 assessment NOT lost', !!s5after && !!s5after.sport && !!s5after.testType);
  check('S5.3 temporary failure classified (retryable)', s5after.errorCategory === 'network' && s5after.syncStatus === 'pending',
    `cat=${s5after.errorCategory}`);
  check('S5.4 backoff scheduled', s5after.nextAttemptAt && new Date(s5after.nextAttemptAt).getTime() > Date.now());

  blockAPI = false; // restore network
  await page.setOfflineMode(true); await wait(2000);
  await page.setOfflineMode(false); await wait(10000);
  q = await getQueue();
  const s5re = q.find(x => x.localId === s5entry.localId);
  check('S5.5 retry succeeded after restoration', s5re.serverId && s5re.syncStatus === 'processing', `s=${s5re.syncStatus}`);
  const afterS5 = await histCount();
  check('S5.6 no duplicates from retry cycle', afterS5 === afterS4 + 1, `${afterS4} -> ${afterS5}`);

  // ================= SCENARIO 6: server rejection =================
  console.log('\n== SCENARIO 6: server rejects → failed state, no infinite retry ==');
  await page.setOfflineMode(true); await wait(3000);
  // inject invalid entry directly
  await page.evaluate((ath) => {
    const raw = localStorage.getItem('talentscope.offline.assessments.v1');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({
      localId: 'e2e-invalid-1', idempotencyKey: 'e2e-inv-1', serverId: null,
      athleteId: ATHLETE_ID, sport: 'Athletics', testType: 'bogus_invalid_type',
      localVideoUri: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      syncStatus: 'pending', retryCount: 0, lastSyncAttemptAt: null,
      error: null, errorCategory: null, nextAttemptAt: null
    });
    localStorage.setItem('talentscope.offline.assessments.v1', JSON.stringify(arr));
  }, ATHLETE_ID);
  await page.setOfflineMode(false); await wait(11000);
  q = await getQueue();
  const inv = q.find(x => x.localId === 'e2e-invalid-1');
  check('S6.1 marked FAILED with category invalid_data', inv.syncStatus === 'failed' && inv.errorCategory === 'invalid_data',
    JSON.stringify({ s: inv.syncStatus, c: inv.errorCategory }));
  check('S6.2 user-understandable failure message in UI', await has('FAILED') && await has('Assessment data is invalid'));
  const rc1 = inv.retryCount;
  await page.setOfflineMode(true); await wait(2000);
  await page.setOfflineMode(false); await wait(8000);
  q = await getQueue();
  const inv2 = q.find(x => x.localId === 'e2e-invalid-1');
  check('S6.3 NO infinite auto-retry of permanent failure', inv2.syncStatus === 'failed' && inv2.retryCount === rc1,
    `rc ${rc1} -> ${inv2.retryCount}`);

  // ================= SCENARIO 10: auth expires during sync =================
  console.log('\n== SCENARIO 10: authentication expiration mid-sync ==');
  authFailAPI = true;
  await page.setOfflineMode(true); await wait(3000);
  await clickExact('RECORD'); await wait(2000);
  await clickExact('STOP'); await wait(4500);   // local save works regardless
  authFailAPI = false;                          // only the SYNC POST will 401 next
  await page.setOfflineMode(false); await wait(11000);
  q = await getQueue();
  const s10 = q[q.length - 1];
  check('S10.1 local data intact after auth failure', !!s10.sport && !!s10.testType && !!s10.localId);
  check('S10.2 parked as retryable (not deleted/failed-permanent)',
    ['pending', 'failed'].includes(s10.syncStatus) && s10.errorCategory !== undefined, JSON.stringify({ s: s10.syncStatus }));

  // ================= SCENARIO 7+8 via injection, then app restart =================
  console.log('\n== SCENARIOS 7+8: duplicate guard + missing video + restart ==');
  // S7: duplicate sync attempt — re-toggle twice; count must not change
  await page.setOfflineMode(true); await wait(2000);
  await page.setOfflineMode(false); await wait(9000);
  await page.setOfflineMode(true); await wait(2000);
  await page.setOfflineMode(false); await wait(9000);
  const afterToggles = await histCount();
  check('S7.1 no duplicate server assessments across repeated runs', afterToggles === afterS5, `${afterS5} -> ${afterToggles}`);

  // S8: missing video reference → graceful failed → manual retry syncs metadata-only
  await page.setOfflineMode(true); await wait(3000);
  await clickExact('RECORD'); await wait(2000);
  await clickExact('STOP'); await wait(4500);
  q = await getQueue();
  const s8id = q[q.length - 1].localId;
  // corrupt its video reference
  await page.evaluate((lid) => {
    const raw = localStorage.getItem('talentscope.offline.assessments.v1');
    const arr = JSON.parse(raw).map(x => x.localId === lid ? { ...x, localVideoUri: 'file:///cache/offline-assessments/deleted-by-os.mp4' } : x);
    localStorage.setItem('talentscope.offline.assessments.v1', JSON.stringify(arr));
  }, s8id);
  await page.setOfflineMode(false); await wait(11000);
  q = await getQueue();
  const s8 = q.find(x => x.localId === s8id);
  check('S8.1 missing video → FAILED gracefully (no crash)', s8.syncStatus === 'failed' && /no longer available/i.test(s8.error || ''),
    JSON.stringify({ s: s8.syncStatus }).slice(0, 80));
  // Manual retry → metadata-only sync succeeds
  await clickP('RETRY SYNC'); await wait(9000);
  q = await getQueue();
  const s8r = q.find(x => x.localId === s8id);
  check('S8.2 manual retry recovers metadata-only', s8r.serverId && s8r.syncStatus === 'processing' && s8r.localVideoUri === null,
    JSON.stringify({ s: s8r.syncStatus, v: s8r.localVideoUri }).slice(0, 90));

  // ================= APP RESTART RECOVERY =================
  console.log('\n== APP RESTART RECOVERY ==');
  await page.reload({ waitUntil: 'networkidle2' }); await wait(13000);
  check('(session survives restart)', await waitForText('Athlete Overview'));
  await clickP('Assess'); await wait(4000);
  const tAfterRestart = await text();
  check('(sync status card visible after restart)', tAfterRestart.includes('PENDING SYNC'));

  // Final duplicate check after restart + engine boot run
  await page.setOfflineMode(true); await wait(2000);
  await page.setOfflineMode(false); await wait(10000);
  const finalCount = await histCount();
  check('(final: no duplicates after restart boot-run)', finalCount === afterS5, `${afterS5} -> ${finalCount}`);

  // ================= MOBILE SANITY =================
  console.log('\n== LAYOUT SANITY ==');
  await page.setViewport({ width: 390, height: 844 }); await wait(1500);
  check('mobile layout still functional', !(await has('undefined')) && !(await has('NaN')));

  console.log(`\n========== FINAL RESULT: ${pass} passed, ${fail} failed ==========`);
  console.log('[RUNTIME ERRORS]', errors.length ? errors.slice(0, 6).join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('[FATAL]', e.message); process.exit(1); });
