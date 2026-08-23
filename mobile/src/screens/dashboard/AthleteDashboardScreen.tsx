import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Glass } from '../../theme/colors';
import CircularScoreGauge from '../../components/CircularScoreGauge';
import MetricTrendChart from '../../components/MetricTrendChart';
import BiometricProgressBar from '../../components/BiometricProgressBar';
import AIChatBotModal from '../../components/AIChatBotModal';
import { getProfile, getAthleteDashboard } from '../../services/api';

const AVATAR_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCQtlHWcO7z1_rqIPh_dYqzC4F4YoUXggLTgxa9EES-UfSfa8P_Cp7u4vdWxq8jO5Uak6kYHl0KVhUXY3yZCatSV0xE2pYp0vs5Yp7fWcW190H6rd3q-5LoQinITBNTMC968R7N89yX_0VoSgmgCEIuwQ1tKVOncqjajt7VWMXSjQxbjfPCwifZoJAWVNASDBt3cgeSjmnlTgOt7blJ6ffq_6mWnIV7hCNuSgTdPH_iKISdSnQvg-11Fd2M-W_AXvW64O_QdzllSEs';

const MOVEMENT_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrGzMiabVvpP93GB2fjxSCkmA4n5hVR5IdKMu4KEa5ZIQW-ZT6qb2uHiLYolSU2ybUE90OX6oD0VKF-2SFb6XZ-ZTDDM41wAQ0sTncz-Gc0A2b0mNAziLUj5EuK3lqIfKucK8snFbu1KJKNlfQY3HtozJLTUFyfSJAckHD6aG9DQdo_hOBGYQzAHeMuHcy-D86m8U_i4I6Oa5it-3RrRd2ZWrP7i0or7NzgVNNcNF7nhyzjuW51rStMIcuEAcAX39UwOVZVbUqNxg';

const WEEKLY_BARS = [
  { day: 'MON', pct: 40, active: false },
  { day: 'TUE', pct: 65, active: false },
  { day: 'WED', pct: 90, active: false },
  { day: 'THU', pct: 55, active: false },
  { day: 'FRI', pct: 80, active: true },
  { day: 'SAT', pct: 30, active: false },
  { day: 'SUN', pct: 20, active: false }
];

const ACTIVITIES = [
  {
    icon: 'directions-run' as const,
    title: 'Sprint Mechanics Assessment',
    time: 'Yesterday, 4:20 PM',
    score: '88%'
  },
  {
    icon: 'fitness-center' as const,
    title: 'Jump Velocity Test',
    time: 'May 12, 11:05 AM',
    score: '82%'
  }
];

const BENCHMARKS = [
  { label: 'EXPLOSIVE POWER', value: 'P92', percent: 92, color: Colors.secondary, shadow: true },
  { label: 'REACTIVE STRENGTH', value: 'P78', percent: 78, color: Colors.onTertiaryContainer, shadow: false },
  { label: 'LATERAL AGILITY', value: 'P64', percent: 64, color: Colors.error, shadow: false }
];

const TREND_RANGES = ['1M', '3M', '6M'];

export default function AthleteDashboardScreen({ navigation }: any) {
  const [range, setRange] = useState('1M');
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [profileRes, dashRes] = await Promise.allSettled([getProfile(), getAthleteDashboard()]);
        if (!mounted) return;
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.user || profileRes.value.data);
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data || dashRes.value);
      } catch {
        // fall back to static demo data
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const userName = profile?.name
    ? String(profile.name)
        .split(' ')
        .slice(0, 1)
        .map((s: string) => s.toUpperCase())[0] + '.'
    : 'ATHLETE';

  const score = dashboard?.latestAssessment?.overallScore ?? 85;
  const scoreBasis = dashboard?.latestAssessment ?? null;
  const injuryLevel = profile?.currentInjuryRiskLevel ?? 'Low';
  const injuryPct = profile?.currentInjuryRiskPercentage ?? 15;
  const rank = profile?.regionalRank ?? 42;
  const totalAssessments =
    dashboard?.counts?.totalCompletedAssessments ??
    dashboard?.totalCompletedAssessments ??
    12;
  const velocity = dashboard?.metricVelocity ?? [];

  const activities = velocity.length
    ? velocity.map((p: any) => ({
        icon: 'directions-run' as const,
        title: `${p.testType || 'Assessment'} • ${p.assessmentCode || ''}`.trim(),
        time: p.date || '',
        score: `${p.value}%`
      }))
    : ACTIVITIES;

  const firstName = (profile?.name || 'Marcus').split(' ')[0];

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Text style={styles.topBarTitle}>Athlete Overview</Text>
          <View style={styles.eliteBadge}>
            <Text style={styles.eliteBadgeText}>{profile?.tier ? profile.tier.toUpperCase() : 'ELITE LEVEL'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <TouchableOpacity style={styles.bellBtn}>
            <Icon name="notifications" size={22} color={Colors.onSurface} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <View style={styles.userChip}>
            <Image source={{ uri: AVATAR_IMG }} style={styles.avatar} />
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: Spacing.marginMobile, gap: Spacing.gutter }}>
          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: Colors.primary }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('StartAssessment')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.quickActionLabelLight}>PRO ASSESSMENT</Text>
                <Text style={styles.quickActionTitle}>Start Assessment</Text>
              </View>
              <Icon name="bolt" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, Glass]} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickActionLabel}>AI ANALYTICS</Text>
                <Text style={styles.quickActionTitleDark}>Upload Video</Text>
              </View>
              <Icon name="videocam" size={24} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, Glass]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Progress')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.quickActionLabel}>DATA ARCHIVE</Text>
                <Text style={styles.quickActionTitleDark}>View Reports</Text>
              </View>
              <Icon name="description" size={24} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, Glass]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.quickActionLabel}>NETWORK</Text>
                <Text style={styles.quickActionTitleDark}>Find Coach</Text>
              </View>
              <Icon name="groups" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Bento Row 1: Gauge / Status / Activities */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gutter }}>
            <Card style={{ width: '100%', alignItems: 'center' }}>
              <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, styles.cardHeader]}>
                <Text style={styles.cardLabel}>PERFORMANCE SCORE</Text>
                <Icon name="info" size={20} color={Colors.secondary} />
              </View>
              <CircularScoreGauge size={176} strokeWidth={10} score={score} rotate>
                <Text style={styles.gaugeScore}>{score}</Text>
                <Text style={styles.gaugePercentile}>TOP 5%</Text>
              </CircularScoreGauge>
              <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.md }]}>
                {scoreBasis?.testType
                  ? `Latest ${String(scoreBasis.testType).replace(/_/g, ' ')} score from ${scoreBasis.assessmentCode || 'your last session'}.`
                  : "You've improved your explosive power by 12% this month."}
              </Text>
            </Card>

            <View style={{ width: '100%', gap: Spacing.gutter }}>
              <Card style={{ gap: Spacing.base }} >
                <TouchableOpacity
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
                  onPress={() => navigation.navigate('InjuryRisk')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardLabel}>INJURY RISK</Text>
                  <Icon name="check-circle" size={22} color={Colors.onTertiaryContainer} />
                </TouchableOpacity>
                <Text style={Typography.headlineLg}>{injuryLevel}</Text>
                <View style={styles.riskTrack}>
                  <View style={[styles.riskFill, { width: `${injuryPct}%` }]} />
                </View>
              </Card>

              <Card style={{ gap: Spacing.base }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.cardLabel}>CURRENT RANK</Text>
                  <Icon name="military-tech" size={22} color={Colors.secondary} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs }}>
                  <Text style={Typography.headlineLg}>#{rank}</Text>
                  <Text style={[Typography.bodyMd, { color: Colors.onTertiaryContainer }]}>↑ 4</Text>
                </View>
                <Text style={styles.tinyCaps}>REGIONAL DIVISION A</Text>
              </Card>

              <Card style={{ gap: Spacing.base }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.cardLabel}>ASSESSMENTS</Text>
                  <Icon name="history" size={22} color={Colors.secondary} />
                </View>
                <Text style={Typography.headlineLg}>{totalAssessments}</Text>
                <Text style={styles.tinyCaps}>COMPLETED THIS SEASON</Text>
              </Card>
            </View>

            <Card style={{ width: '100%' }}>
              <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, styles.cardHeader]}>
                <Text style={styles.cardLabel}>RECENT ACTIVITIES</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AnalysisResults')}>
                  <Text style={styles.seeAll}>SEE ALL</Text>
                </TouchableOpacity>
              </View>
              <View style={{ gap: Spacing.md }}>
                {activities.map(a => (
                  <View key={a.title} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <View style={styles.activityIconBox}>
                      <Icon name={a.icon} size={20} color={Colors.onSurfaceVariant} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>{a.title}</Text>
                      <Text style={styles.activityTime}>{a.time}</Text>
                    </View>
                    <Text style={styles.activityScore}>{a.score}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <View style={styles.activityIconBox}>
                    <Icon name="receipt-long" size={20} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>Full Biometric Report</Text>
                    <Text style={styles.activityTime}>May 10, 9:00 AM</Text>
                  </View>
                  <Icon name="chevron-right" size={22} color={Colors.outline} />
                </View>
              </View>

              <View style={styles.recommendationSection}>
                <Text style={[styles.cardLabel, { marginBottom: Spacing.md }]}>AI RECOMMENDATIONS</Text>
                <View style={styles.recommendationCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                    <Icon name="auto-awesome" size={16} color={Colors.secondaryFixed} />
                    <Text style={[Typography.labelCaps, { fontSize: 10, color: Colors.secondaryFixed }]}>NEXT STEP</Text>
                  </View>
                  <Text style={styles.recommendationTitle}>
                    Improve hip mobility to reduce lateral knee strain.
                  </Text>
                  <Text style={styles.recommendationLink}>Watch Drill Video</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Progress Trend Chart */}
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.lg }}>
              <View>
                <Text style={styles.cardLabel}>PROGRESS TREND</Text>
                <Text style={Typography.headlineMd}>Metric Velocity</Text>
              </View>
              <View style={styles.rangeSwitcher}>
                {TREND_RANGES.map(r => (
                  <TouchableOpacity key={r} onPress={() => setRange(r)} style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}>
                    <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <MetricTrendChart height={240} data={range === '1M' ? [70, 74, 71, 79, 76, 84] : range === '3M' ? [62, 66, 72, 69, 78, 82] : [58, 64, 60, 70, 75, 81]} labels={['APR 01', 'APR 15', 'MAY 01', 'MAY 15', 'TODAY']} />
          </Card>

          {/* Weekly Performance */}
          <Card>
            <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, styles.cardHeader]}>
              <Text style={styles.cardLabel}>WEEKLY PERFORMANCE</Text>
              <Icon name="more-vert" size={22} color={Colors.onSurfaceVariant} />
            </View>
            <View style={styles.weeklyRow}>
              {WEEKLY_BARS.map(b => (
                <View key={b.day} style={styles.weeklyCol}>
                  <View
                    style={[
                      styles.weeklyBar,
                      {
                        height: `${b.pct}%`,
                        backgroundColor: b.active ? Colors.secondary : Colors.surfaceContainer
                      }
                    ]}
                  />
                  <Text style={[styles.weeklyDay, b.active && styles.weeklyDayActive]}>{b.day}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Dynamic Movement Assessment */}
          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <View style={styles.movementMedia}>
              <Image source={{ uri: MOVEMENT_IMG }} style={styles.movementImage} />
              <View style={styles.movementOverlay}>
                <View style={styles.dashedFrame}>
                  <View style={styles.aiActiveChip}>
                    <Text style={styles.aiActiveText}>AI FORM ANALYSIS ACTIVE</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ padding: Spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={Typography.headlineMd}>Dynamic Movement Assessment</Text>
                <Icon name="analytics" size={22} color={Colors.secondary} />
              </View>
              <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, marginTop: Spacing.sm }]}>
                Proprietary vision AI tracking 24 key body nodes to assess stability and power transfer during vertical loads.
              </Text>
            </View>
          </Card>

          {/* Elite Comparison */}
          <Card>
            <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, styles.cardHeader]}>
              <Text style={styles.cardLabel}>ELITE COMPARISON</Text>
              <Icon name="trending-up" size={22} color={Colors.secondary} />
            </View>
            <Text style={[Typography.headlineMd, { marginBottom: Spacing.lg }]}>Biometric Benchmarks</Text>
            <View style={{ gap: Spacing.md }}>
              {BENCHMARKS.map(b => (
                <BiometricProgressBar
                  key={b.label}
                  label={b.label}
                  value={b.value}
                  percent={b.percent}
                  barColor={b.color}
                  trackColor={Colors.surfaceContainerHigh}
                  barHeight={8}
                  showShadow={b.shadow}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.benchmarkBtn}>
              <Text style={styles.benchmarkBtnText}>View Detailed Benchmarks</Text>
              <Icon name="north-east" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      <AIChatBotModal athleteName={firstName} />
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: {
    height: 64,
    paddingHorizontal: Spacing.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,249,251,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.15)'
  },
  topBarTitle: { ...Typography.headlineMd, fontSize: 20, lineHeight: 26, color: Colors.primary },
  eliteBadge: {
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: Spacing.base,
    paddingVertical: 2,
    borderRadius: 999
  },
  eliteBadgeText: { ...Typography.labelCaps, fontSize: 9, letterSpacing: 1.6, color: Colors.onTertiaryFixed },
  bellBtn: { position: 'relative', padding: Spacing.base },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1,
    borderColor: Colors.surface
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 999,
    paddingLeft: 4,
    paddingRight: Spacing.md,
    paddingVertical: 4
  },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  userName: { ...Typography.labelCaps, fontSize: 11, color: Colors.onSurfaceVariant },
  quickActionCard: {
    flexGrow: 1,
    minWidth: 160,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  quickActionLabelLight: {
    ...Typography.labelCaps,
    fontSize: 9,
    opacity: 0.7,
    color: '#ffffff',
    marginBottom: 2
  },
  quickActionLabel: { ...Typography.labelCaps, fontSize: 9, color: Colors.onSurfaceVariant, marginBottom: 2 },
  quickActionTitle: { fontFamily: 'Geist_600SemiBold', fontSize: 19, fontWeight: '600', color: '#ffffff' },
  quickActionTitleDark: { fontFamily: 'Geist_600SemiBold', fontSize: 19, fontWeight: '600', color: Colors.onSurface },
  card: {
    backgroundColor: Glass.backgroundColor,
    borderWidth: 1,
    borderColor: Glass.borderColor,
    borderRadius: 12,
    padding: Spacing.md,
    width: '100%'
  },
  cardHeader: { marginBottom: Spacing.md },
  cardLabel: { ...Typography.labelCaps, color: Colors.onSurfaceVariant },
  gaugeScore: {
    ...Typography.displayHero,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -2,
    color: Colors.primary
  },
  gaugePercentile: { ...Typography.labelCaps, color: Colors.onSurfaceVariant, marginTop: 2 },
  riskTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainer,
    overflow: 'hidden'
  },
  riskFill: { height: '100%', backgroundColor: Colors.onTertiaryContainer, borderRadius: 999 },
  tinyCaps: { ...Typography.labelCaps, fontSize: 9, color: Colors.onSurfaceVariant },
  seeAll: { fontSize: 11, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.secondary, textTransform: 'uppercase' },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  activityTime: { ...Typography.labelCaps, fontSize: 9, color: Colors.onSurfaceVariant, marginTop: 2 },
  activityScore: { ...Typography.monoData, color: Colors.secondary },
  recommendationSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,198,205,0.2)'
  },
  recommendationCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    padding: Spacing.md
  },
  recommendationTitle: { ...Typography.bodyMd, fontFamily: 'Inter_600SemiBold', fontWeight: '600', color: Colors.onPrimaryContainer, marginBottom: Spacing.sm },
  recommendationLink: { fontSize: 12, fontFamily: 'Inter_700Bold', fontWeight: '700', textDecorationLine: 'underline', color: Colors.onPrimaryContainer },
  rangeSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    padding: 4,
    gap: 2
  },
  rangeBtn: { paddingHorizontal: Spacing.base, paddingVertical: 4, borderRadius: 6 },
  rangeBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  rangeText: { fontSize: 10, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.onSurfaceVariant },
  rangeTextActive: { color: Colors.onSurface },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: Spacing.base,
    height: 256
  },
  weeklyCol: { flex: 1, alignItems: 'center', gap: Spacing.base, height: '100%', justifyContent: 'flex-end' },
  weeklyBar: {
    width: '100%',
    borderRadius: 8
  },
  weeklyDay: { ...Typography.monoData, fontSize: 10, color: Colors.outline },
  weeklyDayActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  movementMedia: { aspectRatio: 16 / 9, backgroundColor: Colors.surfaceDim },
  movementImage: { ...StyleSheet.absoluteFillObject, opacity: 0.7 },
  movementOverlay: { ...StyleSheet.absoluteFillObject, padding: Spacing.md },
  dashedFrame: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,104,122,0.3)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiActiveChip: {
    backgroundColor: 'rgba(0,104,122,0.12)',
    borderColor: 'rgba(0,104,122,0.4)',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    borderRadius: 8
  },
  aiActiveText: { ...Typography.labelCaps, color: Colors.onSecondaryContainer },
  benchmarkBtn: {
    marginTop: Spacing.lg,
    width: '100%',
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs
  },
  benchmarkBtnText: { fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.onSurfaceVariant }
});
