/**
 * STEP 3 verification: finalized risk-visualization data contract.
 * Runs the REAL riskVisualization.ts against real backend response shapes:
 *   - the seeded TS-902-USS document (the only one with heatmap data)
 *   - a real "finalize-path" document (empty spots, default kinematics)
 *   - coach injury-risk endpoint shape (post-passthrough)
 *   - degenerate/missing-field documents
 * Asserts: null behavior, clamping, band edges, placement rules, warning
 * linking, zero-confidence normalization, and that NO mock data is injected.
 */
const path = require('path');
const fs = require('fs');
const { createHarness } = require('./harness.cjs');

// The contract module imports nothing but itself — plain TS load.
const harness = createHarness({
  asyncStorageMock: {}, fsMock: {}, platformOS: 'ios',
  extraPackageMocks: {
    'react-native-svg': {
      __esModule: true, default: 'Svg',
      Svg: 'Svg', Line: 'Line', Circle: 'Circle',
      Defs: 'Defs', RadialGradient: 'RadialGradient', Stop: 'Stop'
    },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons' }
  }
});
const SVC = path.join(__dirname, '..', 'src', 'services');
const contract = harness.loadTs(path.join(SVC, 'riskVisualization'));

let passed = 0, failed = 0;
const results = [];
const check = (name, cond) => { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}`); cond ? passed++ : failed++; };

/* ---------- fixtures: REAL response shapes (from live API, Step 2) -------- */
const SEEDED_DOC = {
  assessmentCode: 'TS-902-USS',
  testType: 'unilateral_squat',
  sport: 'Athletics',
  completedAt: '2026-08-23T06:55:24.000Z',
  injuryRiskClassification: {
    riskStatus: 'Low', riskPercentage: 12, asymmetryScore: 0.4,
    fatigueIndex: 15, jointStress: 10, movementDeficiency: 5
  },
  criticalWarnings: [
    { warningType: 'Right Knee Valgus', severity: 'Critical', angleDeviationDeg: 4.2, phase: 'landing phase', detail: 'Detected 4.2° internal rotation during landing phase.' }
  ],
  heatmapSpots: [
    { joint: 'Right Knee', strainScore: 62, riskColor: '#ff4d4f' },
    { joint: 'Lumbar', strainScore: 38, riskColor: '#faad14' }
  ],
  jointKinematics: {
    kneeFlexionAngle: 128.4, kneeFlexionStatus: 'Optimal', spineAngle: 2.1,
    spineAlignmentStatus: 'Neutral', hipAsymmetryPercentage: 4.2,
    ankleDorsiflexionAngle: 38.5, jointAnglesRaw: {}
  },
  aiMetadata: { confidenceScore: 98.4, modelVersion: 'v2.4-fastapi-mediapipe', analysisTimestamp: '2026-08-23T06:55:24.386Z' },
  aiInsights: ['Optimal pelvic alignment maintained throughout concentric drive.']
};

const FINALIZE_DOC = { // real shape produced by the manual-review finalize path
  assessmentCode: 'TS-546-MNR',
  testType: 'unilateral_squat',
  injuryRiskClassification: { riskStatus: 'Low', riskPercentage: 12, asymmetryScore: 8, fatigueIndex: 15, jointStress: 10, movementDeficiency: 5 },
  criticalWarnings: [],
  heatmapSpots: [],
  jointKinematics: { kneeFlexionAngle: 118, spineAngle: 4.2, hipAsymmetryPercentage: 1.8, ankleDorsiflexionAngle: 35 },
  aiMetadata: { confidenceScore: 0, modelVersion: 'manual-review', analysisTimestamp: '2026-09-03T13:20:12.049Z' },
  aiInsights: ['Optimal pelvic alignment maintained throughout concentric drive.', 'Slight valgus deviation detected during rapid ground impact.']
};

const COACH_ENDPOINT_SHAPE = { // post-passthrough /coaches/me/athletes/:id/injury-risk (REAL shape)
  athleteId: 'a1', athleteName: 'Demo Athlete', source: 'assessment',
  lastAssessmentCode: 'TS-902-USS', testType: 'unilateral_squat', sport: 'Athletics',
  evaluatedAt: '2026-08-23T06:55:24.000Z',
  risk: { level: 'Low', percentage: 12, asymmetryScore: 0.4, fatigueIndex: 15, jointStress: 10, movementDeficiency: 5 },
  criticalWarnings: SEEDED_DOC.criticalWarnings,
  heatmapSpots: SEEDED_DOC.heatmapSpots,
  jointKinematics: SEEDED_DOC.jointKinematics,
  aiMetadata: SEEDED_DOC.aiMetadata,
  aiInsights: SEEDED_DOC.aiInsights
};

(async () => {
  /* ===== 1. Section separation ===== */
  const d = contract.buildRiskVisualization(SEEDED_DOC);
  check('1a. overall section carries the 6 stored scalars',
    d.overall.percentage === 12 && d.overall.level === 'Low' &&
    d.overall.asymmetryScore === 0.4 && d.overall.fatigueIndex === 15 &&
    d.overall.jointStress === 10 && d.overall.movementDeficiency === 5);
  check('1b. joints section has exactly the 2 stored spots (no invented ones)',
    d.joints.length === 2 && d.joints[0].joint === 'Right Knee' && d.joints[1].joint === 'Lumbar');
  check('1c. meta section carries labels + confidence + kinematics + insights',
    d.meta.assessmentCode === 'TS-902-USS' && d.meta.aiConfidence === 98.4 &&
    d.meta.kinematics.kneeFlexionAngleDeg === 128.4 && d.meta.insights.length === 1);
  check('1d. risk value NOT duplicated into joints (joint strainScore is its own stored field)',
    d.joints.every(j => j.strainScore !== d.overall.percentage));

  /* ===== 2. Placement rules (canonical vs fallback) ===== */
  check('2a. "Right Knee" -> canonical mirrored knee position (x < 50 for right, skeleton knee endpoints)',
    d.joints[0].placement === 'canonical' && d.joints[0].cx < 50 && d.joints[0].cy === 100);
  check('2b. "Lumbar" -> canonical torso position',
    d.joints[1].placement === 'canonical' && d.joints[1].cx === 50 && d.joints[1].cy === 75);
  const unknown = contract.buildRiskVisualization({ ...SEEDED_DOC, heatmapSpots: [{ joint: 'Zygapophysial Vault', strainScore: 55 }] });
  check('2c. unknown joint -> fallback placement, still rendered (not dropped, not faked)',
    unknown.joints[0].placement === 'fallback' && unknown.joints[0].cx === 50 && unknown.joints[0].cy === 96);

  /* ===== 3. Severity bands & colors ===== */
  check('3a. band thresholds: 62 -> watch, 38 -> low (as documented)',
    d.joints[0].band === 'watch' && d.joints[1].band === 'low');
  check('3b. stored riskColor wins (colorSource=stored)',
    d.joints[0].color === '#ff4d4f' && d.joints[0].colorSource === 'stored');
  const noColor = contract.buildRiskVisualization({ ...SEEDED_DOC, heatmapSpots: [{ joint: 'Lumbar', strainScore: 80 }] });
  check('3c. missing/invalid riskColor -> derived band color (colorSource=band)',
    noColor.joints[0].colorSource === 'band' && noColor.joints[0].color === '#ff4d4f' && noColor.joints[0].band === 'critical');
  const edges = contract.buildRiskVisualization({
    heatmapSpots: [{ joint: 'Knee', strainScore: 70 }, { joint: 'Spine', strainScore: 40 }, { joint: 'Hip', strainScore: 39.9 }]
  });
  check('3d. band edges: >=70 critical, >=40 watch, <40 low',
    edges.joints[0].band === 'critical' && edges.joints[1].band === 'watch' && edges.joints[2].band === 'low');

  /* ===== 4. Clamping & null behavior ===== */
  const clamped = contract.buildRiskVisualization({
    heatmapSpots: [{ joint: 'Knee', strainScore: 250 }, { joint: 'Spine', strainScore: -5 }]
  });
  check('4a. out-of-range strain clamped to 0..100 with clamped flag + raw preserved',
    clamped.joints[0].strainScore === 100 && clamped.joints[0].clamped === true && clamped.joints[0].rawStrainScore === 250 &&
    clamped.joints[1].strainScore === 0 && clamped.joints[1].clamped === true);
  const broken = contract.buildRiskVisualization({
    heatmapSpots: [{ joint: 'Knee' }, { joint: null, strainScore: 50 }]
  });
  check('4b. non-numeric strain -> 0 + clamped flag; null joint -> "Unlabeled joint"',
    broken.joints[0].strainScore === 0 && broken.joints[0].clamped === true &&
    broken.joints[1].joint === 'Unlabeled joint');
  const sparse = contract.buildRiskVisualization({});
  check('4c. empty document -> all overall scalars null, joints [], hasJointLevelData false',
    sparse.overall.percentage === null && sparse.overall.level === null &&
    sparse.joints.length === 0 && sparse.warnings.length === 0 && sparse.hasJointLevelData === false);
  const nullish = contract.buildRiskVisualization({
    injuryRiskClassification: { riskStatus: 'Extreme', riskPercentage: 'x', fatigueIndex: NaN }
  });
  check('4d. unknown level string + non-numeric scalars -> null (render "--")',
    nullish.overall.level === null && nullish.overall.percentage === null && nullish.overall.fatigueIndex === null);

  /* ===== 5. Warning normalization + joint linking ===== */
  check('5a. warning fields preserved verbatim',
    d.warnings[0].warningType === 'Right Knee Valgus' && d.warnings[0].severity === 'Critical' &&
    d.warnings[0].angleDeviationDeg === 4.2 && d.warnings[0].phase === 'landing phase');
  check('5b. "Right Knee" spot links the "Right Knee Valgus" warning by name',
    d.joints[0].relatedWarnings.includes('Right Knee Valgus') && d.joints[1].relatedWarnings.length === 0);

  /* ===== 6. Zero-confidence normalization (manual review) ===== */
  const fin = contract.buildRiskVisualization(FINALIZE_DOC);
  check('6a. finalize-path doc: aiConfidence 0 -> null (honest "no AI confidence")',
    fin.meta.aiConfidence === null && fin.meta.aiModelVersion === 'manual-review');
  check('6b. finalize-path doc: empty spots -> hasJointLevelData false (NO mock injected)',
    fin.joints.length === 0 && fin.hasJointLevelData === false);
  check('6c. finalize-path doc: default kinematics still passed through as stored',
    fin.meta.kinematics.kneeFlexionAngleDeg === 118 && fin.meta.kinematics.spineAngleDeg === 4.2);

  /* ===== 7. Coach endpoint adapter compatibility ===== */
  const cd = contract.buildRiskVisualization(COACH_ENDPOINT_SHAPE);
  check('7a. coach injury-risk response (post-passthrough) feeds the SAME contract',
    cd.overall.percentage === 12 && cd.joints.length === 2 &&
    cd.joints[0].joint === 'Right Knee' && cd.meta.assessmentCode === 'TS-902-USS');
  check('7b. contract output identical for assessment-doc vs coach-shape inputs (same data)',
    JSON.stringify(cd.joints) === JSON.stringify(d.joints) && JSON.stringify(cd.overall) === JSON.stringify(d.overall));

  /* ===== 8. PostureHeatmap builders delegate to the contract ===== */
  const components = harness.loadTs(path.join(__dirname, '..', 'src', 'components', 'PostureHeatmap'));
  const spots = components.buildHeatmapSpotsFromAssessment(SEEDED_DOC);
  check('8a. buildHeatmapSpotsFromAssessment -> contract-driven spots with severity bands',
    spots.length === 2 && spots[0].severity === 'watch' && spots[0].cx === d.joints[0].cx && spots[0].joint === 'Right Knee');
  const emptySpots = components.buildHeatmapSpotsFromAssessment(FINALIZE_DOC);
  check('8b. empty heatmapSpots -> [] (no mock DEFAULT_SPOTS injection)',
    emptySpots.length === 0);
  const findings = components.buildFindingsFromAssessment(SEEDED_DOC);
  check('8c. findings built from real warnings (no DEFAULT_FINDINGS)',
    findings.length === 1 && findings[0].title === 'Right Knee Valgus' && findings[0].tagText === 'CRITICAL WARNING');
  const emptyFindings = components.buildFindingsFromAssessment(FINALIZE_DOC);
  check('8d. no warnings -> honest NO FINDINGS placeholder (not the old mock card)',
    emptyFindings.length === 1 && emptyFindings[0].tagText === 'NO FINDINGS');

  /* ===== 9. No AI computation on the frontend ===== */
  const input = { ...SEEDED_DOC, injuryRiskClassification: { ...SEEDED_DOC.injuryRiskClassification } };
  const out = contract.buildRiskVisualization(input);
  check('9. contract never mutates or recomputes the source document',
    JSON.stringify(input) === JSON.stringify({ ...SEEDED_DOC, injuryRiskClassification: { ...SEEDED_DOC.injuryRiskClassification } }) &&
    out.overall.percentage === input.injuryRiskClassification.riskPercentage);

  /* ===== 10. Determinism: same response -> same visualization, always ===== */
  const runA = JSON.stringify(contract.buildRiskVisualization(SEEDED_DOC));
  const runB = JSON.stringify(contract.buildRiskVisualization(JSON.parse(JSON.stringify(SEEDED_DOC))));
  const runC = JSON.stringify(contract.buildRiskVisualization({
    ...SEEDED_DOC,
    heatmapSpots: [...SEEDED_DOC.heatmapSpots].reverse()
  }));
  check('10a. identical input -> byte-identical output across runs', runA === runB);
  check('10b. builder is order-preserving and input-order deterministic (reversed input -> reversed markers)',
    JSON.parse(runC).joints[0].joint === 'Lumbar' && JSON.parse(runA).joints[0].joint === 'Right Knee');

  /* ===== 11. Multiple affected regions ===== */
  const MULTI_DOC = {
    assessmentCode: 'TS-MULTI', testType: 'landing_mechanics',
    injuryRiskClassification: { riskStatus: 'High', riskPercentage: 78, asymmetryScore: 61, fatigueIndex: 55, jointStress: 83, movementDeficiency: 70 },
    criticalWarnings: [
      { warningType: 'Right Knee Valgus', severity: 'Critical', angleDeviationDeg: 6.1, phase: 'landing phase', detail: 'Valgus collapse on landing.' },
      { warningType: 'Lumbar Shear', severity: 'Moderate', angleDeviationDeg: 3.0, phase: 'drive phase', detail: 'Shear detected.' },
      { warningType: 'Left Ankle Instability', severity: 'Low', angleDeviationDeg: 1.2, phase: 'landing phase', detail: 'Mild inversion.' }
    ],
    heatmapSpots: [
      { joint: 'Right Knee', strainScore: 88, riskColor: '#ff4d4f' },
      { joint: 'Lumbar', strainScore: 52 },
      { joint: 'Left Ankle', strainScore: 21, riskColor: 'not-a-color' },
      { joint: 'Mystery Region', strainScore: 64 }
    ]
  };
  const multi = contract.buildRiskVisualization(MULTI_DOC);
  check('11a. four spots -> four markers, every band represented',
    multi.joints.length === 4 &&
    multi.joints.find(j => j.joint === 'Right Knee').band === 'critical' &&
    multi.joints.find(j => j.joint === 'Lumbar').band === 'watch' &&
    multi.joints.find(j => j.joint === 'Left Ankle').band === 'low');
  check('11b. side mirroring: left ankle mirrors the right-side base (cx > 50)',
    multi.joints.find(j => j.joint === 'Left Ankle').placement === 'canonical' &&
    multi.joints.find(j => j.joint === 'Left Ankle').cx > 50);
  check('11c. unknown "Mystery Region" -> fallback placement, kept in list',
    multi.joints.find(j => j.joint === 'Mystery Region').placement === 'fallback');
  check('11d. each warning links its matching joint spot',
    multi.joints.find(j => j.joint === 'Right Knee').relatedWarnings.includes('Right Knee Valgus') &&
    multi.joints.find(j => j.joint === 'Lumbar').relatedWarnings.includes('Lumbar Shear') &&
    multi.joints.find(j => j.joint === 'Left Ankle').relatedWarnings.includes('Left Ankle Instability'));
  check('11e. invalid stored color falls back to band color with colorSource=band',
    multi.joints.find(j => j.joint === 'Left Ankle').colorSource === 'band');
  check('11f. overall High/78 carried through untouched',
    multi.overall.level === 'High' && multi.overall.percentage === 78);

  /* ===== 12. Reusable factor builder (athlete + coach share it) ===== */
  const factors = contract.buildRiskFactors(SEEDED_DOC);
  check('12a. four factor cards with badges/percents identical to legacy rendering',
    factors.length === 4 &&
    factors[0].title === 'Asymmetry' && factors[0].badge === '0.4/100' && factors[0].percent === 0.4 &&
    factors[1].title === 'Fatigue' && factors[1].badge === '15/100' && factors[1].percent === 15 &&
    factors[2].title === 'Joint Stress' && factors[2].badge === '10/100' &&
    factors[3].title === 'Movement Deficiency' && factors[3].badge === '5/100');
  check('12b. icons preserved for both screens (balance/bolt/fitness-center/speed)',
    factors.map(f => f.icon).join(',') === 'balance,bolt,fitness-center,speed');
  check('12c. missing scalars -> "--/100" badges + 0 bars + hasData=false, card kept',
    (() => {
      const f = contract.buildRiskFactors({ injuryRiskClassification: { riskStatus: 'Low', riskPercentage: 12 } });
      return f.length === 4 && f.every(x => x.badge === '--/100' && x.percent === 0 && x.hasData === false);
    })());
  check('12d. no classification at all -> [] (screens empty-state path)',
    contract.buildRiskFactors({}).length === 0 &&
    contract.buildRiskFactors({ injuryRiskClassification: null }).length === 0);
  check('12e. coach /overview shape (nested latest doc) feeds the same builder',
    contract.buildRiskFactors({ latestAssessment: SEEDED_DOC }).length === 0);

  /* ===== 13. Insight + exercise builders (verbatim backend text) ===== */
  const insights = contract.buildRiskInsights(SEEDED_DOC);
  check('13a. insight tone mapping mirrors legacy severity rendering',
    insights.length === 1 && insights[0].tone === 'critical' &&
    insights[0].title === 'Right Knee Valgus' &&
    insights[0].body === 'Detected 4.2° internal rotation during landing phase.');
  const insightsMixed = contract.buildRiskInsights({
    criticalWarnings: [
      { warningType: 'A', severity: 'Low', detail: 'd1' },
      { warningType: 'B', severity: 'Moderate', detail: 'd2' },
      { warningType: 'C', severity: 'Weird', detail: 'd3' }
    ]
  });
  check('13b. tones: Low->ok, Moderate->warning, unknown->warning (never crash)',
    insightsMixed.map(i => i.tone).join(',') === 'ok,warning,warning');
  const insightsSparse = contract.buildRiskInsights(MULTI_DOC);
  check('13e. phase/angle fragments still appended when the stored detail omits them',
    insightsSparse.length === 3 &&
    insightsSparse[0].body === 'Valgus collapse on landing. • Detected during landing phase (6.1° deviation)' &&
    insightsSparse[1].body === 'Shear detected. • Detected during drive phase (3° deviation)' &&
    insightsSparse[2].body === 'Mild inversion. • Detected during landing phase (1.2° deviation)');
  const exercises = contract.buildExerciseList(SEEDED_DOC);
  check('13c. exercises: [] when backend sent none (no fabrication)',
    Array.isArray(exercises) && exercises.length === 0);
  const ex2 = contract.buildExerciseList({ recommendations: [{ title: 'X', sets: '2 Sets' }] });
  check('13d. exercise defaults mirror legacy rendering ("3 Sets" fallback only for missing fields)',
    ex2.length === 1 && ex2[0].name === 'X' && ex2[0].detail === '2 Sets • 15 Reps');

  /* ===== 14. Overall source tracking + profile mirror ===== */
  const srcAssess = contract.buildRiskVisualization(SEEDED_DOC);
  check('14a. source=assessment when classification present', srcAssess.overall.source === 'assessment');
  const srcMirror = contract.buildRiskVisualization({}, { currentInjuryRiskPercentage: 22, currentInjuryRiskLevel: 'Moderate' });
  check('14b. source=profile-mirror when only the User mirror has values (gauge fallback preserved)',
    srcMirror.overall.source === 'profile-mirror' && srcMirror.overall.percentage === 22 && srcMirror.overall.level === 'Moderate');
  const srcNone = contract.buildRiskVisualization({});
  check('14c. source=none when nothing exists (empty gauge state preserved)',
    srcNone.overall.source === 'none' && srcNone.overall.percentage === null && srcNone.overall.level === null);
  const srcPerField = contract.buildRiskVisualization(
    { injuryRiskClassification: { riskStatus: null, riskPercentage: null, asymmetryScore: 8, fatigueIndex: 15, jointStress: 10, movementDeficiency: 5 } },
    { currentInjuryRiskPercentage: 22, currentInjuryRiskLevel: 'Moderate' }
  );
  check('14d. per-field mirror fallback matches legacy gauge logic (pct 22, level Moderate, scalars from doc)',
    srcPerField.overall.percentage === 22 && srcPerField.overall.level === 'Moderate' &&
    srcPerField.overall.asymmetryScore === 8 && srcPerField.overall.source === 'assessment');

  /* ===== 15. Step 5: legend derivation + diagram states (rendered via SSR) ===== */
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const decodeEntities = (s) => String(s).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  const render = (el) => decodeEntities(renderToStaticMarkup(el));

  const legendSeeded = components.buildLegendItems(spots);
  check('15a. seeded spots -> legend rows watch x1 + low x1, critical omitted (no x0 noise)',
    legendSeeded.length === 2 &&
    legendSeeded.some(i => i.band === 'watch' && i.label === 'WATCH' && i.count === 1) &&
    legendSeeded.some(i => i.band === 'low' && i.label === 'LOW STRAIN' && i.count === 1));
  check('15b. empty spots -> no legend rows (nothing to explain)',
    components.buildLegendItems([]).length === 0 && components.buildLegendItems(null).length === 0);
  const multiSpots = components.buildHeatmapSpotsFromAssessment(MULTI_DOC);
  const legendMulti = components.buildLegendItems(multiSpots);
  check('15c. multi-band doc -> one row per present band with honest counts',
    legendMulti.length === 3 &&
    legendMulti.find(i => i.band === 'critical').count === 1 &&
    legendMulti.find(i => i.band === 'watch').count === 2 &&
    legendMulti.find(i => i.band === 'low').count === 1);

  const legendMarkup = render(React.createElement(components.HeatmapLegend, { spots: multiSpots }));
  check('15d. HeatmapLegend renders band labels with counts',
    legendMarkup.includes('CRITICAL ×1') && legendMarkup.includes('WATCH ×2') && legendMarkup.includes('LOW STRAIN ×1'));
  check('15e. HeatmapLegend renders nothing when no markers exist',
    render(React.createElement(components.HeatmapLegend, { spots: [] })) === '');

  const emptyReady = render(React.createElement(components.BodyHeatmap, { spots: [], state: 'ready', emptyMessage: 'COMPLETE AN ASSESSMENT TO SEE YOUR JOINT HEATMAP' }));
  check('15f. ready + no spots -> honest empty caption, no markers',
    emptyReady.includes('COMPLETE AN ASSESSMENT TO SEE YOUR JOINT HEATMAP') && !emptyReady.includes('url(#'));
  const processing = render(React.createElement(components.BodyHeatmap, { spots: [], state: 'processing' }));
  check('15g. processing -> ANALYSIS IN PROGRESS overlay (no fake ready state)',
    processing.includes('ANALYSIS IN PROGRESS'));
  const loading = render(React.createElement(components.BodyHeatmap, { spots: [], state: 'loading' }));
  check('15h. loading -> loading caption (never a blank frame)',
    loading.includes('LOADING HEATMAP'));
  const errMarkup = render(React.createElement(components.BodyHeatmap, { spots: [], state: 'error', errorMessage: 'boom', onRetry: () => {} }));
  check('15i. error -> message + RETRY affordance',
    errMarkup.includes('boom') && errMarkup.includes('RETRY'));

  const glowMarkup = render(React.createElement(components.BodyHeatmap, { spots: multiSpots, state: 'ready' }));
  check('15j. every band gets its own radial glow gradient (severity-proportional heat)',
    glowMarkup.includes('-critical') && glowMarkup.includes('-watch') && glowMarkup.includes('-low') &&
    (glowMarkup.match(/RadialGradient/g) || []).length >= 3);

  const cardProcessing = render(React.createElement(components.default, { spots: [], findings: [], state: 'processing', height: 320 }));
  check('15k. PostureHeatmap forwards processing state to the diagram',
    cardProcessing.includes('ANALYSIS IN PROGRESS'));
  const cardError = render(React.createElement(components.default, { spots: [], findings: [], state: 'error', errorMessage: 'net down', onRetry: () => {} }));
  check('15l. PostureHeatmap forwards error state + retry',
    cardError.includes('net down') && cardError.includes('RETRY'));

  console.log('\n=== STEP 3: Risk-Visualization Contract - verification ===');
  results.forEach(r => console.log(r));
  console.log(`---\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => {
  results.push('CRASH ' + (e?.stack || e));
  console.log('\n=== STEP 3: Risk-Visualization Contract - verification ===');
  results.forEach(r => console.log(r));
  console.log(`---\n${passed} passed, ${failed} failed`);
  process.exit(1);
});
