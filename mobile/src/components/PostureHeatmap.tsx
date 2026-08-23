import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../theme/colors';

export interface HeatmapSpot {
  cx: number;
  cy: number;
  severity: 'critical' | 'optimal' | 'improved' | 'normal';
  pulse?: boolean;
}

export interface PostureFinding {
  tagColor: string;
  tagText: string;
  title: string;
  description: string;
}

interface PostureHeatmapProps {
  imageUrl?: string;
  spots?: HeatmapSpot[];
  findings?: PostureFinding[];
  height?: number;
}

const DEFAULT_SPOTS: HeatmapSpot[] = [
  { cx: 50, cy: 20, severity: 'normal' },
  { cx: 50, cy: 60, severity: 'normal' },
  { cx: 35, cy: 100, severity: 'critical', pulse: true },
  { cx: 65, cy: 100, severity: 'normal' },
  { cx: 35, cy: 160, severity: 'normal' },
  { cx: 65, cy: 160, severity: 'normal' }
];

const DEFAULT_FINDINGS: PostureFinding[] = [
  {
    tagColor: Colors.error,
    tagText: 'CRITICAL WARNING',
    title: 'Right Knee Valgus',
    description:
      'Detected 4.2° internal rotation during landing phase. High risk for ACL fatigue.'
  },
  {
    tagColor: Colors.secondary,
    tagText: 'OPTIMAL ZONE',
    title: 'Thoracic Spine Alignment',
    description:
      'Neutral position maintained throughout peak acceleration phase.'
  },
  {
    tagColor: Colors.tertiaryFixedDim,
    tagText: 'IMPROVED',
    title: 'Ankle Dorsiflexion',
    description:
      "Increased mobility by 12% since last month's baseline analysis."
  }
];

const SEVERITY_COLORS: Record<HeatmapSpot['severity'], string> = {
  critical: Colors.error,
  optimal: Colors.secondaryContainer,
  improved: Colors.tertiaryFixedDim,
  normal: '#ffffff'
};

const BONES: Array<[number, number, number, number, string?]> = [
  [50, 20, 50, 60],
  [50, 60, 35, 100],
  [50, 60, 65, 100],
  [35, 100, 35, 160, 'dash'],
  [65, 100, 65, 160]
];

export default function PostureHeatmap({
  imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuANgj0jkdtaUH_izPbl9zsISt5xS__REbAj4fCzlQ8kQlfM4FkvQSJRy-tEx8tDZ0a2LbRtD9o9Pnn-Ok6l_QhXsb8qxxoHqlxyKnPCq8v9XiU0WPcRI-mCiFVq5hY4Urc0AxJ4UA6AQ8sDnC067qiwvlurOCQMMMtRxk10TYTCFlgv8oXGEt5GO7S9mz2SfgHr-c4Kzbv1S_ic2JA736AONkjIAYuKzMpLSyXzfE8DFAx3_Uuf6RGhSHKdn416c1jtwoidkD6LoCY',
  spots = DEFAULT_SPOTS,
  findings = DEFAULT_FINDINGS,
  height = 400
}: PostureHeatmapProps) {
  return (
    <View style={[styles.card, { height }]}>
      <View style={styles.bodyColumn}>
        <View style={styles.glow} />
        <Image source={{ uri: imageUrl }} style={styles.bodyImage} resizeMode="contain" />
        <Svg
          viewBox="0 0 100 200"
          style={[StyleSheet.absoluteFill, styles.skeleton]}
          preserveAspectRatio="xMidYMid meet"
        >
          {BONES.map(([x1, y1, x2, y2, style], i) => (
            <Line
              key={`bone-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={style === 'dash' ? '#ba1a1a' : '#57dffe'}
              strokeWidth={0.5}
              strokeDasharray={style === 'dash' ? '2' : undefined}
            />
          ))}
          {spots.map((spot, i) => (
            <Circle
              key={`spot-${i}`}
              cx={spot.cx}
              cy={spot.cy}
              r={spot.severity === 'critical' ? 2.5 : 1.5}
              fill={spot.severity === 'critical' ? SEVERITY_COLORS.critical : '#ffffff'}
              stroke="#57dffe"
              strokeWidth={spot.severity === 'critical' ? 0 : 0.5}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.findingsColumn}>
        {findings.map((finding, i) => (
          <View key={i} style={[styles.findingCard, { borderLeftColor: finding.tagColor }]}>
            <Text style={[styles.findingTag, { color: finding.tagColor }]}>{finding.tagText}</Text>
            <Text style={styles.findingTitle}>{finding.title}</Text>
            <Text style={styles.findingDescription}>{finding.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bodyColumn: {
    height: '100%',
    aspectRatio: 1 / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  glow: {
    position: 'absolute',
    width: '80%',
    height: '40%',
    borderRadius: 999,
    backgroundColor: Colors.primaryContainer,
    opacity: 0.15
  },
  bodyImage: {
    height: '100%',
    width: '100%',
    opacity: 0.75
  },
  skeleton: {
    opacity: 0.85
  },
  findingsColumn: {
    flex: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.md,
    gap: Spacing.md
  },
  findingCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: Spacing.sm
  },
  findingTag: {
    ...Typography.labelCaps,
    fontSize: 10,
    marginBottom: 4
  },
  findingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface
  },
  findingDescription: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2
  }
});
