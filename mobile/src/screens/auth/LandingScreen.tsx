import React, { useState } from 'react';
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

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBnymycV9YWbRrW5SvkuftYaeRke_TiuUq84zQsa-ZXbca4rWGWwe7fjiiOKQti7cT9Guco6ETSBsIjh-ttRGzr4BHr43CRQtgE5C0zO7LQB3qIptAEGrMKNSfFNop_1aQwuiMTAY3b6Svy3jICOPUSPHioCmRI4x5U_ERdXBKwtt444ao1bMJPcv_VW-0b3DVb8nVXaIhJen9ZCRqNVaAWfhmRwr7DTajHLouujNQp2eNOp8G9kTasKkt7zOODt4pu7GUqQ8UA5ik';

const COACH_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWwQVOTVc9mSmJLWAqaOxQvbXdt6ZIKCvoaQxhdZitLlz4VVjM05VQFkqbkIXWzGiy5KhaGQbAptRi81d8KZIvP7L0R5k1jEoD68IOZ5xMmWQQXg652_CCjWzt8TQekYBqOdzRorQ19LEl6MchRMflMuGrp5eIdfe-LtPZDJTO-tt72XGuDBspayA-XtegCoFdy_HLS_EsCdO29csNBlGW0EEKvMsvhOhRFlHe8v4FA_ufUxo8-I6hzWJyNkeSANgASwpYu9ymTC4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQI1V_T74fpWkTUySm6PPa6dcWV6zgdTGAF91MT_uiDrQurwZONZIUnphVMybGl3r7KefWXTA8GkfwaFtqDlZbHeS31d10DwIvmFsIO0VI_nHCVFd7E52TanVTvKYjGAfyaraozyvup1ZvqqgVUv4d-osloRms9KAivo4tpCTRJL_cX3_2YXEjUfomTzkzRnGU0whATXDQkiq4MAnR_OaVzQ1CI2qwSCoY9wkemkAZI6dT3Yfna3iWhacSMjO-NZP1bBguEPnBJkk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4O6vSKQU3zqSkY1CaiA_LgOiUNHlHc5o-z3apKirbhvdYcjDaYDtWzNm8UheC-gdXLZqvOZy1Xm5GKAfFIA2Jiy4ieVj3Q1i-f-yi9rIhiPdOFTl-FoC6ZB_A47UIOg0xy3g2qipK6mJuJEyRjaRqERjI59a7sR8Y5FgySQSmkm7ZWYZLb1gTxry7_P50J8YHgFaWxIQVsFAeSeXYVDJjJ4xWgPOSKZWWPN83tNPDYlFvnRF_IHYNoAlqSaUptxh39OU55BBvpI'
];

const DEV_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzGP4JiBfbWSJAcyWfVUwQF-mWDJZE4qBqruSSZiihnqOOtDOilhlFZn7H0Fh4AjFHCyON9HyM8iMrOzTp7WCq-qNZpFmxy0zmr5Hc5w21JG2yCjdK-oP0uEPlJPBS2cpLF5TaYZIzQPwODzcSf0Xa0ycbELRxPQIHVdXy5CZdSpxvn2Y0ZA_LhkwoG4-1qLtwcuzP8nbqsXGhGaS4ulS4gtOZfwrbIiEDREwI1Yb10fzylIFqSSDJUlTFm79-fi5gTQnCMhKWBO4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD70YD-O80r3q2HHpFrgeuixtnJAcwGBQkpOsDzGbdLzdYov1CcMOJq10nx96gUAr3vlZgwlXhE9yvzFuAvL5y-50hlEMaEty6d-2OFmZLuTZ3liLVb-GSgsLuikO5bZouSoM22EavjveeIaSsIpK-FrvsuTcV2E2lPt0TzzhE_daA26F1eLAB-pZLKGoFuWlJl3Ab91kFAc2X4IPBPDznsAJk4x93ftczhFv4LUhtKXbrkak2pvf5PtCtW1P_NpB7yzSa48eCE3us',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLMbC5KAUGTat-B13x8VVimJPe_1zHGxWDPNvLO6jc9qN8J4zfFfCWbkVFY226VxDGw-YXIQNHmPJtc2JmGNI5HAIdBwxhxpEnWcuT-9abp_iiyiz3qgENbkboYMKmprj0SzQdLEu14mYiEq2zjhOcBQn4dDQ0iVuLJ6lth7nRAEGir8E5AmoMvM-c_Qqz_dE5lTw7vzG-mOe7ITxHby5k97REA7XnPqxSRJuSEk7hnvIaLEXSYUh6lrOX3Ot0BpsaS1O99YGYeDY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFOyiCN8Ks8SHMIfMamjisMIGXK5nrUWrMRNQtcl0Yo7VV1XGn6vDgNxc8noYS61-mAUAusU2sCLhhA3NgyXpBumKqp2D-QBkhXh0rSSEAS3_N38z2XIsz2T8xC134ovlf4Dt_zhMbqRMlWXev7kyt4M9Ar_Doj3KzF3KWJAVK8ofgJaGKGcDxJgVrfcK2fcn0zm6nIXk_sA1E5DLcnz0-ikE_FnN5xcdS39V0f_wmTp2jRBxA6snwR8KWLrnWeWSeYmX4FEKMWNo'
];

const FEATURES = [
  { icon: 'smartphone', title: 'Smartphone-based', text: 'No wearables required. Just your camera.' },
  { icon: 'bolt', title: 'Real-time Detection', text: 'Instant feedback during your performance.' },
  { icon: 'history', title: 'Trend Analysis', text: 'Track improvements over weeks or years.' },
  { icon: 'group', title: 'Multi-Athlete Support', text: 'Ideal for teams and athletic clubs.' },
  { icon: 'cloud-done', title: 'Cloud Reports', text: 'High-fidelity PDFs for your physicians.' },
  { icon: 'psychology', title: 'Personalized Insights', text: 'AI-generated training suggestions.' },
  { icon: 'videocam', title: 'Slow-mo Replay', text: 'Break down every frame of your motion.' },
  { icon: 'security', title: 'Privacy First', text: 'Your biometrics are encrypted and secure.' }
] as const;

const STEPS = [
  { num: '01', title: 'Setup', text: 'Position your phone 10 feet away from your workout area.' },
  { num: '02', title: 'Record', text: 'Perform your routine as normal while AI tracks 25+ joint points.' },
  { num: '03', title: 'Process', text: 'Our neural networks analyze biomechanics in under 60 seconds.' },
  { num: '04', title: 'Review', text: 'Get a comprehensive score based on speed, form, and risk.' },
  { num: '05', title: 'Connect', text: 'Optional: Share your data with a certified TalentScope coach.' },
  { num: '06', title: 'Improve', text: 'Execute AI-prescribed corrective drills to reach your peak.' }
];

const STATS = [
  { value: '500k+', label: 'ASSESSMENTS RUN' },
  { value: '12k+', label: 'PRO ATHLETES' },
  { value: '85+', label: 'SPORT TYPES' },
  { value: '40%', label: 'AVG INJURY REDUCTION' }
];

const COACHES = [
  { img: COACH_IMAGES[0], name: 'Marcus Thorne', role: 'Olympic Sprint Coach' },
  { img: COACH_IMAGES[1], name: 'Elena Rodriguez', role: 'Biomechanical Specialist' },
  { img: COACH_IMAGES[2], name: 'Sarah Chen', role: 'Physiotherapy Expert' }
];

const DEVS = [
  { img: DEV_IMAGES[0], name: 'Dr. Aris Thorne', role: 'Lead AI Engineer', field: 'Computer Vision Expert' },
  { img: DEV_IMAGES[1], name: 'Maya Lin', role: 'Biomechanics Specialist', field: 'Kinesiology & Data Science' },
  { img: DEV_IMAGES[2], name: 'Julian Vane', role: 'Systems Architect', field: 'Scalable Cloud Infrastructure' },
  { img: DEV_IMAGES[3], name: 'Sarah Chen', role: 'UX Director', field: 'Human-Machine Interaction' }
];

const FAQS = [
  {
    q: 'Do I need special equipment or wearables?',
    a: 'No. TalentScope AI works entirely through your smartphone camera. Our advanced computer vision models handle everything from motion tracking to biomechanical analysis.'
  },
  {
    q: 'How accurate is the AI detection?',
    a: 'In laboratory testing, our AI models achieve 98% correlation with professional-grade motion capture systems (Vicon/OptiTrack) for joint angle and velocity measurements.'
  },
  {
    q: 'Is my biometric data secure?',
    a: 'Absolutely. We use end-to-end encryption. Your video data is processed in real-time and is never stored on our servers unless you explicitly choose to save it for your coach.'
  }
];

export default function LandingScreen({ navigation }: any) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>TalentScope AI</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>SignUp / Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI-DRIVEN PERFORMANCE</Text>
          </View>
          <Text style={[styles.heroTitle, { marginTop: Spacing.md }]}>
            AI-Powered Sports Assessment for Every Athlete
          </Text>
          <Text style={styles.heroBody}>
            Analyze performance, detect injury risks, improve technique, and connect with certified
            coaches using just your smartphone.
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
            <TouchableOpacity
              style={styles.primaryCta}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.primaryCtaText}>Start Assessment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineCta} activeOpacity={0.8}>
              <Icon name="play-circle" size={20} color={Colors.primary} />
              <Text style={styles.outlineCtaText}>Watch Demo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.visionCard}>
            <Image source={{ uri: HERO_IMG }} style={styles.visionImage} />
            <SkeletonMock />
            <View style={styles.visionTopRow}>
              <View style={styles.glassChip}>
                <Text style={styles.chipLabelSecondary}>JOINT ANGLES</Text>
                <Text style={styles.monoData}>KNEE: 142°</Text>
                <Text style={styles.monoData}>HIP: 168°</Text>
              </View>
              <View style={[styles.glassChip, { alignItems: 'flex-end' }]}>
                <Text style={styles.chipLabelError}>STRESS ALERT</Text>
                <Text style={styles.monoData}>L-ANKLE: HIGH</Text>
              </View>
            </View>
            <View style={styles.liveAnalysisCard}>
              <View style={styles.spinner} />
              <View>
                <Text style={styles.liveLabel}>LIVE ANALYSIS</Text>
                <Text style={styles.liveValue}>98.4% Precision Tracking</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bento Pillars */}
        <View style={styles.sectionLow}>
          <View style={styles.pillarsRow}>
            <View style={styles.pillarCard}>
              <Icon name="biotech" size={40} color={Colors.secondary} />
              <Text style={styles.pillarTitle}>AI Biomechanics</Text>
              <Text style={styles.pillarBody}>
                Proprietary vision models dissect movement with sub-millimeter accuracy for elite optimization.
              </Text>
            </View>
            <View style={[styles.pillarCard, { backgroundColor: Colors.secondary }]}>
              <Icon name="health-and-safety" size={40} color="#ffffff" />
              <Text style={[styles.pillarTitle, { color: '#ffffff' }]}>Injury Risk Detection</Text>
              <Text style={[styles.pillarBody, { color: 'rgba(255,255,255,0.9)' }]}>
                Identify asymmetrical loads and joint fatigue before they become career-ending injuries.
              </Text>
            </View>
            <View style={styles.pillarCard}>
              <Icon name="hub" size={40} color={Colors.secondary} />
              <Text style={styles.pillarTitle}>Certified Network</Text>
              <Text style={styles.pillarBody}>
                Instant connection to world-class sports scientists and Olympic-level coaches.
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[Typography.headlineLg, styles.sectionTitleCenter]}>
            Precision Performance Features
          </Text>
          <Text style={[Typography.bodyLg, styles.sectionSubCenter]}>
            The future of athletic training is in your pocket.
          </Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map(f => (
              <View key={f.title} style={styles.featureCard}>
                <Icon name={f.icon} size={24} color={Colors.secondary} />
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howSection}>
          <Text style={[Typography.headlineLg, { color: '#ffffff', textAlign: 'center', marginBottom: Spacing.lg }]}>
            Engineered for Simplicity
          </Text>
          {STEPS.map(s => (
            <View key={s.num} style={styles.stepRow}>
              <Text style={styles.stepNum}>{s.num}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Marketplace Preview */}
        <View style={styles.marketSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.lg }}>
            <View style={{ flex: 1, paddingRight: Spacing.sm }}>
              <Text style={Typography.headlineLg}>Elite Coach Marketplace</Text>
              <Text style={[Typography.bodyLg, { color: Colors.onSurfaceVariant, marginTop: Spacing.xs }]}>
                Work with professionals who use AI to tailor your training.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
              style={styles.viewCoachesBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.viewCoachesText}>View All Coaches</Text>
            </TouchableOpacity>
          </View>
          {COACHES.map(c => (
            <View key={c.name} style={styles.coachCard}>
              <View>
                <Image source={{ uri: c.img }} style={styles.coachImg} />
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              </View>
              <View style={{ padding: Spacing.md }}>
                <Text style={styles.coachName}>{c.name}</Text>
                <Text style={styles.coachRole}>{c.role}</Text>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.coachPrice}>$75/Assessment</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('CoachProfile')}>
                    <Text style={styles.bookLink}>Book Consultation</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={[Typography.headlineLg, styles.sectionTitleCenter, { marginBottom: Spacing.lg }]}>
            Choose Your Tier
          </Text>
          <View style={{ gap: Spacing.gutter }}>
            <View style={styles.tierCard}>
              <Text style={styles.tierLabel}>BASIC</Text>
              <Text style={styles.tierPrice}>Free</Text>
              <TierFeature text="3 Assessments/Mo" included />
              <TierFeature text="Basic Form Scoring" included />
              <TierFeature text="Injury Risk Reports" included={false} />
              <TouchableOpacity style={styles.tierOutlineBtn} onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.tierOutlineText}>Get Started</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tierProCard}>
              <View style={styles.popularPill}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
              <Text style={styles.tierLabelDark}>ELITE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.md }}>
                <Text style={styles.tierPriceDark}>$29</Text>
                <Text style={styles.tierPerMo}>/mo</Text>
              </View>
              <TierFeature dark text="Unlimited Assessments" included />
              <TierFeature dark text="Advanced Injury Analytics" included />
              <TierFeature dark text="Full Marketplace Access" included />
              <TouchableOpacity style={styles.proUnlockBtn} onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.proUnlockText}>Unlock Pro</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tierCard}>
              <Text style={styles.tierLabel}>TEAM</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.md }}>
                <Text style={styles.tierPrice}>$199</Text>
                <Text style={styles.tierPerMoLight}>/mo</Text>
              </View>
              <TierFeature text="Up to 20 Athletes" included />
              <TierFeature text="Dedicated Dashboards" included />
              <TierFeature text="API Data Export" included />
              <TouchableOpacity style={styles.tierOutlineBtn}>
                <Text style={styles.tierOutlineText}>Contact Sales</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Developers */}
        <View style={styles.sectionLow}>
          <Text style={[Typography.headlineLg, styles.sectionTitleCenter]}>
            Developers Behind It
          </Text>
          <Text style={[Typography.bodyLg, styles.sectionSubCenter]}>
            The minds engineering the future of athletic intelligence.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
            {DEVS.map(d => (
              <View key={d.name} style={styles.devCard}>
                <Image source={{ uri: d.img }} style={styles.devImg} />
                <Text style={styles.devName}>{d.name}</Text>
                <Text style={styles.devRole}>{d.role}</Text>
                <Text style={styles.devField}>{d.field}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[Typography.headlineLg, styles.sectionTitleCenter, { marginBottom: Spacing.lg }]}>
            Common Questions
          </Text>
          {FAQS.map((f, i) => (
            <View key={f.q} style={styles.faqItem}>
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <Text style={styles.faqQuestion}>{f.q}</Text>
                <Icon
                  name="expand-more"
                  size={22}
                  color={Colors.onSurface}
                  style={{ transform: [{ rotate: openFaq === i ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>
              {openFaq === i && <Text style={styles.faqAnswer}>{f.a}</Text>}
            </View>
          ))}
        </View>

        {/* Final CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaPanel}>
            <Text style={[Typography.displayHero, { fontSize: 34, textAlign: 'center', marginBottom: Spacing.md }]}>
              Start Your AI Sports Journey Today
            </Text>
            <Text style={[Typography.bodyLg, { color: Colors.onSurfaceVariant, textAlign: 'center' }]}>
              Join thousands of athletes who are already using TalentScope to gain a competitive edge and train smarter.
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.md, justifyContent: 'center', marginTop: Spacing.lg }}>
              <TouchableOpacity style={styles.primaryCta} onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.primaryCtaText}>Get Started Free</Text>
              </TouchableOpacity>
              <View style={styles.enterpriseBtn}>
                <Text style={styles.enterpriseText}>Request Enterprise Demo</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>TalentScope AI</Text>
          <Text style={styles.footerCopy}>© 2024 TalentScope AI. Professional Grade Performance Analysis.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md, marginTop: Spacing.base }}>
            {['Privacy Policy', 'Terms of Service', 'AI Ethics', 'Contact Support'].map(l => (
              <Text key={l} style={styles.footerLink}>{l}</Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Mobile Bottom Nav */}
      <View style={styles.bottomNav}>
        <BottomNavItem icon="home" label="Home" active />
        <BottomNavItem icon="bolt" label="Features" />
        <BottomNavItem icon="payments" label="Plans" />
        <BottomNavItem icon="code" label="Devs" />
        <BottomNavItem icon="person" label="Login" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
}

function TierFeature({ text, included, dark }: { text: string; included: boolean; dark?: boolean }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm }, !included && { opacity: 0.5 }]}>
      <Icon
        name={included ? 'check' : 'close'}
        size={18}
        color={!included ? Colors.outline : dark ? Colors.secondaryContainer : Colors.secondary}
      />
      <Text style={[Typography.bodyMd, dark ? { color: '#ffffff' } : {}]}>{text}</Text>
    </View>
  );
}

function SkeletonMock() {
  return (
    <View style={styles.skeletonArea} pointerEvents="none">
      <View style={[styles.skDot, { top: '25%', left: '50%' }]} />
      <View style={[styles.skDot, { top: '33%', left: '33%' }]} />
      <View style={[styles.skDot, { top: '33%', left: '66%' }]} />
      <View style={[styles.skLine, { width: 96, top: '27%', left: '48%', transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.skLine, { width: 96, top: '27%', left: '48%', transform: [{ rotate: '135deg' }] }]} />
    </View>
  );
}

function BottomNavItem({
  icon,
  label,
  active,
  onPress
}: {
  icon: keyof typeof Icon.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.bottomNavItem} onPress={onPress} disabled={!onPress}>
      <Icon name={icon} size={22} color={active ? Colors.secondary : Colors.onSurfaceVariant} />
      <Text style={[styles.bottomNavLabel, active && { color: Colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    backgroundColor: 'rgba(247,249,251,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.15)'
  },
  brand: {
    ...Typography.headlineMd,
    letterSpacing: -0.8,
    color: Colors.primary
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8
  },
  loginBtnText: { ...Typography.labelCaps, color: Colors.onPrimary },
  hero: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999
  },
  badgeText: { ...Typography.labelCaps, color: Colors.onSecondaryContainer },
  heroTitle: {
    ...Typography.displayHero,
    fontSize: 40,
    lineHeight: 46,
    maxWidth: 520
  },
  heroBody: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.md
  },
  primaryCta: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center'
  },
  primaryCtaText: { ...Typography.headlineMd, fontSize: 20, color: Colors.onPrimary, lineHeight: 26 },
  outlineCta: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 56
  },
  outlineCtaText: { ...Typography.headlineMd, fontSize: 20, color: Colors.primary, lineHeight: 26 },
  visionCard: {
    marginTop: Spacing.xl,
    height: 420,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#dfe3ea',
    borderWidth: 1,
    borderColor: Glass.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12
  },
  visionImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35
  },
  visionTopRow: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  glassChip: {
    backgroundColor: Glass.backgroundColor,
    borderRadius: 12,
    padding: Spacing.sm
  },
  chipLabelSecondary: {
    ...Typography.labelCaps,
    color: Colors.secondary,
    marginBottom: 4
  },
  chipLabelError: {
    ...Typography.labelCaps,
    color: Colors.error,
    marginBottom: 4
  },
  monoData: { ...Typography.monoData, color: Colors.onSurface, lineHeight: 18 },
  skeletonArea: { ...StyleSheet.absoluteFillObject, top: 120, bottom: 140 },
  skDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(87,223,254,0.8)',
    shadowOpacity: 1,
    shadowRadius: 8
  },
  skLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(87,223,254,0.5)'
  },
  liveAnalysisCard: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Glass.backgroundColor,
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: Colors.secondary,
    borderTopColor: 'transparent'
  },
  liveLabel: { ...Typography.labelCaps },
  liveValue: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onSurface },
  sectionLow: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl
  },
  section: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl
  },
  sectionTitleCenter: { textAlign: 'center', marginBottom: Spacing.base },
  sectionSubCenter: { textAlign: 'center', color: Colors.onSurfaceVariant, marginBottom: Spacing.lg },
  pillarsRow: { flexDirection: 'column', gap: Spacing.gutter },
  pillarCard: {
    backgroundColor: Glass.backgroundColor,
    borderWidth: 1,
    borderColor: Glass.borderColor,
    borderRadius: 24,
    padding: Spacing.lg,
    gap: Spacing.sm
  },
  pillarTitle: { ...Typography.headlineMd, color: Colors.onSurface },
  pillarBody: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md
  },
  featureCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.35)',
    borderRadius: 16,
    padding: Spacing.md
  },
  featureTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.onSurface,
    marginVertical: Spacing.xs
  },
  featureBody: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 14 },
  howSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl
  },
  stepRow: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(124,131,155,0.3)',
    paddingLeft: Spacing.md,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base
  },
  stepNum: {
    ...Typography.displayHero,
    fontSize: 40,
    color: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    left: 8,
    top: -6
  },
  stepTitle: { ...Typography.headlineMd, color: '#ffffff', marginBottom: Spacing.xs },
  stepBody: { ...Typography.bodyMd, color: Colors.onPrimaryContainer, zIndex: 1 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    gap: Spacing.sm
  },
  statValue: { ...Typography.displayHero, fontSize: 30, lineHeight: 36, color: Colors.secondary },
  statLabel: { ...Typography.labelCaps, fontSize: 9, textAlign: 'center', marginTop: 4, color: Colors.onSurface },
  marketSection: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl
  },
  viewCoachesBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8
  },
  viewCoachesText: { ...Typography.labelCaps, color: Colors.onSecondary },
  coachCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.gutter,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  coachImg: { width: '100%', height: 200 },
  verifiedPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Glass.backgroundColor,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999
  },
  verifiedText: { ...Typography.labelCaps, fontSize: 10, color: Colors.secondary },
  coachName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.onSurface },
  coachRole: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,198,205,0.2)',
    marginVertical: Spacing.sm
  },
  coachPrice: { fontFamily: 'Inter_700Bold', color: Colors.secondary, fontWeight: '700' },
  bookLink: {
    ...Typography.labelCaps,
    color: Colors.primary,
    textDecorationLine: 'underline'
  },
  tierCard: {
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.4)',
    borderRadius: 24,
    padding: Spacing.lg
  },
  tierLabel: { ...Typography.labelCaps, color: Colors.onSurfaceVariant, marginBottom: Spacing.xs },
  tierLabelDark: { ...Typography.labelCaps, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.xs },
  tierPrice: { ...Typography.headlineLg, marginBottom: Spacing.md },
  tierPriceDark: { ...Typography.headlineLg, color: '#ffffff' },
  tierPerMo: { ...Typography.bodyMd, color: 'rgba(255,255,255,0.7)', marginLeft: 4 },
  tierPerMoLight: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginLeft: 4 },
  tierProCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10
  },
  popularPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 999
  },
  popularText: { ...Typography.labelCaps, fontSize: 10, color: Colors.onSecondaryContainer },
  tierOutlineBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.md
  },
  tierOutlineText: { ...Typography.headlineMd, fontSize: 18, lineHeight: 24 },
  proUnlockBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.md
  },
  proUnlockText: { ...Typography.headlineMd, fontSize: 18, lineHeight: 24, color: Colors.onSecondary },
  devCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Glass.backgroundColor,
    borderWidth: 1,
    borderColor: Glass.borderColor,
    borderRadius: 24,
    padding: Spacing.md,
    alignItems: 'center'
  },
  devImg: { width: 110, height: 110, borderRadius: 55, marginBottom: Spacing.md },
  devName: { fontFamily: 'Inter_700Bold', fontSize: 17, color: Colors.onSurface, textAlign: 'center' },
  devRole: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.secondary, textAlign: 'center', marginTop: 2 },
  devField: { ...Typography.bodyMd, fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.35)',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md
  },
  faqQuestion: { fontFamily: 'Geist_600SemiBold', fontSize: 17, fontWeight: '600', color: Colors.onSurface, flex: 1, paddingRight: 8 },
  faqAnswer: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: Spacing.sm },
  ctaSection: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.xl
  },
  ctaPanel: {
    backgroundColor: Glass.backgroundColor,
    borderWidth: 1,
    borderColor: Glass.borderColor,
    borderRadius: 48,
    padding: Spacing.xl > 48 ? 32 : 32
  },
  enterpriseBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56
  },
  enterpriseText: { ...Typography.headlineMd, fontSize: 18, lineHeight: 24 },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.marginMobile,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,198,205,0.2)',
    backgroundColor: Colors.surfaceContainerLowest
  },
  footerBrand: { ...Typography.headlineMd, color: Colors.primary },
  footerCopy: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: Spacing.xs, textAlign: 'center' },
  footerLink: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 14 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(247,249,251,0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,198,205,0.35)',
    paddingVertical: Spacing.base,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  bottomNavItem: { alignItems: 'center', justifyContent: 'center' },
  bottomNavLabel: { ...Typography.labelCaps, fontSize: 10, marginTop: 2, color: Colors.onSurfaceVariant }
});
