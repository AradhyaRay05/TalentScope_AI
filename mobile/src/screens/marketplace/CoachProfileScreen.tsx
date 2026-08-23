import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Glass } from '../../theme/colors';

const COACH_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBhfEtlsggKfjYoaII9XCY_qnOhJUA719DQhNrClutidTyghFnm2XBlPhjU4uYndIFd6z-hDyj_on1tVSKfiSnZHqD2P46YdkmpG_LEIC_fExzBh5gUox6yKdkwpifUzLkKmTm9jaydeu46yok-m_f5XxlDROr2UYOhyKkx6Pn5XY1Jm3NjEybabfjGqnmMCcVsKlKD6Ls2wymGQ9TiMqWdvwtn0xtvYsx9pbDl2yp55DoCVAFLLVI29KzEnnqjGSEh7SW5Az1yDB4';

const ATHLETE_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBiUu_Ky7ZhlfrqNIsnEVCnF4cdO4DE_Kh3eP1tMUuPy29hL29tTOZhJLOCyZh9zZTL6AzPpg38RS1i_-GkOoDQ3gVvslUqFDcKd1emRH0IY0WYrehEz6DbQSGZ2PvJJzM0aIg7r6APWj2atao3GXW9e27CnmGGTsKmqxLQjlT0tvxGdU4yVBmFa92-fddo8mUkilP90q81sFRbvGNUTuep-d7mo_Xbse3M1AgECMlA3rDU2fIcSHhT6AW_s9RrYfBmvhEDMPFOaCk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDXc618l1RV70sewkX02buKL6inYlVInqThMU6AmASdIlJNymrPCU4HSLSz1vgBWlDBBuyfX8eHVXldxZHlNE4K6cGohJFw1j6Jx6mxZVhI_3v-AZ06Yz1cdueW92bNCsgkmzrp1P8tP8sIk57ThX6aNY3sPDkd6exsZJombYF6zzTVNFczI7oOVVGiXEBYTKTxJtl6vfXb3nV4VSMWMf7SzbFl1p5A8NA_Y21qe1TDt-N8RLZyPECAoy_H7i0frkBt7BsqcG0Cbsg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAdzUPNMOJzIQ2CfClAPIg3toJ3yfgpcS09HgK8d2fX5k1JWEGjJbx4zsKATghiMJSW_8pg11bEr5rasSR8eHe1SIJh4ORnF6-jJTjpDGVKR-LUNCTEUS3eiUf7x5OCAq6mL-fdyj8-mmoP3LDfF7VoM6Oeqex1pMZlWPzqeK8lIFTk_VsUbohSVXt-8ioY2fM4IlPVlalfOKfIOcc8sUCb9tU2kBas9P0Kn5l4pLRQp8F5x9bZO4XRv6HdMzNMbNa484Lnu4W0-c8'
];

const EXPERIENCE = [
  {
    role: 'Global Performance Lead',
    period: '2020 — PRESENT | TalentScope AI',
    body: 'Orchestrating AI-driven training protocols for Top-50 ATP & WTA players.',
    active: true
  },
  {
    role: 'Senior Biomechanist',
    period: '2014 — 2020 | Olympic Training Center',
    body: 'Led the research team focusing on sprinting mechanics and lactic threshold optimization.',
    active: false
  }
];

const STORIES = [
  {
    icon: 'trending-up' as const,
    title: '14% Power Increase',
    quote:
      '"Through Marcus\'s AI protocols, we identified a 3-degree ankle misalignment that was leaking power. Within 4 months, my explosive power output reached career highs."',
    author: '— Pro Decathlete'
  },
  {
    icon: 'monitor-heart' as const,
    title: 'Injury Free for 24 Months',
    quote:
      '"Marcus\'s predictive modeling completely changed my approach to load management. We now know exactly when to push and when to de-load."',
    author: '— Elite Marathon Runner'
  }
];

const CERTIFICATIONS = ['CSCS® EXCELLENCE', 'NASM PES', 'AI DATA ETHICS', 'MSC BIOMECHANICS'];

const REVIEWS = [
  {
    stars: 5,
    text: '"Marcus doesn\'t just coach; he engineer\'s human performance. The TalentScope integration is seamless."',
    name: 'Sarah Jenkins',
    role: 'ULTRA MARATHONER'
  },
  {
    stars: 4.5,
    text: '"Elite-tier insights. We\'ve optimized my recovery cycles by 22% using Marcus\'s dashboard."',
    name: 'David Chen',
    role: 'PRO TENNIS'
  },
  {
    stars: 5,
    text: '"The best investment in my career. The data visualizations make complex science easy to act on."',
    name: 'Elena Rodriguez',
    role: 'NATIONAL TEAM COACH'
  }
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CALENDAR_DATES = [
  { day: 28, state: 'muted' },
  { day: 29, state: 'muted' },
  { day: 30, state: 'muted' },
  { day: 1, state: 'available' },
  { day: 2, state: 'selected' },
  { day: 3, state: 'available' },
  { day: 4, state: 'available' }
];

export default function CoachProfileScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(2);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TalentScope AI</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={18} color={Colors.onSurfaceVariant} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <Image source={{ uri: COACH_IMG }} style={styles.headerAvatar} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ paddingHorizontal: Spacing.marginMobile, paddingTop: Spacing.lg, flexDirection: 'row', gap: Spacing.md }}>
          <View style={styles.heroPhotoWrap}>
            <Image source={{ uri: COACH_IMG }} style={styles.heroPhoto} />
            <View style={styles.eliteBadge}>
              <Icon name="verified" size={14} color={Colors.onSecondaryContainer} />
              <Text style={styles.eliteBadgeText}>ELITE TIER</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: Spacing.marginMobile, marginTop: Spacing.md }}>
          <Text style={[Typography.labelCaps, { fontSize: 11, letterSpacing: 2.4, color: Colors.secondary }]}>
            LEAD PERFORMANCE SPECIALIST
          </Text>
          <Text style={[Typography.displayHero, { fontSize: 34, lineHeight: 40, letterSpacing: -1.4, marginTop: 4 }]}>
            Marcus Vanhouten
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.base }}>
            <MetaChip icon="location-on" text="Zurich, Switzerland" />
            <MetaChip icon="star" text="4.9" bold suffix="(128 Reviews)" />
            <MetaChip icon="workspace-premium" text="15+ Years Experience" />
          </View>
          <Text style={[Typography.bodyLg, { fontSize: 16, lineHeight: 25, color: Colors.onSurfaceVariant, marginTop: Spacing.md }]}>
            Pioneering the intersection of biomechanical data analysis and elite human performance. I help Olympic-level
            athletes unlock marginal gains through TalentScope AI's predictive modeling.
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
            <TouchableOpacity style={styles.bookAssessmentBtn} activeOpacity={0.85}>
              <Text style={styles.bookAssessmentText}>Book Assessment</Text>
              <Icon name="calendar-today" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.portfolioBtn} activeOpacity={0.85}>
              <Text style={styles.portfolioText}>View Portfolio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Biography + Experience + Stories */}
        <View style={{ paddingHorizontal: Spacing.marginMobile, marginTop: Spacing.xl, gap: Spacing.gutter }}>
          <SectionCard label="BIOGRAPHY">
            <Text style={styles.proseParagraph}>
              Marcus specializes in high-velocity mechanics and recovery optimization. Having spent a decade as the Lead
              Sports Scientist for European Athletics, he transitioned to TalentScope AI to leverage neural networks in
              predicting injury risks before they manifest.
            </Text>
            <Text style={[styles.proseParagraph, { marginTop: Spacing.base }]}>
              His philosophy centers on "The Precision Index"—a data-driven approach where every micro-movement is
              analyzed, cataloged, and optimized for maximum output with minimum metabolic cost.
            </Text>
          </SectionCard>

          <SectionCard label="PROFESSIONAL EXPERIENCE">
            <View style={{ gap: Spacing.md }}>
              {EXPERIENCE.map(e => (
                <View key={e.role} style={{ flexDirection: 'row', gap: Spacing.md }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={[styles.timelineDot, e.active && styles.timelineDotActive]} />
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={{ flex: 1, paddingBottom: Spacing.sm }}>
                    <Text style={styles.timelineRole}>{e.role}</Text>
                    <Text style={[Typography.labelCaps, { fontSize: 10, color: Colors.secondary, marginTop: 4 }]}>{e.period}</Text>
                    <Text style={[Typography.bodyMd, { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: Spacing.sm }]}>
                      {e.body}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </SectionCard>

          <View>
            <Text style={styles.sectionLabel}>SUCCESS STORIES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.base }}>
              {STORIES.map(s => (
                <View key={s.title} style={styles.storyCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.base }}>
                    <View style={styles.storyIconBox}>
                      <Icon name={s.icon} size={20} color={Colors.secondary} />
                    </View>
                    <Text style={Typography.headlineMd}>{s.title}</Text>
                  </View>
                  <Text style={styles.storyQuote}>{s.quote}</Text>
                  <Text style={styles.storyAuthor}>{s.author}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Booking Sidebar */}
        <View style={{ paddingHorizontal: Spacing.marginMobile, marginTop: Spacing.gutter, gap: Spacing.gutter }}>
          <View style={styles.bookingCard}>
            <Text style={[Typography.labelCaps, { color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.md }]}>
              BOOK ASSESSMENT
            </Text>
            <View style={styles.calendarWeekRow}>
              {WEEK_DAYS.map((d, i) => (
                <Text key={`wd-${i}`} style={styles.calendarDayLabel}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={styles.calendarDatesRow}>
              {CALENDAR_DATES.map(c => (
                <TouchableOpacity
                  key={c.day}
                  disabled={c.state === 'muted'}
                  onPress={() => setSelectedDate(c.day)}
                  style={[
                    styles.dateCell,
                    c.state === 'muted' && styles.dateCellMuted,
                    c.state === 'available' && selectedDate !== c.day && styles.dateCellAvailable,
                    selectedDate === c.day && styles.dateCellSelected
                  ]}
                >
                  <Text
                    style={[
                      styles.dateCellText,
                      selectedDate === c.day && styles.dateCellTextSelected,
                      c.state === 'muted' && styles.dateCellTextMuted
                    ]}
                  >
                    {c.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.sessionBtn} activeOpacity={0.85}>
              <Text style={styles.sessionBtnText}>Select 14:00 Session</Text>
            </TouchableOpacity>
            <Text style={styles.slotNote}>Next available slot: Oct 2nd, 2024</Text>
          </View>

          <SectionCard label="PRICING TIERS">
            <View style={styles.pricingRowWrap}>
              <View style={styles.pricingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={Typography.headlineMd}>Single Analysis</Text>
                  <Text style={styles.pricingNote}>Deep dive biomechanical assessment with AI report.</Text>
                </View>
                <Text style={styles.pricingValue}>$249</Text>
              </View>
              <View style={styles.pricingDivider} />
              <View style={styles.pricingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.headlineMd, { color: Colors.secondary }]}>Elite Monthly</Text>
                  <Text style={styles.pricingNote}>Full-time load management, 24/7 AI monitoring, and weekly calls.</Text>
                </View>
                <Text style={[styles.pricingValue, { color: Colors.secondary }]}>$899</Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard label="CERTIFICATIONS">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              {CERTIFICATIONS.map(cert => (
                <View key={cert} style={styles.certChip}>
                  <Text style={styles.certChipText}>{cert}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard label="NOTABLE ATHLETES">
            <View style={styles.athletesRow}>
              {ATHLETE_AVATARS.map((uri, i) => (
                <Image key={uri.slice(-12)} source={{ uri }} style={[styles.athleteAvatar, i > 0 && styles.athleteAvatarOverlap]} />
              ))}
              <View style={[styles.moreAthletesChip, styles.athleteAvatarOverlap]}>
                <Text style={styles.moreAthletesText}>+42</Text>
              </View>
            </View>
            <Text style={styles.notableNote}>Includes 3 World Record holders and 12 Olympic Medallists.</Text>
          </SectionCard>
        </View>

        {/* Reviews */}
        <View style={{ paddingHorizontal: Spacing.marginMobile, marginTop: Spacing.xl }}>
          <Text style={styles.sectionLabel}>TRUSTED BY THE BEST</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.base }}>
            {REVIEWS.map(r => (
              <View key={r.name} style={[Glass, styles.reviewCard, r.stars === 5 && { borderLeftWidth: 4, borderLeftColor: Colors.secondary }]}>
                <View style={{ flexDirection: 'row', gap: 2, marginBottom: Spacing.sm }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Icon
                      key={n}
                      name="star"
                      size={15}
                      color={Colors.secondary}
                      style={n > Math.floor(r.stars) ? { opacity: r.stars % 1 >= 0.5 ? 0.45 : 0.2 } : {}}
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md }}>
                  <View style={styles.reviewerAvatar} />
                  <View>
                    <Text style={styles.reviewerName}>{r.name}</Text>
                    <Text style={styles.reviewerRole}>{r.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetaChip({ icon, text, bold, suffix }: { icon: keyof typeof Icon.glyphMap; text: string; bold?: boolean; suffix?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={17} color={Colors.onSurfaceVariant} />
      <Text style={[Typography.bodyMd, { fontSize: 14 }, bold && { fontFamily: 'Inter_700Bold', fontWeight: '700' }]}>
        {text}
        {suffix ? <Text style={{ opacity: 0.6, fontSize: 13 }}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={[Glass, styles.sectionCard]}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,249,251,0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.15)'
  },
  brand: { ...Typography.headlineMd, letterSpacing: -0.8, color: Colors.primary },
  backText: { fontFamily: 'Inter_500Medium', fontSize: 14, fontWeight: '500', color: Colors.onSurfaceVariant },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  heroPhotoWrap: { width: '55%' },
  heroPhoto: { aspectRatio: 1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(198,198,205,0.2)' },
  eliteBadge: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  eliteBadgeText: { ...Typography.labelCaps, fontSize: 11, color: Colors.onSecondaryContainer },
  sectionCard: { borderRadius: 12, padding: Spacing.md },
  sectionLabel: { ...Typography.labelCaps, color: Colors.onSurfaceVariant, marginBottom: Spacing.md },
  proseParagraph: { ...Typography.bodyMd, lineHeight: 26, color: Colors.onSurfaceVariant },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.outline },
  timelineDotActive: { backgroundColor: Colors.secondary, shadowColor: Colors.secondary, shadowOpacity: 0.25, shadowRadius: 6 },
  timelineLine: { width: 1, flex: 1, minHeight: 48, backgroundColor: 'rgba(198,198,205,0.35)', marginVertical: 4 },
  timelineRole: { ...Typography.headlineMd, fontSize: 19, lineHeight: 25 },
  storyCard: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    padding: Spacing.md
  },
  storyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,104,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  storyQuote: { ...Typography.bodyMd, fontSize: 14, lineHeight: 21, color: Colors.onSurfaceVariant },
  storyAuthor: { ...Typography.labelCaps, fontSize: 10, marginTop: Spacing.md, opacity: 0.6 },
  bookingCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  calendarDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  calendarDatesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dateCell: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateCellMuted: { opacity: 0.2 },
  dateCellAvailable: { backgroundColor: 'rgba(255,255,255,0.1)' },
  dateCellSelected: { backgroundColor: Colors.secondary },
  dateCellText: { fontSize: 13, color: '#ffffff' },
  dateCellTextSelected: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
  dateCellTextMuted: { color: 'rgba(255,255,255,0.5)' },
  sessionBtn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.base
  },
  sessionBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, fontWeight: '700', color: Colors.onSecondary },
  slotNote: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: Spacing.sm },
  pricingRowWrap: {},
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  pricingDivider: { borderTopWidth: 1, borderTopColor: 'rgba(198,198,205,0.2)', marginVertical: Spacing.md },
  pricingNote: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 4 },
  pricingValue: { ...Typography.headlineMd, fontSize: 20, lineHeight: 26, fontFamily: 'Geist_600SemiBold', fontWeight: '700' },
  certChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)'
  },
  certChipText: { fontSize: 12, fontFamily: 'Inter_700Bold', fontWeight: '700' },
  athletesRow: { flexDirection: 'row', alignItems: 'center' },
  athleteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  athleteAvatarOverlap: { marginLeft: -12 },
  moreAthletesChip: {
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  moreAthletesText: { fontSize: 10, fontFamily: 'Inter_700Bold', fontWeight: '700' },
  notableNote: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: Spacing.sm },
  reviewCard: { width: '100%', flexGrow: 1, borderRadius: 12, padding: Spacing.md },
  reviewText: { ...Typography.bodyMd, fontStyle: 'italic', fontSize: 14, lineHeight: 21 },
  reviewerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceContainerHighest },
  reviewerName: { fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700' },
  reviewerRole: { ...Typography.labelCaps, fontSize: 10, opacity: 0.5 },
  bookAssessmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.sm + 2
  },
  bookAssessmentText: { fontFamily: 'Inter_700Bold', fontSize: 15, fontWeight: '700', color: Colors.onPrimary },
  portfolioBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  portfolioText: { fontFamily: 'Inter_700Bold', fontSize: 15, fontWeight: '700', color: Colors.secondary }
});
