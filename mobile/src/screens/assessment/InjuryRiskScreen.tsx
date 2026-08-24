import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme/colors';
import { CONTAINER_MAX } from '../../theme/useResponsive';
import CircularScoreGauge from '../../components/CircularScoreGauge';
import { getProfile, getLatestAssessment } from '../../services/api';

const POSE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7j8p7NlraUHdQtInbPd90itWAhI1-i8THBDHNUPzFgAKBjxgJ_P6DxAugRfksr0tx75GYq2zDxH-fyuOOTtJoHTHazf4hSuQBsDJXW4Q01aJjFvpqcSmXFSfgiaRJr6osJvUp5KohAumvIpBN4JX6HP4QT8q4rGmWMtlp3n7Buf-2XU2DPTK2j95qk2vXe7TPYtOtf_Cs4lcpsHIRpwClppGuY4UYbwmA9kLWsPaY99UF1fI-Z61x3h6pOhIQgrklAKQd0skVbKY';

type RiskFactor = {
  icon: 'balance' | 'bolt' | 'fitness-center' | 'speed';
  badge: string;
  title: string;
  body: string;
  percent: number;
};

type Insight = {
  icon: 'error' | 'warning' | 'check-circle';
  color: string;
  title: string;
  body: string;
};

type Exercise = { name: string; detail: string };

export default function InjuryRiskScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isMd = width >= 768;
  const isLg = width >= 1024;
  const padH = isMd ? Spacing.marginDesktop : Spacing.marginMobile;
  const container = { alignSelf: 'center' as const, width: '100%' as const, maxWidth: CONTAINER_MAX };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [latest, setLatest] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, latestRes] = await Promise.all([getProfile(), getLatestAssessment()]);
      setProfile(profileRes?.user || profileRes?.data || null);
      setLatest(latestRes?.data ?? null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load injury risk data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const risk = latest?.injuryRiskClassification || null;
  const riskPct: number | null =
    typeof risk?.riskPercentage === 'number'
      ? risk.riskPercentage
      : typeof profile?.currentInjuryRiskPercentage === 'number'
        ? profile.currentInjuryRiskPercentage
        : null;
  const riskLevel: string | null = risk?.riskStatus || profile?.currentInjuryRiskLevel || null;

  const factors: RiskFactor[] = risk
    ? [
        {
          icon: 'balance',
          badge: `${typeof risk.asymmetryScore === 'number' ? risk.asymmetryScore : '--'}/100`,
          title: 'Asymmetry',
          body: 'Left-to-right force distribution in kinetic chain transitions.',
          percent: typeof risk.asymmetryScore === 'number' ? risk.asymmetryScore : 0
        },
        {
          icon: 'bolt',
          badge: `${typeof risk.fatigueIndex === 'number' ? risk.fatigueIndex : '--'}/100`,
          title: 'Fatigue',
          body: 'Neural drive efficiency and metabolic recovery index.',
          percent: typeof risk.fatigueIndex === 'number' ? risk.fatigueIndex : 0
        },
        {
          icon: 'fitness-center',
          badge: `${typeof risk.jointStress === 'number' ? risk.jointStress : '--'}/100`,
          title: 'Joint Stress',
          body: 'Compressive load monitoring at knees, ankles, and lumbar.',
          percent: typeof risk.jointStress === 'number' ? risk.jointStress : 0
        },
        {
          icon: 'speed',
          badge: `${typeof risk.movementDeficiency === 'number' ? risk.movementDeficiency : '--'}/100`,
          title: 'Movement Deficiency',
          body: 'Kinetic deviations from elite-level performance baselines.',
          percent: typeof risk.movementDeficiency === 'number' ? risk.movementDeficiency : 0
        }
      ]
    : [];

  const insights: Insight[] = (latest?.criticalWarnings || []).map((w: any) => ({
    icon: w.severity === 'Critical' ? ('error' as const) : w.severity === 'Moderate' ? ('warning' as const) : ('check-circle' as const),
    color: w.severity === 'Critical' ? Colors.error : Colors.secondary,
    title: w.warningType,
    body: `${w.detail}${w.phase ? ` • Detected during ${w.phase}` : ''}${
      typeof w.angleDeviationDeg === 'number' && w.angleDeviationDeg !== 0
        ? ` (${Math.abs(w.angleDeviationDeg)}° deviation)`
        : ''
    }`
  }));

  const exercises: Exercise[] = (latest?.recommendations || []).map((r: any) => ({
    name: r.title,
    detail: `${r.sets || '3 Sets'} • ${r.reps || '15 Reps'}${r.priority ? ` • ${r.priority} priority` : ''}`
  }));

  const kinematics = latest?.jointKinematics || null;

  const grid = (nodes: React.ReactNode[], cols: number, gap: number) => {
    if (cols <= 1) return <View style={{ gap }}>{nodes}</View>;
    const rows: React.ReactNode[][] = [];
    for (let i = 0; i < nodes.length; i += cols) rows.push(nodes.slice(i, i + cols));
    return (
      <View>
        {rows.map((row, ri) => (
          <View
            key={ri}
            style={{ flexDirection: 'row', gap, marginBottom: ri < rows.length - 1 ? gap : 0 }}
          >
            {row.map((node, ci) => (
              <View key={ci} style={{ flex: 1 }}>
                {node}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderFactor = (f: RiskFactor) => (
    <View key={f.title} style={[styles.factorCard, isMd && { width: '100%' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={styles.factorIconBox}>
          <Icon name={f.icon} size={26} color={Colors.secondary} />
        </View>
        <Text style={styles.factorBadge}>{f.badge}</Text>
      </View>
      <Text style={styles.factorTitle}>{f.title}</Text>
      <Text style={styles.factorBody}>{f.body}</Text>
      <View style={styles.factorTrack}>
        <View style={[styles.factorFill, { width: `${Math.min(Math.max(f.percent, 0), 100)}%` }]} />
      </View>
    </View>
  );

  const renderExercise = (ex: Exercise) => (
    <TouchableOpacity key={ex.name} style={[styles.exerciseCard, isMd && { width: '100%' }]} activeOpacity={0.8}>
      <View style={styles.exerciseIconBox}>
        <Icon name="fitness-center" size={26} color={Colors.secondary} />
      </View>
      <View>
        <Text style={styles.exerciseName}>{ex.name}</Text>
        <Text style={styles.exerciseDetail}>{ex.detail}</Text>
      </View>
    </TouchableOpacity>
  );

  const gaugeCard = (
    <View style={[styles.card, isMd && { flex: 1, justifyContent: 'center' }]}>
      <View style={styles.riskTopAccent} />
      <Text style={[Typography.labelCaps, { fontSize: 10, color: Colors.outline, textAlign: 'center', marginBottom: Spacing.md }]}>
        OVERALL RISK STATUS
      </Text>
      {riskPct === null ? (
        <View style={styles.gaugeEmpty}>
          <Text style={[styles.riskScore, { fontSize: 44 }]}>--</Text>
          <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: Spacing.base }]}>
            Complete an assessment to compute injury risk
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Assess' })}
          >
            <Text style={styles.emptyBtnText}>Start Assessment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <CircularScoreGauge size={192} strokeWidth={12} score={riskPct} progressColor={Colors.onTertiaryContainer} rotate>
            <Text style={styles.riskScore}>{riskPct}%</Text>
            <Text style={styles.riskScoreLabel}>PREDICTION SCORE</Text>
          </CircularScoreGauge>
          {riskLevel && (
            <View
              style={[
                styles.lowPill,
                riskLevel === 'High' && styles.highPill,
                riskLevel === 'Moderate' && styles.moderatePill
              ]}
            >
              <Text style={[styles.lowPillText, riskLevel !== 'Low' && { color: Colors.onSurface }]}>{riskLevel}</Text>
            </View>
          )}
          <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: Spacing.base, marginTop: Spacing.md }]}>
            {latest
              ? `Based on ${latest.testType || 'your most recent'} assessment ${latest.assessmentCode || ''}`.trim()
              : 'Based on your most recent completed assessment.'}
          </Text>
        </>
      )}
    </View>
  );

  const biometricCard = (
    <View style={[styles.biometricCard, isLg && { flex: 1 }]}>
      <View style={styles.overlayTagWrap}>
        <Text style={styles.overlayTag}>LIVE BIOMETRIC OVERLAY</Text>
      </View>
      <View style={styles.metricChipsRow}>
        <View style={styles.metricChip}>
          <Text style={styles.metricChipLabel}>KNEE ANGLE</Text>
          <Text style={styles.metricChipValue}>
            {kinematics && typeof kinematics.kneeFlexionAngle === 'number' ? `${kinematics.kneeFlexionAngle}°` : '--'}
          </Text>
        </View>
        <View style={styles.metricChip}>
          <Text style={styles.metricChipLabel}>SPINE ANGLE</Text>
          <Text style={styles.metricChipValue}>
            {kinematics && typeof kinematics.spineAngle === 'number' ? `${kinematics.spineAngle}°` : '--'}
          </Text>
        </View>
      </View>
      <View style={styles.poseArea}>
        <ImageBackground source={{ uri: POSE_IMG }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <Svg viewBox="0 0 1000 600" style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
          <Line x1="450" y1="180" x2="420" y2="280" stroke="#57dffe" strokeWidth={2} strokeOpacity={0.5} />
          <Line x1="550" y1="180" x2="580" y2="280" stroke="#57dffe" strokeWidth={2} strokeOpacity={0.5} />
          <Line x1="500" y1="180" x2="500" y2="350" stroke="#57dffe" strokeWidth={2} strokeOpacity={0.5} />
          <Line x1="500" y1="350" x2="460" y2="480" stroke="#57dffe" strokeWidth={2} strokeOpacity={0.5} />
          <Line x1="500" y1="350" x2="540" y2="480" stroke="#57dffe" strokeWidth={2} strokeOpacity={0.5} />
          {[
            [500, 150],
            [450, 180],
            [550, 180],
            [500, 350],
            [460, 480],
            [540, 480]
          ].map(([cx, cy], i) => (
            <Circle key={`joint-${i}`} cx={cx} cy={cy} r={4} fill="#ffffff" stroke="#57dffe" strokeWidth={1} />
          ))}
        </Svg>
      </View>
    </View>
  );

  const insightsCard = (
    <View style={[styles.card, styles.insightsAlign, isLg && { flex: 1 }]}>
      <Text style={[Typography.headlineMd, { fontSize: 20, lineHeight: 26, marginBottom: Spacing.md }]}>
        Preventive Insights
      </Text>
      {insights.length ? (
        <View style={{ gap: Spacing.md }}>
          {insights.map(ins => (
            <View key={ins.title} style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Icon name={ins.icon} size={18} color={ins.color} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>{ins.title}</Text>
                <Text style={styles.insightBody}>{ins.body}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.dashedPlaceholder, { alignSelf: 'stretch' }]}>
          <Text style={styles.emptyBody}>No critical warnings recorded in your latest assessment.</Text>
        </View>
      )}
    </View>
  );

  const eliteCard = (
    <View style={styles.eliteCard}>
      <View style={styles.eliteWatermark}>
        <Icon name="medical-services" size={130} color="rgba(255,255,255,0.1)" />
      </View>
      <Text style={[Typography.labelCaps, { color: Colors.secondaryContainer, marginBottom: Spacing.xs }]}>
        TALENT SCOPE AI ELITE
      </Text>
      <Text style={[Typography.headlineMd, { fontSize: 20, lineHeight: 26, marginBottom: Spacing.base }]}>
        Customized Protocols
      </Text>
      <Text style={styles.eliteBody}>
        Unlock medical-grade corrective programs tailored to your specific biomechanical profile.
      </Text>
      <TouchableOpacity
        style={styles.viewExercisesBtn}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
      >
        <Text style={styles.viewExercisesText}>Find a Coach</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingHorizontal: padH }]}>
        <Text style={styles.brand}>TalentScope AI</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={container}>
            <View style={[styles.pageHeader, { paddingHorizontal: padH }]}>
              {isMd ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.labelCaps, { color: Colors.secondary, marginBottom: Spacing.xs }]}>
                      PERFORMANCE INSIGHTS
                    </Text>
                    <Text style={[Typography.headlineLg, { color: Colors.primary }]}>Injury Risk Analysis</Text>
                    <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, marginTop: 4, maxWidth: 576 }]}>
                      AI-driven biometric screening of musculoskeletal vulnerabilities and load-bearing fatigue markers.
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <TouchableOpacity style={[styles.exportBtn, { flex: 0, paddingHorizontal: Spacing.md }]} activeOpacity={0.85}>
                      <Icon name="download" size={18} color={Colors.onSurface} />
                      <Text style={styles.exportText}>Export Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.consultBtn, { flex: 0, paddingHorizontal: Spacing.md }]}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
                    >
                      <Icon name="support-agent" size={18} color={Colors.onSecondaryContainer} />
                      <Text style={styles.consultText}>Coach Consultation</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={[Typography.labelCaps, { color: Colors.secondary, marginBottom: Spacing.xs }]}>
                    PERFORMANCE INSIGHTS
                  </Text>
                  <Text style={[Typography.headlineLgMobile, { color: Colors.primary }]}>Injury Risk Analysis</Text>
                  <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, marginTop: 4 }]}>
                    AI-driven biometric screening of musculoskeletal vulnerabilities and load-bearing fatigue markers.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
                    <TouchableOpacity style={styles.exportBtn} activeOpacity={0.85}>
                      <Icon name="download" size={18} color={Colors.onSurface} />
                      <Text style={styles.exportText}>Export Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.consultBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
                    >
                      <Icon name="support-agent" size={18} color={Colors.onSecondaryContainer} />
                      <Text style={styles.consultText}>Coach Consultation</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <View style={{ paddingHorizontal: padH, gap: Spacing.gutter }}>
              {error && (
                <View style={styles.errorBanner}>
                  <Icon name="error-outline" size={18} color={Colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={fetchData} activeOpacity={0.85}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isMd ? (
                <>
                  <View style={{ flexDirection: 'row', gap: Spacing.gutter, alignItems: 'stretch' }}>
                    <View style={{ flex: isLg ? 4 : 5 }}>{gaugeCard}</View>
                    <View style={{ flex: isLg ? 8 : 7 }}>
                      {factors.length ? (
                        grid(factors.map(renderFactor), 2, Spacing.gutter)
                      ) : (
                        <View style={[styles.card, { justifyContent: 'center' }]}>
                          <Text style={styles.emptyBody}>No injury risk breakdown available yet.</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {isLg ? (
                    <View style={{ flexDirection: 'row', gap: Spacing.gutter, alignItems: 'stretch' }}>
                      <View style={{ flex: 8 }}>{biometricCard}</View>
                      <View style={{ flex: 4, gap: Spacing.gutter }}>
                        {insightsCard}
                        {eliteCard}
                      </View>
                    </View>
                  ) : (
                    <>
                      {biometricCard}
                      <View style={{ gap: Spacing.gutter }}>
                        {insightsCard}
                        {eliteCard}
                      </View>
                    </>
                  )}

                  {exercises.length > 0 && (
                    <View style={{ marginTop: Spacing.base }}>
                      {grid(exercises.map(renderExercise), 3, Spacing.gutter)}
                    </View>
                  )}
                </>
              ) : (
                <>
                  {gaugeCard}

                  {factors.length ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gutter }}>
                      {factors.map(renderFactor)}
                    </View>
                  ) : (
                    <View style={styles.dashedPlaceholder}>
                      <Text style={styles.emptyBody}>No injury risk breakdown available yet.</Text>
                    </View>
                  )}

                  {biometricCard}

                  <View style={{ gap: Spacing.gutter }}>
                    {insightsCard}
                    {eliteCard}
                  </View>

                  {exercises.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gutter, marginTop: Spacing.base }}>
                      {exercises.map(renderExercise)}
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 44,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.marginMobile,
    backgroundColor: 'rgba(247,249,251,0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.15)'
  },
  brand: { ...Typography.headlineMd, letterSpacing: -0.8, color: Colors.primary },
  pageHeader: { paddingHorizontal: Spacing.marginMobile, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.35)',
    borderRadius: 8,
    paddingVertical: Spacing.sm
  },
  exportText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  consultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 8,
    paddingVertical: Spacing.sm
  },
  consultText: { fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700', color: Colors.onSecondaryContainer },
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4
  },
  insightsAlign: { alignItems: 'flex-start' },
  riskTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.onTertiaryContainer
  },
  riskScore: { ...Typography.displayHero, fontSize: 44, lineHeight: 50, letterSpacing: -1.6, color: Colors.primary },
  riskScoreLabel: { ...Typography.labelCaps, fontSize: 9, color: Colors.onSurfaceVariant, marginTop: Spacing.xs },
  gaugeEmpty: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8
  },
  emptyBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, fontWeight: '700', color: '#ffffff' },
  dashedPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(198,198,205,0.5)',
    borderRadius: 12,
    padding: Spacing.md
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorContainer,
    borderRadius: 10,
    padding: Spacing.base
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.error },
  retryBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: 6
  },
  retryText: { fontFamily: 'Inter_700Bold', fontSize: 12, fontWeight: '700', color: '#ffffff' },
  lowPill: {
    backgroundColor: 'rgba(0,152,68,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    marginTop: Spacing.sm
  },
  moderatePill: { backgroundColor: 'rgba(230,179,25,0.15)' },
  highPill: { backgroundColor: 'rgba(186,26,26,0.12)' },
  lowPillText: { ...Typography.headlineMd, fontSize: 20, lineHeight: 26, fontWeight: '700', color: Colors.onTertiaryContainer },
  factorCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3
  },
  factorIconBox: {
    padding: Spacing.base,
    borderRadius: 10,
    backgroundColor: 'rgba(87,223,254,0.2)'
  },
  factorBadge: { ...Typography.monoData, color: Colors.onTertiaryContainer },
  factorTitle: { ...Typography.headlineMd, fontSize: 19, lineHeight: 25, marginTop: Spacing.base, marginBottom: Spacing.xs },
  factorBody: { ...Typography.bodyMd, fontSize: 13, lineHeight: 20, color: Colors.onSurfaceVariant, marginBottom: Spacing.md },
  factorTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden'
  },
  factorFill: { height: '100%', backgroundColor: Colors.onTertiaryContainer, borderRadius: 999 },
  biometricCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4
  },
  overlayTagWrap: { position: 'absolute', top: Spacing.md, left: Spacing.md, zIndex: 10 },
  overlayTag: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: Colors.outline,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6
  },
  metricChipsRow: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    flexDirection: 'row',
    gap: Spacing.sm
  },
  metricChip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.25)',
    borderRadius: 6,
    padding: Spacing.sm
  },
  metricChipLabel: { ...Typography.labelCaps, fontSize: 9, color: Colors.outline },
  metricChipValue: { ...Typography.headlineMd, fontSize: 18, lineHeight: 24, color: Colors.primary, marginTop: 2 },
  poseArea: { flex: 1, backgroundColor: Colors.surfaceContainer },
  insightTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, fontWeight: '700', color: Colors.primary },
  insightBody: { ...Typography.bodyMd, fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  eliteCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  eliteWatermark: { position: 'absolute', right: -32, bottom: -32, transform: [{ rotate: '12deg' }] },
  eliteBody: { fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.7)', maxWidth: 240 },
  viewExercisesBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.lg
  },
  viewExercisesText: { fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700', color: Colors.onSecondaryContainer },
  exerciseCard: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 12,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3
  },
  exerciseIconBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(87,223,254,0.2)'
  },
  exerciseName: { fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700', color: Colors.primary, flexShrink: 1 },
  exerciseDetail: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  emptyBody: { fontSize: 12, lineHeight: 17, color: Colors.onSurfaceVariant, textAlign: 'center' }
});
