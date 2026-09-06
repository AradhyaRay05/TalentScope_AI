import React, { useId } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import Svg, { Line, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../theme/colors';
import {
  buildRiskVisualization,
  BAND_COLORS,
  BAND_LABELS,
  RiskVisualizationData,
  SeverityBand
} from '../services/riskVisualization';

/**
 * Back-compat view-model shapes consumed by this component's call-sites.
 * Everything is produced by the finalized contract (riskVisualization.ts):
 * no mock/default risk data lives here anymore.
 */
export interface HeatmapSpot {
  cx: number;
  cy: number;
  severity: SeverityBand; // 'low' | 'watch' | 'critical'
  pulse?: boolean;
  joint?: string;
  strainScore?: number;
}

export interface PostureFinding {
  tagColor: string;
  tagText: string;
  title: string;
  description: string;
}

export type BodyHeatmapStatus = 'ready' | 'loading' | 'processing' | 'error';

interface PostureHeatmapProps {
  imageUrl?: string;
  spots?: HeatmapSpot[];
  findings?: PostureFinding[];
  height?: number;
  /** Diagram state overlay. Defaults to 'ready'. */
  state?: BodyHeatmapStatus;
  /** Shown when state === 'error'. */
  errorMessage?: string | null;
  /** Retry action for the error overlay. */
  onRetry?: () => void;
  /** Empty-state caption override (ready + no spots). */
  emptyMessage?: string;
  /** Show the severity legend under the diagram. Defaults to true. */
  showLegend?: boolean;
}

const GLOW_RADIUS: Record<SeverityBand, number> = {
  critical: 8,
  watch: 6,
  low: 4
};

const DOT_RADIUS: Record<SeverityBand, number> = {
  critical: 2.5,
  watch: 2,
  low: 1.5
};

export interface HeatmapLegendItem {
  band: SeverityBand;
  label: string;
  color: string;
  count: number;
}

/**
 * Pure legend derivation: one row per severity band present in the spots.
 * Bands with zero markers are omitted (no "×0" noise).
 */
export const buildLegendItems = (spots: HeatmapSpot[]): HeatmapLegendItem[] => {
  const list = Array.isArray(spots) ? spots : [];
  return (['critical', 'watch', 'low'] as SeverityBand[])
    .map(band => ({
      band,
      label: BAND_LABELS[band],
      color: BAND_COLORS[band],
      count: list.filter(s => s.severity === band).length
    }))
    .filter(item => item.count > 0);
};

/**
 * Severity legend row. Renders nothing when no markers exist.
 */
export function HeatmapLegend({ spots, overlay = false }: { spots: HeatmapSpot[]; overlay?: boolean }) {
  const items = buildLegendItems(spots);
  if (items.length === 0) return null;
  return (
    <View style={[styles.legendRow, overlay && styles.legendRowOverlay]}>
      {items.map(item => (
        <View key={item.band} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={[styles.legendText, overlay && styles.legendTextOverlay]}>
            {`${item.label} ×${item.count}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const BONES: Array<[number, number, number, number, string?]> = [
  [50, 20, 50, 60],
  [50, 60, 35, 100],
  [50, 60, 65, 100],
  [35, 100, 35, 160, 'dash'],
  [65, 100, 65, 160]
];

const DEFAULT_BODY_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANgj0jkdtaUH_izPbl9zsISt5xS__REbAj4fCzlQ8kQlfM4FkvQSJRy-tEx8tDZ0a2LbRtD9o9Pnn-Ok6l_QhXsb8qxxoHqlxyKnPCq8v9XiU0WPcRI-mCiFVq5hY4Urc0AxJ4UA6AQ8sDnC067qiwvlurOCQMMMtRxk10TYTCFlgv8oXGEt5GO7S9mz2SfgHr-c4Kzbv1S_ic2JA736AONkjIAYuKzMpLSyXzfE8DFAx3_Uuf6RGhSHKdn416c1jtwoidkD6LoCY';

interface BodyHeatmapProps {
  imageUrl?: string;
  spots?: HeatmapSpot[];
  /** Fixed diagram height. Omit to flex-fill the parent. */
  height?: number;
  state?: BodyHeatmapStatus;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
}

/**
 * Diagram-only heatmap: body image + fixed skeleton + severity-proportional
 * heat glow + risk dots, with loading/processing/error/empty overlays.
 * Used standalone (compact embed) and inside the full PostureHeatmap card.
 */
export function BodyHeatmap({
  imageUrl = DEFAULT_BODY_IMAGE,
  spots,
  height,
  state = 'ready',
  errorMessage,
  onRetry,
  emptyMessage = 'NO JOINT STRAIN DATA'
}: BodyHeatmapProps) {
  const rawId = useId();
  const gid = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeSpots: HeatmapSpot[] = Array.isArray(spots) ? spots : [];
  const hasJointData = safeSpots.length > 0;
  const showLoading = state === 'loading';
  const showProcessing = state === 'processing';
  const showError = state === 'error';

  return (
    <View style={[styles.diagram, height != null ? { height } : { flex: 1 }]}>
      <Image source={{ uri: imageUrl }} style={styles.bodyImage} resizeMode="contain" />
      <Svg
        viewBox="0 0 100 200"
        style={[StyleSheet.absoluteFill, styles.skeleton]}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {(Object.keys(BAND_COLORS) as SeverityBand[]).map(band => (
            <RadialGradient key={`${gid}-${band}`} id={`${gid}-${band}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={BAND_COLORS[band]} stopOpacity={0.6} />
              <Stop offset="100%" stopColor={BAND_COLORS[band]} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
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
        {hasJointData
          ? safeSpots.map((spot, i) => (
              <React.Fragment key={`spot-${i}`}>
                <Circle
                  cx={spot.cx}
                  cy={spot.cy}
                  r={GLOW_RADIUS[spot.severity] ?? 4}
                  fill={`url(#${gid}-${spot.severity})`}
                />
                <Circle
                  cx={spot.cx}
                  cy={spot.cy}
                  r={DOT_RADIUS[spot.severity] ?? 1.5}
                  fill={BAND_COLORS[spot.severity] ?? '#ffffff'}
                  stroke={spot.severity === 'critical' ? 'none' : '#57dffe'}
                  strokeWidth={0.5}
                />
              </React.Fragment>
            ))
          : null}
      </Svg>
      {showLoading ? (
        <View style={styles.stateOverlay}>
          <ActivityIndicator size="small" color={Colors.secondary} />
          <Text style={styles.stateText}>LOADING HEATMAP</Text>
        </View>
      ) : null}
      {showProcessing ? (
        <View style={styles.stateOverlay}>
          <ActivityIndicator size="small" color={Colors.secondary} />
          <Text style={styles.stateText}>ANALYSIS IN PROGRESS</Text>
        </View>
      ) : null}
      {showError ? (
        <View style={styles.stateOverlay}>
          <Icon name="error-outline" size={20} color={Colors.error} />
          <Text style={[styles.stateText, { color: Colors.error }]}>
            {errorMessage || 'Heatmap unavailable. Please try again.'}
          </Text>
          {onRetry ? (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>RETRY</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      {!showLoading && !showProcessing && !showError && !hasJointData ? (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataText}>{emptyMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function PostureHeatmap({
  imageUrl = DEFAULT_BODY_IMAGE,
  spots,
  findings,
  height = 400,
  state = 'ready',
  errorMessage,
  onRetry,
  emptyMessage,
  showLegend = true
}: PostureHeatmapProps) {
  // HONEST EMPTY STATE: no mock fallbacks — when a call-site passes nothing
  // (or explicitly empty data) we render the diagram with no markers.
  const safeSpots: HeatmapSpot[] = Array.isArray(spots) ? spots : [];
  const safeFindings: PostureFinding[] = Array.isArray(findings)
    ? findings
    : [
        {
          tagColor: Colors.onSurfaceVariant,
          tagText: 'NO DATA',
          title: 'No joint-level data',
          description: 'No joint strain data was recorded for this assessment.'
        }
      ];
  const hasJointData = safeSpots.length > 0;

  return (
    <View>
      <View style={[styles.card, { height }]}>
        <View style={styles.bodyColumn}>
          <View style={styles.glow} />
          <BodyHeatmap
            imageUrl={imageUrl}
            spots={safeSpots}
            height={height}
            state={state}
            errorMessage={errorMessage}
            onRetry={onRetry}
            emptyMessage={emptyMessage}
          />
        </View>
        <View style={styles.findingsColumn}>
          {safeFindings.map((finding, i) => (
            <View key={i} style={[styles.findingCard, { borderLeftColor: finding.tagColor }]}>
              <Text style={[styles.findingTag, { color: finding.tagColor }]}>{finding.tagText}</Text>
              <Text style={styles.findingTitle}>{finding.title}</Text>
              <Text style={styles.findingDescription}>{finding.description}</Text>
            </View>
          ))}
        </View>
      </View>
      {showLegend && hasJointData ? (
        <View style={styles.legendWrap}>
          <HeatmapLegend spots={safeSpots} />
        </View>
      ) : null}
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
  diagram: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bodyImage: {
    height: '100%',
    width: '100%',
    opacity: 0.75
  },
  skeleton: {
    opacity: 0.85
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.72)',
    padding: Spacing.md
  },
  stateText: {
    ...Typography.labelCaps,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.onSurfaceVariant,
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: 2,
    backgroundColor: Colors.error,
    borderRadius: 6,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs
  },
  retryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#ffffff'
  },
  noDataOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.35)',
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3
  },
  noDataText: {
    ...Typography.labelCaps,
    fontSize: 8,
    letterSpacing: 1.2,
    color: Colors.outline
  },
  legendWrap: {
    alignItems: 'center',
    paddingTop: Spacing.sm
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md
  },
  legendRowOverlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    ...Typography.labelCaps,
    fontSize: 8,
    letterSpacing: 1,
    color: Colors.onSurfaceVariant
  },
  legendTextOverlay: {
    color: '#ffffff'
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

/**
 * Build the component's spot view-model STRICTLY through the finalized
 * contract (riskVisualization.ts). The raw assessment is the single input;
 * positions/severity/colors come from the contract's documented rules.
 */
export const buildHeatmapSpotsFromAssessment = (a: any): HeatmapSpot[] => {
  const data: RiskVisualizationData = buildRiskVisualization(a);
  return data.joints.map(j => ({
    cx: j.cx,
    cy: j.cy,
    severity: j.band,
    joint: j.joint,
    strainScore: j.strainScore
  }));
};

export const buildFindingsFromAssessment = (a: any): PostureFinding[] => {
  const data: RiskVisualizationData = buildRiskVisualization(a);
  const mapped = data.warnings.map((w): PostureFinding => {
    const sev = w.severity;
    const detailText = w.detail ?? '';
    const detailLower = detailText.toLowerCase();
    // Same de-duplication rule as the contract's insight builder: never
    // repeat a phase/angle the stored detail sentence already states.
    const mentionsPhase = !!w.phase && detailLower.includes(String(w.phase).toLowerCase());
    const mentionsAngle = detailText.includes('°');
    const showPhase = !!w.phase && w.phase !== 'landing phase' && !mentionsPhase;
    const showAngle = w.angleDeviationDeg != null && w.angleDeviationDeg !== 0 && !mentionsAngle;
    return {
      tagText:
        sev === 'Critical'
          ? 'CRITICAL WARNING'
          : sev === 'Low'
            ? 'MINOR FINDING'
            : 'MODERATE WARNING',
      tagColor:
        sev === 'Critical'
          ? Colors.error
          : sev === 'Low'
            ? Colors.secondary
            : '#b9740f',
      title: w.warningType,
      description: `${detailText}${showPhase ? ` Detected during ${w.phase}.` : ''}${
        showAngle
          ? ` (${Math.abs(w.angleDeviationDeg as number)}° deviation)`
          : ''
      }`
    };
  });
  if (mapped.length === 0) {
    return [
      {
        tagColor: Colors.onSurfaceVariant,
        tagText: 'NO FINDINGS',
        title: 'No posture findings recorded',
        description: 'No critical biomechanical warnings were detected for this assessment.'
      }
    ];
  }
  return mapped;
};
