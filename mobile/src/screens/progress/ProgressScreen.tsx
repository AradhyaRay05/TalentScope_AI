import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme/colors';
import CircularScoreGauge from '../../components/CircularScoreGauge';

const TRACK_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAhLnMoVeDb0w8XIOZEZLXvKTjAGQN6qcnNRVnBf9ZSEhfqcttYews79S-8cFeot9JM6dHQjWlaj78cZTh9ACG8K5zPpQIFnVEb3T3mAaBJ-t1HFy-74O6CfkmnNOYJwF83O0XwPI5ipzHb2SoVSE7Y_E5kZwM0xA4nK1JOvNIllyA3flHApWCaiFnLZB1KJlHPTu6UEjR_r7BS4J9mcnZik3NTjS1055ZEJO8H6Ur2YVmI4dZ5lEaoWHQ2Msl8GLdswNyWSPau47g';

const MONTHLY_BARS = [40, 45, 55, 52, 65, 70, 85, 78, 82, 80, 88, 92];
const MONTH_LABELS = ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'];
const PEAK_INDEX = 6;

const MILESTONES = [
  {
    icon: 'bolt' as const,
    iconBg: Colors.tertiaryFixed,
    iconColor: Colors.onTertiaryFixed,
    title: 'Lightning Start',
    detail: 'Top 5% Acceleration in Week 1',
    locked: false
  },
  {
    icon: 'repeat' as const,
    iconBg: Colors.secondaryContainer,
    iconColor: Colors.onSecondaryContainer,
    title: 'Iron Consistency',
    detail: '30 Days of continuous tracking',
    locked: false
  },
  {
    icon: 'lock' as const,
    iconBg: Colors.surfaceContainerHighest,
    iconColor: Colors.onSurfaceVariant,
    title: 'Elite Tier Alpha',
    detail: 'Reach 90+ Score to unlock',
    locked: true
  }
];

export default function ProgressScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>TalentScope AI</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={[Typography.headlineLgMobile, { marginBottom: Spacing.xs }]}>Athlete Journey</Text>
          <Text style={[Typography.bodyLg, { fontSize: 16, color: Colors.onSurfaceVariant }]}>
            Track your trajectory across 12 months of elite data points.
          </Text>
        </View>

        <View style={{ paddingHorizontal: Spacing.marginMobile, gap: Spacing.gutter }}>
          {/* Performance Trend */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md }}>
              <View>
                <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.secondary }]}>PERFORMANCE TREND</Text>
                <Text style={[Typography.headlineMd, { fontSize: 19, lineHeight: 25, marginTop: Spacing.xs }]}>
                  Aggregate Performance Score
                </Text>
              </View>
              <View style={styles.yearPill}>
                <Text style={styles.yearPillText}>JAN - DEC 2024</Text>
              </View>
            </View>

            <View style={styles.chartArea}>
              {[0, 1, 2, 3].map(i => (
                <View key={`grid-${i}`} style={[styles.gridLine, { top: `${8 + i * 24}%` }]} />
              ))}
              <View style={styles.barsRow}>
                {MONTHLY_BARS.map((pct, i) => (
                  <View key={`bar-${i}`} style={styles.barSlot}>
                    {i === PEAK_INDEX && (
                      <View style={styles.peakTag}>
                        <Text style={styles.peakTagText}>PEAK</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${pct}%`,
                          backgroundColor: i === PEAK_INDEX ? Colors.secondary : 'rgba(0,104,122,0.12)'
                        },
                        i === PEAK_INDEX && styles.peakBar
                      ]}
                    />
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.monthLabelsRow}>
              {MONTH_LABELS.map(m => (
                <Text key={m} style={styles.monthLabel}>
                  {m}
                </Text>
              ))}
            </View>
          </View>

          {/* AI Core Analysis + Consistency */}
          <View style={{ gap: Spacing.gutter }}>
            <View style={styles.aiCard}>
              <View style={styles.aiWatermark}>
                <Icon name="psychology" size={64} color="rgba(255,255,255,0.2)" />
              </View>
              <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.secondaryContainer }]}>
                AI CORE ANALYSIS
              </Text>
              <Text style={[Typography.headlineMd, { fontSize: 20, lineHeight: 26, marginTop: Spacing.xs, marginBottom: Spacing.md }]}>
                Velocity Plateau Detected
              </Text>
              <Text style={styles.aiBody}>
                Your acceleration metrics have stabilized over the last 14 days. AI suggests a tactical shift in
                eccentric loading to break the current threshold.
              </Text>
              <TouchableOpacity style={styles.strategyBtn} activeOpacity={0.85}>
                <Text style={styles.strategyBtnText}>View Strategy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.consistencyCard}>
              <View>
                <Text style={[Typography.labelCaps, { fontSize: 10, color: Colors.onSurfaceVariant }]}>CONSISTENCY</Text>
                <Text style={styles.consistencyValue}>94%</Text>
              </View>
              <CircularScoreGauge size={48} strokeWidth={3} score={94} trackColor={Colors.surfaceContainerHighest} rotate>
                <Text style={styles.ringHidden}>{''}</Text>
              </CircularScoreGauge>
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.card}>
            <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.onSurfaceVariant, marginBottom: Spacing.md }]}>
              MILESTONES & ACHIEVEMENTS
            </Text>
            <View style={{ gap: Spacing.base }}>
              {MILESTONES.map(m => (
                <View key={m.title} style={[styles.milestoneRow, m.locked && styles.milestoneLocked]}>
                  <View style={[styles.milestoneIcon, { backgroundColor: m.iconBg }]}>
                    <Icon name={m.icon} size={18} color={m.iconColor} />
                  </View>
                  <View>
                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                    <Text style={styles.milestoneDetail}>{m.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Biometric Evolution */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
              <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.onSurfaceVariant }]}>
                BIOMETRIC EVOLUTION
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
                  <Text style={styles.legendText}>V02 Max</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={[styles.legendDot, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
                  <Text style={styles.legendText}>Resting HR</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg }}>
              <EvolutionMetric title="V02 Max Efficiency" delta="+12.4%" percent={82} note="Your respiratory efficiency has surpassed the regional pro-average by 4% this quarter." />
              <EvolutionMetric title="Recovery Speed" delta="+8.1%" percent={65} note="Neural recovery index is showing positive correlation with increased sleep quality." />
            </View>
          </View>

          {/* Career Trajectory Map */}
          <View style={styles.trajectoryCard}>
            <View style={styles.trajectoryHeader}>
              <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.onSurfaceVariant }]}>
                CAREER TRAJECTORY MAP
              </Text>
            </View>
            <View style={styles.trajectoryBody}>
              <Image source={{ uri: TRACK_IMG }} style={styles.trackImage} />
              <Svg viewBox="0 0 800 300" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#00687a" stopOpacity={0.2} />
                    <Stop offset="100%" stopColor="#00687a" stopOpacity={1} />
                  </LinearGradient>
                </Defs>
                <Path d="M0,250 Q100,240 200,200 T400,180 T600,100 T800,40" fill="none" stroke="#000000" strokeWidth={3} strokeDasharray="10 5" opacity={0.2} />
                <Path d="M0,250 Q100,240 200,200 T400,180 T600,100 T800,40" fill="none" stroke="url(#cyanGrad)" strokeWidth={4} strokeLinecap="round" />
                <Circle cx={200} cy={200} r={6} fill="#000000" />
                <Circle cx={400} cy={180} r={6} fill="#000000" />
                <Circle cx={600} cy={100} r={6} fill="#000000" />
                <Circle cx={800} cy={40} r={8} fill="#00687a" />
              </Svg>
              <Text style={styles.proReadyText}>PRO READY</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function EvolutionMetric({ title, delta, percent, note }: { title: string; delta: string; percent: number; note: string }) {
  return (
    <View style={{ width: '100%', gap: Spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Text style={styles.evolutionTitle}>{title}</Text>
        <Text style={styles.evolutionDelta}>{delta}</Text>
      </View>
      <View style={styles.evolutionTrack}>
        <View style={[styles.evolutionFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.evolutionNote}>{note}</Text>
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.25)',
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  yearPill: {
    backgroundColor: 'rgba(87,223,254,0.2)',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: 999
  },
  yearPillText: { fontSize: 11, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.onSecondaryContainer },
  chartArea: {
    height: 256,
    position: 'relative'
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,198,205,0.15)'
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: '100%',
    paddingHorizontal: Spacing.base,
    paddingBottom: 4
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bar: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  peakBar: {
    shadowColor: Colors.secondary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  peakTag: {
    position: 'absolute',
    top: -22,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 5
  },
  peakTagText: { ...Typography.labelCaps, fontSize: 10, color: '#ffffff' },
  monthLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm
  },
  monthLabel: {
    ...Typography.labelCaps,
    fontSize: 10,
    letterSpacing: 0.6,
    color: Colors.onSurfaceVariant,
    opacity: 0.6
  },
  aiCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8
  },
  aiWatermark: { position: 'absolute', top: 0, right: 0, padding: Spacing.md },
  aiBody: { fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.lg },
  strategyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8
  },
  strategyBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, fontWeight: '700', color: '#ffffff' },
  consistencyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.35)',
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  consistencyValue: { ...Typography.headlineMd, marginTop: 2 },
  ringHidden: { display: 'none' as any },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    borderRadius: 8,
    backgroundColor: 'rgba(236,238,240,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.12)'
  },
  milestoneLocked: {
    opacity: 0.4,
    borderStyle: 'dashed',
    backgroundColor: 'transparent'
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  milestoneTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700' },
  milestoneDetail: { fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 1 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.onSurfaceVariant },
  evolutionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  evolutionDelta: { fontFamily: 'Inter_700Bold', fontSize: 17, fontWeight: '700', color: Colors.secondary },
  evolutionTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHighest,
    overflow: 'hidden'
  },
  evolutionFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 999 },
  evolutionNote: { fontSize: 11, lineHeight: 14, color: Colors.onSurfaceVariant },
  trajectoryCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.25)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  trajectoryHeader: {
    padding: Spacing.md,
    backgroundColor: 'rgba(242,244,246,0.35)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.2)'
  },
  trajectoryBody: { height: 400, backgroundColor: '#f8fafc', position: 'relative' },
  trackImage: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  proReadyText: {
    position: 'absolute',
    right: 28,
    top: '12%',
    fontFamily: 'Geist_800ExtraBold',
    fontSize: 14,
    fontWeight: '800',
    color: Colors.secondary
  }
});
