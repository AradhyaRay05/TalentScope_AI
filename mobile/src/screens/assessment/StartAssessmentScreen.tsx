import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  
  Animated,
  Easing,
  StyleSheet
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Glass } from '../../theme/colors';
import SkeletonOverlay from '../../components/SkeletonOverlay';

const CAMERA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCPfv8hPZ4F0uI7AhmV451JN0RxNDOP-pH5hhtnjfAoi0wNI_ZSFfcDnJQQLINwM6BzFJ8Wuo6S75rwi_BPzF3y6PErI8hr_HKlti0Dl_vjSREIKqS9I8mY_IH9tK3ZsB77emud_f_cqZ60Q6cnWIHK8Wh84MH57cmKzxTLZjFIkZ9_sPbQxbt9oOiC_Jgz6YnhNPZJ-DD_a-O-V5h_46UN_yDzBThw3zexTROYykcTVftjKs8RSuafFVZ-SxI_whXe5-siJMMM9mg';

const VALIDATIONS = [
  {
    icon: 'light-mode' as const,
    iconColor: Colors.secondary,
    iconBg: 'rgba(87,223,254,0.2)',
    label: 'LIGHTING',
    value: 'Optimal (840lx)'
  },
  {
    icon: 'straighten' as const,
    iconColor: Colors.onTertiaryContainer,
    iconBg: 'rgba(74,225,118,0.2)',
    label: 'DISTANCE',
    value: '3.2m - Perfect'
  },
  {
    icon: 'devices' as const,
    iconColor: Colors.primary,
    iconBg: 'rgba(218,226,253,0.35)',
    label: 'HARDWARE',
    value: 'AI-NPU Active'
  }
];

const STEPS = [
  {
    title: 'Positioning',
    text: 'Stand inside the dashed frame. Ensure your full body is visible from head to toe.'
  },
  {
    title: 'The Movement',
    text: 'Perform 5 slow, controlled unilateral squats on each leg. Wait for the beep.'
  },
  {
    title: 'Completion',
    text: 'Step out of frame to finalize processing. Results generate in < 10s.'
  }
];

const LIVE_METRICS = [
  { label: 'HIP ANGLE', value: '172.4°', color: '#ffffff' },
  { label: 'LATERAL SWAY', value: '0.02m', color: Colors.secondaryFixed },
  { label: 'HEART RATE', value: '94 BPM', color: '#ffffff' },
  { label: 'STABILITY', value: '98.2%', color: Colors.tertiaryFixed }
];

export default function StartAssessmentScreen({ navigation }: any) {
  const [recording, setRecording] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const [elapsedMs, setElapsedMs] = useState(42080);

  useEffect(() => {
    if (!recording) return undefined;
    const interval = setInterval(() => setElapsedMs(ms => ms + 100), 100);
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const formatTime = () => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    const cs = String(Math.floor((elapsedMs % 1000) / 10)).padStart(2, '0');
    return `${mm}:${ss}.${cs}`;
  };

  return (
    <View style={styles.root}>
      {/* Top Nav */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md }}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.brand}>TalentScope AI</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="arrow-back-ios" size={13} color={Colors.onSurfaceVariant} />
            <Text style={styles.backLabel}>BACK TO ANALYTICS</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerRecordBtn]}
          activeOpacity={0.85}
          onPress={() => setRecording(r => !r)}
        >
          <Text style={styles.headerRecordText}>{recording ? 'STOP RECORDING' : 'START RECORDING'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Camera Feed */}
        <View style={styles.cameraCard}>
          <Image source={{ uri: CAMERA_IMG }} style={styles.cameraImage} />
          <SkeletonOverlay variant="camera" animate />
          <View style={styles.guideWrap}>
            <View style={[styles.guideBox, recording && styles.guideBoxActive]}>
              <View style={styles.alignPill}>
                <Text style={styles.alignPillText}>ALIGN CENTER</Text>
              </View>
            </View>
          </View>

          {/* Status overlays */}
          <View style={styles.statusColumn}>
            <View style={styles.glassBadge}>
              <Icon name="videocam" size={14} color={Colors.secondary} />
              <Text style={styles.badgeText}>LIVE FEED: 1080P</Text>
            </View>
            <View style={styles.glassBadge}>
              <Animated.View style={[styles.pulseDot, { opacity: pulse }]} />
              <Text style={styles.badgeText}>AI PROCESSING ACTIVE</Text>
            </View>
          </View>
          <View style={styles.timerBadge}>
            <Icon name="timer" size={14} color="#ffffff" />
            <Text style={styles.timerText}>{formatTime()}</Text>
          </View>

          {/* Bottom control bar */}
          <View style={styles.controlBar}>
            <View>
              <Text style={styles.detectionLabel}>DETECTION STATUS</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="check-circle" size={16} color={Colors.tertiaryFixed} />
                  <Text style={styles.detectionOk}>BODY FOUND</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="cancel" size={16} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.detectionOff}>FLOOR VISIBLE</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <TouchableOpacity style={styles.circleGlassBtn}>
                <Icon name="refresh" size={22} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setRecording(r => !r)}
                style={[styles.recordBtn, recording && styles.recordBtnStop]}
              >
                <Animated.View
                  style={[
                    styles.recordDot,
                    recording && { borderRadius: 2, backgroundColor: Colors.error, opacity: pulse }
                  ]}
                />
                <Text style={styles.recordBtnText}>{recording ? 'STOP' : 'RECORD'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleGlassBtn}>
                <Icon name="settings" size={22} color={Colors.primary} />
              </TouchableOpacity>
              <View>
                <Text style={styles.fpsLabel}>FPS</Text>
                <Text style={styles.fpsValue}>60</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Validation Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
          {VALIDATIONS.map(v => (
            <View key={v.label} style={styles.validationCard}>
              <View style={[styles.validationIconBox, { backgroundColor: v.iconBg }]}>
                <Icon name={v.icon} size={24} color={v.iconColor} />
              </View>
              <View>
                <Text style={styles.validationLabel}>{v.label}</Text>
                <Text style={styles.validationValue}>{v.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Current Assessment Card */}
        <View style={styles.infoCard}>
          <Text style={styles.currentLabel}>CURRENT ASSESSMENT</Text>
          <Text style={Typography.headlineLgMobile}>Unilateral Squat Depth</Text>
          <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, marginTop: Spacing.sm, lineHeight: 26 }]}>
            Analyzing biomechanical efficiency and joint alignment during single-leg loading cycles. AI will track
            17 key performance indicators.
          </Text>
          <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
            {STEPS.map((step, i) => (
              <View key={step.title} style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Live Biometrics Card */}
        <View style={styles.biometricsCard}>
          <View style={styles.biometricWatermark}>
            <Icon name="analytics" size={96} color="rgba(255,255,255,0.2)" />
          </View>
          <Text style={styles.biometricsLabel}>LIVE BIOMETRICS</Text>
          <View style={styles.metricsGrid}>
            {LIVE_METRICS.map(m => (
              <View key={m.label}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.historicalDivider}>
            <TouchableOpacity style={styles.historicalBtn}>
              <Text style={styles.historicalBtnText}>VIEW HISTORICAL DATA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reliability Score Card */}
        <View style={[styles.infoCard, { flexDirection: 'column' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={styles.cardCapsLabel}>RELIABILITY SCORE</Text>
            <Text style={styles.reliabilityValue}>EXCELLENT</Text>
          </View>
          <View style={styles.reliabilityTrack}>
            <View style={[styles.reliabilityFill, { width: '92%' }]} />
          </View>
          <Text style={styles.reliabilityNote}>
            Calculated based on lighting, motion blur, and skeleton confidence intervals.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 44,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,249,251,0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.15)'
  },
  brand: { ...Typography.headlineMd, letterSpacing: -0.8, color: Colors.primary, lineHeight: 28 },
  backLabel: { ...Typography.labelCaps, fontSize: 11, letterSpacing: 1.4, color: Colors.onSurfaceVariant },
  headerRecordBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base
  },
  headerRecordText: { ...Typography.labelCaps, letterSpacing: 2.2, color: Colors.onPrimary },
  body: {
    flex: 1,
    padding: Spacing.marginMobile,
    paddingBottom: 120,
    gap: Spacing.md
  },
  cameraCard: {
    aspectRatio: 16 / 10,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden'
  },
  cameraImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6
  },
  guideWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  guideBox: {
    width: '33%',
    height: '75%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(172,237,255,0.4)',
    borderRadius: 12,
    alignItems: 'center',
    paddingTop: 32
  },
  guideBoxActive: { borderColor: Colors.secondaryFixed, borderStyle: 'solid' },
  alignPill: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: 999
  },
  alignPillText: { ...Typography.labelCaps, fontSize: 10, letterSpacing: 1.8, color: Colors.onSecondaryContainer },
  statusColumn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    gap: Spacing.sm
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Glass.backgroundColor,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  badgeText: { ...Typography.labelCaps, fontSize: 10, letterSpacing: 1.2, color: Colors.onSurface },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiaryFixedDim },
  timerBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  timerText: { ...Typography.monoData, color: '#ffffff' },
  controlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)'
  },
  detectionLabel: {
    ...Typography.labelCaps,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.xs
  },
  detectionOk: { fontFamily: 'Inter_700Bold', fontSize: 12, fontWeight: '700', color: Colors.tertiaryFixed },
  detectionOff: { fontFamily: 'Inter_700Bold', fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  circleGlassBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Glass.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8
  },
  recordBtnStop: { backgroundColor: Colors.secondaryFixed },
  recordDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error },
  recordBtnText: { ...Typography.headlineMd, fontSize: 20, lineHeight: 26, color: '#000000' },
  fpsLabel: { ...Typography.labelCaps, fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  fpsValue: { ...Typography.headlineMd, color: '#ffffff', textAlign: 'right', fontSize: 20, lineHeight: 26 },
  validationCard: {
    flexGrow: 1,
    minWidth: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    padding: Spacing.md
  },
  validationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  validationLabel: { ...Typography.labelCaps, fontSize: 10, color: Colors.onSurfaceVariant },
  validationValue: { ...Typography.headlineMd, fontSize: 16, lineHeight: 22, color: Colors.primary, marginTop: 2 },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    padding: Spacing.md
  },
  currentLabel: {
    ...Typography.labelCaps,
    letterSpacing: 3.2,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepNumberText: { ...Typography.monoData, color: Colors.onPrimary },
  stepTitle: { ...Typography.headlineMd, fontSize: 16, lineHeight: 22, color: Colors.primary, marginBottom: Spacing.xs },
  stepBody: { ...Typography.bodyMd, fontSize: 14, color: Colors.onSurfaceVariant },
  biometricsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    overflow: 'hidden'
  },
  biometricWatermark: { position: 'absolute', top: 0, right: 0, padding: Spacing.md, opacity: 0.5 },
  biometricsLabel: { ...Typography.labelCaps, letterSpacing: 3.2, color: Colors.onPrimaryContainer, marginBottom: Spacing.md },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md
  },
  metricLabel: { ...Typography.labelCaps, fontSize: 9, color: Colors.onPrimaryContainer },
  metricValue: { ...Typography.headlineMd, fontSize: 19, lineHeight: 26, marginTop: 2 },
  historicalDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md
  },
  historicalBtn: {
    width: '100%',
    paddingVertical: Spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center'
  },
  historicalBtnText: { ...Typography.labelCaps, letterSpacing: 2.2, color: '#ffffff' },
  cardCapsLabel: { ...Typography.labelCaps, fontSize: 11, color: Colors.onSurfaceVariant },
  reliabilityValue: { ...Typography.monoData, color: Colors.secondary, fontFamily: 'Inter_700Bold' },
  reliabilityTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainer,
    overflow: 'hidden'
  },
  reliabilityFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 999 },
  reliabilityNote: {
    ...Typography.bodyMd,
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm
  }
});
