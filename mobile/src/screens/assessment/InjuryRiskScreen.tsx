import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, ScrollView, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme/colors';
import CircularScoreGauge from '../../components/CircularScoreGauge';

const POSE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7j8p7NlraUHdQtInbPd90itWAhI1-i8THBDHNUPzFgAKBjxgJ_P6DxAugRfksr0tx75GYq2zDxH-fyuOOTtJoHTHazf4hSuQBsDJXW4Q01aJjFvpqcSmXFSfgiaRJr6osJvUp5KohAumvIpBN4JX6HP4QT8q4rGmWMtlp3n7Buf-2XU2DPTK2j95qk2vXe7TPYtOtf_Cs4lcpsHIRpwClppGuY4UYbwmA9kLWsPaY99UF1fI-Z61x3h6pOhIQgrklAKQd0skVbKY';

const EXERCISE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB7XQR16q5szs_mqY93Vum9fYoh4fTNekOFK0lbxlpJHfbCeWh6V0H14oEskJpYgj_ZmZMiyVLt45QS9mQSojvwfNe1_BFyx1z3XVHQfvW5pVz2dMN8ovmBNxoM3jfI8v9ge4Zd7Bqk5VAm5k6i3EAZusQam6d73VhWleOQ3a6hOw5jtgrq-C0dg6egPtmR5edjVyp648rhtBiGipeIZMCt72QVMGrQjU_X5huBiJSp8tlr-7kwnhxTMS15a1LmhQLyjNnvqmaKSpw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNEAAIzHN4LYRiWhe8OQatvzBharQqexGchnAhagb925DIAVhKYCe702bg9Pan4-lJjkdDw1zgCwxH_-ZjUcWBSQ8rtWYS8afAeptCqGTm__9P3Xho51QJUw2pzN6NqIrzc_IeL40RjTTw2kQw_I0VShV1JDkLp15zDBAxSNXDQI-2X9QqOk07FLyEfl9ZnHw94GcDts9qRsiRcokoaDo9XFgtu3bJiDC_mAiF6IrxNrpVNqcoKFzP9Hy6Z8YnuqDPzcuRu58PRV8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCaPlwDSR9MG9NuXdCSR2Lt0I2vZtsxE76orFts7NhQM2NsBbB-W2W69AQd--jGLgX0WJEVKMdOZl5C6MNLgd0di1nvqmlP_DogCbF-yK3aWPUBjVg6wbYqesQ8PupygFrIB59hlXDu5aKlTlDa5lZP_JzgA-TIrZVlYsxBCLEEe4RzGVEVN_SPCKrVaNMbCTZdiQVadcPusOVi5gdrhRPj1WOL4vMxVpjUL_wa_9ytpQGbDOC-4jQzFa_DkKVdLEz64VZidnll_zc'
];

const RISK_FACTORS = [
  {
    icon: 'balance' as const,
    badge: '+0.4% (Neutral)',
    title: 'Asymmetry',
    body: 'Left-to-right force distribution in kinetic chain transitions.',
    percent: 8
  },
  {
    icon: 'bolt' as const,
    badge: 'Low Loading',
    title: 'Fatigue',
    body: 'Neural drive efficiency and metabolic recovery index.',
    percent: 15
  },
  {
    icon: 'fitness-center' as const,
    badge: 'Optimal',
    title: 'Joint Stress',
    body: 'Compressive load monitoring at knees, ankles, and lumbar.',
    percent: 10
  },
  {
    icon: 'speed' as const,
    badge: 'Stable',
    title: 'Movement Deficiency',
    body: 'Kinetic deviations from elite-level performance baselines.',
    percent: 5
  }
];

const INSIGHTS = [
  {
    title: 'Hydration & Electrolytes',
    body: 'Target magnesium intake post-session to reduce calf cramping markers.'
  },
  {
    title: 'Eccentric Loading',
    body: 'Focus on slow-eccentric calf raises to fortify Achilles tendon resilience.'
  },
  {
    title: 'Sleep Hygiene',
    body: 'Maintain 8.5h window to optimize neural recovery and reaction times.'
  }
];

const EXERCISES = [
  { img: EXERCISE_IMAGES[0], name: 'Tibialis Raises', detail: '3 Sets • 15 Reps' },
  { img: EXERCISE_IMAGES[1], name: 'Hip Airplane', detail: '2 Sets • 10 Reps/Side' },
  { img: EXERCISE_IMAGES[2], name: 'Pigeon Stretch', detail: '60s Hold / Side' }
];

export default function InjuryRiskScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>TalentScope AI</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
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
        </View>

        <View style={{ paddingHorizontal: Spacing.marginMobile, gap: Spacing.gutter }}>
          {/* Risk Gauge */}
          <View style={styles.card}>
            <View style={styles.riskTopAccent} />
            <Text style={[Typography.labelCaps, { fontSize: 10, color: Colors.outline, textAlign: 'center', marginBottom: Spacing.md }]}>
              OVERALL RISK STATUS
            </Text>
            <CircularScoreGauge size={192} strokeWidth={12} score={12} progressColor={Colors.onTertiaryContainer} rotate>
              <Text style={styles.riskScore}>12%</Text>
              <Text style={styles.riskScoreLabel}>PREDICTION SCORE</Text>
            </CircularScoreGauge>
            <View style={styles.lowPill}>
              <Text style={styles.lowPillText}>Low</Text>
            </View>
            <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: Spacing.base, marginTop: Spacing.md }]}>
              Current metrics suggest optimal readiness. Movement patterns are highly stable with negligible fatigue markers.
            </Text>
          </View>

          {/* Risk Factors */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gutter }}>
            {RISK_FACTORS.map(f => (
              <View key={f.title} style={styles.factorCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={styles.factorIconBox}>
                    <Icon name={f.icon} size={26} color={Colors.secondary} />
                  </View>
                  <Text style={styles.factorBadge}>{f.badge}</Text>
                </View>
                <Text style={styles.factorTitle}>{f.title}</Text>
                <Text style={styles.factorBody}>{f.body}</Text>
                <View style={styles.factorTrack}>
                  <View style={[styles.factorFill, { width: `${f.percent}%` }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Live Biometric Overlay */}
          <View style={styles.biometricCard}>
            <View style={styles.overlayTagWrap}>
              <Text style={styles.overlayTag}>LIVE BIOMETRIC OVERLAY</Text>
            </View>
            <View style={styles.metricChipsRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipLabel}>KNEE ANGLE</Text>
                <Text style={styles.metricChipValue}>162.4°</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipLabel}>TORQUE (NM)</Text>
                <Text style={styles.metricChipValue}>48.2</Text>
              </View>
            </View>
            <View style={styles.poseArea}>
              <Image source={{ uri: POSE_IMG }} style={styles.poseImage} />
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

          {/* Preventive Insights + Elite */}
          <View style={{ gap: Spacing.gutter }}>
            <View style={styles.card}>
              <Text style={[Typography.headlineMd, { fontSize: 20, lineHeight: 26, marginBottom: Spacing.md }]}>
                Preventive Insights
              </Text>
              <View style={{ gap: Spacing.md }}>
                {INSIGHTS.map(ins => (
                  <View key={ins.title} style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <Icon name="check-circle" size={18} color={Colors.secondary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.insightTitle}>{ins.title}</Text>
                      <Text style={styles.insightBody}>{ins.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

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
              <TouchableOpacity style={styles.viewExercisesBtn} activeOpacity={0.85}>
                <Text style={styles.viewExercisesText}>View Exercises</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Suggested Exercises */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gutter, marginTop: Spacing.base }}>
            {EXERCISES.map(ex => (
              <TouchableOpacity key={ex.name} style={styles.exerciseCard} activeOpacity={0.8}>
                <Image source={{ uri: ex.img }} style={styles.exerciseImg} />
                <View>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetail}>{ex.detail}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
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
  lowPill: {
    backgroundColor: 'rgba(0,152,68,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    marginTop: Spacing.sm
  },
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
  poseImage: { ...StyleSheet.absoluteFillObject, opacity: 0.65 },
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
  exerciseImg: { width: 72, height: 72, borderRadius: 8 },
  exerciseName: { fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700', color: Colors.primary },
  exerciseDetail: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 }
});
