import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Glass } from '../../theme/colors';
import CircularScoreGauge from '../../components/CircularScoreGauge';
import BiometricProgressBar from '../../components/BiometricProgressBar';
import PostureHeatmap from '../../components/PostureHeatmap';

const BIOMETRICS = [
  { label: 'Movement Quality', value: '92%', tag: 'Elite', tagColor: Colors.onTertiaryContainer, percent: 92, bar: Colors.secondary },
  { label: 'Joint Alignment', value: '85%', tag: 'Stable', tagColor: Colors.onSurfaceVariant, percent: 85, bar: Colors.secondary },
  { label: 'Landing Mechanics', value: '78%', tag: 'At Risk', tagColor: Colors.error, percent: 78, bar: Colors.error },
  { label: 'Balance Stability', value: '94%', tag: 'Elite', tagColor: Colors.onTertiaryContainer, percent: 94, bar: Colors.secondary },
  { label: 'Speed (Sprint)', value: '10.2', tag: 'm/s', tagColor: Colors.onSurfaceVariant, percent: 88, bar: Colors.onTertiaryContainer },
  { label: 'Power Output', value: '1.4', tag: 'kW', tagColor: Colors.onSurfaceVariant, percent: 75, bar: Colors.onTertiaryContainer },
  { label: 'Endurance Index', value: '82', tag: 'pts', tagColor: Colors.onSurfaceVariant, percent: 82, bar: Colors.onTertiaryContainer },
  { label: 'Core Tension', value: '90%', tag: 'High', tagColor: Colors.onTertiaryContainer, percent: 90, bar: Colors.secondary }
];

const RECOMMENDATIONS = [
  {
    icon: 'fitness-center' as const,
    title: 'Targeted Glute Isolation',
    body: 'Prioritize 3 sets of weighted hip thrusts to stabilize knee alignment.'
  },
  {
    icon: 'self-improvement' as const,
    title: 'Ankle Mobility Protocol',
    body: 'Active dynamic stretching before sprint sessions to maintain dorsiflexion gains.'
  },
  {
    icon: 'alt-route' as const,
    title: 'Load Management',
    body: 'Reduce high-impact volume by 15% for the next 48 hours to prevent tendonitis.'
  }
];

export default function AnalysisResultsScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>TalentScope AI</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={[Typography.headlineLgMobile, { color: Colors.primary }]}>Performance Analysis Results</Text>
            <Text style={[Typography.bodyLg, { fontSize: 16, color: Colors.onSurfaceVariant }]}>
              Session ID: #TS-942-AXL • Dec 12, 2024
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
              <Icon name="share" size={18} color={Colors.onSurface} />
              <Text style={styles.shareText}>Share Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
              <Icon name="download" size={18} color="#ffffff" />
              <Text style={styles.downloadText}>Download Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: Spacing.marginMobile, gap: Spacing.gutter }}>
          {/* Overall Score */}
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Text style={[Typography.labelCaps, { color: Colors.onSurfaceVariant, marginBottom: Spacing.md }]}>
              OVERALL PERFORMANCE
            </Text>
            <CircularScoreGauge size={192} strokeWidth={10} score={88}>
              <Text style={styles.scoreNumber}>88</Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </CircularScoreGauge>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.md }}>
              <Icon name="trending-up" size={14} color={Colors.onTertiaryContainer} />
              <Text style={styles.deltaText}>+4.2% from last session</Text>
            </View>
          </View>

          {/* Detailed Biometrics */}
          <View style={styles.card}>
            <Text style={[Typography.labelCaps, { color: Colors.onSurfaceVariant, marginBottom: Spacing.lg }]}>
              DETAILED BIOMETRICS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
              {BIOMETRICS.map(b => (
                <View key={b.label} style={{ width: '47%', flexGrow: 1 }}>
                  <BiometricProgressBar
                    label={b.label}
                    value={b.value}
                    unit={b.tag}
                    unitColor={b.tagColor}
                    percent={b.percent}
                    barColor={b.bar}
                    barHeight={4}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Heatmap */}
          <View style={[styles.card, { padding: Spacing.md }]}>
            <Text style={[Typography.labelCaps, { color: Colors.onSurfaceVariant, marginBottom: Spacing.md }]}>
              POSTURE ERROR HEATMAP
            </Text>
            <PostureHeatmap height={420} />
          </View>

          {/* AI Recommendations */}
          <View style={styles.recommendationsCard}>
            <View style={styles.glowBlob} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg }}>
              <Icon name="psychology" size={22} color={Colors.secondaryContainer} />
              <Text style={[Typography.labelCaps, { color: Colors.secondaryFixed }]}>AI RECOMMENDATIONS</Text>
            </View>
            <View style={{ gap: Spacing.md }}>
              {RECOMMENDATIONS.map(r => (
                <View key={r.title} style={{ flexDirection: 'row', gap: Spacing.md }}>
                  <View style={styles.recIconBox}>
                    <Icon name={r.icon} size={20} color={Colors.onPrimaryContainer} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recTitle}>{r.title}</Text>
                    <Text style={styles.recBody}>{r.body}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.trainingPlanBtn} activeOpacity={0.85}>
              <Text style={styles.trainingPlanText}>View Full Training Plan</Text>
            </TouchableOpacity>
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
  pageHeader: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md
  },
  shareBtn: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base
  },
  shareText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface },
  downloadBtn: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base
  },
  downloadText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#ffffff' },
  card: {
    backgroundColor: Glass.backgroundColor,
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
  scoreNumber: { ...Typography.displayHero, color: Colors.onSurface },
  scoreMax: { ...Typography.labelCaps, fontSize: 11, color: Colors.onSurfaceVariant },
  deltaText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: Colors.onTertiaryContainer },
  recommendationsCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    padding: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6
  },
  glowBlob: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.secondary,
    opacity: 0.2
  },
  recIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(224,227,229,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: '#ffffff' },
  recBody: { fontSize: 13, lineHeight: 19, color: Colors.onPrimaryContainer, marginTop: 4 },
  trainingPlanBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center'
  },
  trainingPlanText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: Colors.onSecondaryContainer }
});
