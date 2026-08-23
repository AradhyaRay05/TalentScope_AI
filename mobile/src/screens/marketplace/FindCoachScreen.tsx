import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Glass } from '../../theme/colors';
import { getCoaches } from '../../services/api';

const COACH_CARDS = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSjWh24stxnk030t83Sqx38TTOmSJYV6SpMuUXKmI8-DIQ2PRRKWnLI3LEnE8Eo5FrZQ7KC4-KY5lBTLdjY4sULraSY4Xnuna4v5l09lw2esBoV-2ZxALUktUxvur0gtZy72wJoFt685e6h0Ek5gpUAW3-VwiFXii9zLNuuLTHzEs418xkTNK_qHWHH3TmwBjYveRETw1KE6-pmZ7GcfubHOlT9T3fLOm6cM2LBzsvFVy0OZ5D1q91E8jgGUyBvOmSphR_gOjacx8',
    rating: '4.9',
    specialty: 'STRENGTH & CONDITIONING',
    name: 'Dr. Marcus Vance',
    exp: '12+ Years Exp.',
    price: '$150',
    quote: '"Optimizing metabolic thresholds through proprietary AI-driven biomechanical feedback loops."',
    tags: ['Biometrics', 'Sprint Mechanics', 'NFL Prep']
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzdcpQWKPPaTVWWZe_JjtAvOVCPusIkwNzmE5468QyEAUjhsouz4Bp7N0C5N4ccnv40RBBxLXZ7GJBzeMm4JFEeA-jT3KIXw8Zd-WGO6tgkIiwL0MQNqMb6CI9u0ThlrvbxgSPf5wCdgOQbWr__BOnfl2jLOIvAgsszFlzqR_kssF1s2r1PoH9w4C0EmYwd6cISvIVYwoWlPtykBN0y2QnASTd62cxeCPCOMXi_DnlKvSaH1W_J46Lax49OBpvkUnWNV2GvcxFzFo',
    rating: '5.0',
    specialty: 'DATA ANALYSIS / SWIMMING',
    name: 'Elena Rodriguez',
    exp: '8 Years Exp.',
    price: '$125',
    quote: '"Specializing in hydro-dynamic drag reduction and high-frequency stroke optimization."',
    tags: ['VO2 Max', 'Hydro-Dynamics', 'Olympic Level']
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKQBhRhndCI-qMaHripr716Th49Tmc4Q6td6bqbHvqgGTiAcTK2y09p33V9A8K5dGXe-KIPZJqseu7IwzooiRoc-fpAs6f9MmAIU-td29aI4QyMuU4ARy6i-Bnj-g6Kjv48Ug2eaYmJtoGvv3Ytl444HpEfXiteVVLo2TYXd4DGzuei6WYszZstBPRBx0j7Hi9pu45hFWMbBtfKsd7y1Pv7fSsptkIlchcODiYSECxdsutYx5GteCYMb9UT-2VHGcOt1IugOxX58Q',
    rating: '4.8',
    specialty: 'NEUROMUSCULAR RECOVERY',
    name: 'James Sterling',
    exp: '15 Years Exp.',
    price: '$190',
    quote: '"Integrating CNS fatigue monitoring with elite recovery protocols for maximum longevity."',
    tags: ['CNS Optimization', 'Sleep Tech', 'Recovery AI']
  }
];

const PACKAGES = [
  {
    label: 'FOUNDATION',
    price: '$49',
    dark: false,
    features: [
      { text: '3 AI Assessments/mo', included: true },
      { text: 'Public Market Access', included: true },
      { text: 'Elite Biometric Tracking', included: false }
    ],
    cta: 'Select Foundation'
  },
  {
    label: 'ELITE PERFORMANCE',
    price: '$199',
    dark: true,
    features: [
      { text: 'Unlimited AI Assessments', included: true },
      { text: '1-on-1 Strategy Session', included: true },
      { text: 'Full Biometric Dashboard', included: true }
    ],
    cta: 'Get Elite Access'
  },
  {
    label: 'TEAM / PRO',
    price: '$499',
    dark: false,
    features: [
      { text: 'Multi-Athlete Monitoring', included: true },
      { text: 'Custom AI Integration', included: true },
      { text: 'Dedicated Support API', included: true }
    ],
    cta: 'Contact Enterprise'
  }
];

const SPORT_OPTIONS = ['All Sports', 'Football / Soccer', 'Athletics', 'Swimming', 'Strength & Conditioning'];
const EXP_OPTIONS = ['Any Years', '5+ Years', '10+ Years', 'Professional Only'];

export default function FindCoachScreen({ navigation }: any) {
  const [sport, setSport] = useState(SPORT_OPTIONS[0]);
  const [experience, setExperience] = useState(EXP_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState(50);
  const [coaches, setCoaches] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCoaches();
        const list = res?.data || res?.coaches || [];
        if (mounted && Array.isArray(list) && list.length > 0) setCoaches(list);
      } catch {
        // fall back to static demo cards
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const displayedCards =
    coaches && coaches.length
      ? coaches.map(c => ({
          key: c._id || c.id || c.name,
          img:
            c.avatar ||
            c.photo ||
            COACH_CARDS[Math.floor(Math.random() * COACH_CARDS.length)].img,
          rating: String(c.rating ?? 4.9),
          specialty: (c.title || c.specialties?.[0] || 'ELITE COACH').toUpperCase(),
          name: c.name || 'Coach',
          exp: `${c.experienceYears || 10}+ Years Exp.`,
          price: `$${c.hourlyRate || c.rate || 150}`,
          quote: `"${c.bio || 'Verified TalentScope AI coach specializing in elite performance optimization.'}"`,
          tags: Array.isArray(c.specialties) ? c.specialties.slice(0, 3) : ['Biometrics', 'Performance']
        }))
      : COACH_CARDS.map(c => ({ ...c, key: c.name }));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>TalentScope AI</Text>
        <View style={styles.headerSearch}>
          <Icon name="search" size={18} color={Colors.onSurfaceVariant} />
          <TextInput placeholder="Search experts..." placeholderTextColor="rgba(118,119,125,0.6)" style={styles.headerSearchInput} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[Typography.labelCaps, { color: Colors.secondary, marginBottom: Spacing.xs }]}>ELITE NETWORK</Text>
          <Text style={[Typography.displayHero, { fontSize: 36, lineHeight: 42, letterSpacing: -1.4 }]}>
            Discover High Performance.
          </Text>
          <Text style={[Typography.bodyLg, { fontSize: 16, lineHeight: 25, color: Colors.onSurfaceVariant, marginTop: Spacing.base }]}>
            Access verified AI-enhanced coaches specializing in elite biometrics and professional performance optimization.
          </Text>
        </View>

        {/* Filter Bar */}
        <View style={[styles.filterBar]}>
          <View style={{ width: '47%', flexGrow: 1 }}>
            <Text style={styles.filterLabel}>SPORT CATEGORY</Text>
            <OptionSelector options={SPORT_OPTIONS} value={sport} onChange={setSport} />
          </View>
          <View style={{ width: '47%', flexGrow: 1 }}>
            <Text style={styles.filterLabel}>LOCATION</Text>
            <View style={styles.locationWrap}>
              <Icon name="location-on" size={16} color={Colors.onSurfaceVariant} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Search city..."
                placeholderTextColor={Colors.onSurfaceVariant}
                style={styles.locationInput}
              />
            </View>
          </View>
          <View style={{ width: '47%', flexGrow: 1 }}>
            <Text style={styles.filterLabel}>EXPERIENCE</Text>
            <OptionSelector options={EXP_OPTIONS} value={experience} onChange={setExperience} />
          </View>
          <View style={{ width: '47%', flexGrow: 1 }}>
            <Text style={styles.filterLabel}>PRICE RANGE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <Text style={styles.priceSymbol}>$</Text>
              <View style={styles.rangeTrack}>
                <TouchableOpacity style={[styles.rangeFillTouch, { width: `${priceRange}%` }]} onPress={() => setPriceRange(p => Math.min(p + 10, 100))}>
                  <View style={[styles.rangeThumb, { left: `${Math.max(priceRange - 4, 0)}%` }]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.priceSymbol}>$$$</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Coach Cards */}
        <View style={{ paddingHorizontal: Spacing.marginMobile }}>
          <View style={{ gap: Spacing.gutter, marginTop: Spacing.lg }}>
            {displayedCards.map(c => (
              <View key={c.key} style={styles.coachCard}>
                <View>
                  <Image source={{ uri: c.img }} style={styles.coachImage} />
                  <View style={styles.ratingPill}>
                    <Icon name="star" size={15} color={Colors.secondary} />
                    <Text style={styles.ratingText}>{c.rating}</Text>
                  </View>
                  <View style={styles.nameGradient}>
                    <Text style={[Typography.labelCaps, { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.85)' }]}>
                      {c.specialty}
                    </Text>
                    <Text style={styles.coachName}>{c.name}</Text>
                  </View>
                </View>
                <View style={{ padding: Spacing.md, gap: Spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                      <Icon name="history-edu" size={20} color={Colors.onSurfaceVariant} />
                      <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, fontSize: 14 }]}>{c.exp}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={styles.price}>{c.price}</Text>
                      <Text style={styles.perHour}>/hr</Text>
                    </View>
                  </View>
                  <Text style={styles.quote}>{c.quote}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs }}>
                    {c.tags.map(t => (
                      <View key={t} style={styles.tagPill}>
                        <Text style={styles.tagText}>{t.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.base }}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('CoachProfile')}
                    >
                      <Text style={styles.detailsBtnText}>See Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
                      <Text style={styles.bookBtnText}>Book Consultation</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Membership Packages */}
        <View style={{ paddingHorizontal: Spacing.marginMobile, marginTop: Spacing.xl }}>
          <Text style={Typography.headlineLgMobile}>Membership Packages</Text>
          <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant, marginTop: Spacing.xs }]}>
            Scalable elite performance coaching for every level of professional development.
          </Text>
          <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
            {PACKAGES.map(p => (
              <View key={p.label} style={[p.dark ? styles.packageDark : styles.packageLight]}>
                {p.dark && <View style={styles.packageGlow} />}
                <Text style={[Typography.labelCaps, { letterSpacing: 3.2, marginBottom: Spacing.md, color: p.dark ? Colors.secondaryFixedDim : Colors.onSurfaceVariant }]}>
                  {p.label}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.lg }}>
                  <Text style={p.dark ? styles.packagePriceDark : styles.packagePrice}>{p.price}</Text>
                  <Text style={[Typography.bodyMd, { marginLeft: 4, color: p.dark ? Colors.onPrimaryContainer : Colors.onSurfaceVariant }]}>
                    /month
                  </Text>
                </View>
                {p.features.map(f => (
                  <View key={f.text} style={[styles.packageFeatureRow, !f.included && { opacity: 0.4 }]}>
                    <Icon
                      name={f.included ? (p.dark ? 'verified' : 'check-circle') : 'cancel'}
                      size={19}
                      color={p.dark ? Colors.secondaryFixed : f.included ? Colors.secondary : Colors.outline}
                    />
                    <Text style={[Typography.bodyMd, { flex: 1 }, p.dark && { color: '#ffffff' }]}>{f.text}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.packageBtn, p.dark ? styles.packageBtnDarkSolid : styles.packageBtnOutline]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.packageBtnText, p.dark ? { color: '#ffffff' } : {}]}>{p.cta}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function OptionSelector({
  options,
  value,
  onChange
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onChange(options[(options.indexOf(value) + 1) % options.length])}
      style={styles.selectBox}
      activeOpacity={0.8}
    >
      <Text style={styles.selectValue} numberOfLines={1}>
        {value}
      </Text>
      <Icon name="expand-more" size={18} color={Colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
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
  brand: { ...Typography.headlineMd, fontSize: 20, lineHeight: 26, letterSpacing: -0.8, color: Colors.primary },
  headerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.35)',
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    width: 160
  },
  headerSearchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurface, padding: 0 },
  heroSection: { paddingHorizontal: Spacing.marginMobile, paddingTop: Spacing.lg },
  filterBar: {
    marginHorizontal: Spacing.marginMobile,
    marginTop: Spacing.lg,
    backgroundColor: Glass.backgroundColor,
    borderWidth: 1,
    borderColor: Glass.borderColor,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4
  },
  filterLabel: { ...Typography.labelCaps, fontSize: 9, color: Colors.onSurfaceVariant, marginBottom: Spacing.xs },
  selectBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.base
  },
  selectValue: { ...Typography.bodyMd, fontSize: 14, color: Colors.onSurface, flexShrink: 1 },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm
  },
  locationInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface, paddingVertical: Spacing.base },
  rangeTrack: {
    flex: 1,
    height: 24,
    justifyContent: 'center'
  },
  rangeFillTouch: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent'
  },
  rangeThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary
  },
  priceSymbol: { ...Typography.bodyMd, fontSize: 14, color: Colors.onSurfaceVariant },
  applyBtn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base
  },
  applyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: '#ffffff' },
  coachCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4
  },
  coachImage: { width: '100%', height: 220 },
  ratingPill: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  ratingText: { ...Typography.monoData },
  nameGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  coachName: { ...Typography.headlineMd, color: '#ffffff', marginTop: 2 },
  price: { fontFamily: 'Geist_600SemiBold', fontSize: 22, fontWeight: '700', color: Colors.primary },
  perHour: { ...Typography.bodyMd, fontSize: 14, color: Colors.onSurfaceVariant },
  quote: { ...Typography.bodyMd, fontStyle: 'italic', fontSize: 14, lineHeight: 21, color: Colors.onSurfaceVariant },
  tagPill: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 999
  },
  tagText: { fontSize: 11, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.onSurfaceVariant },
  detailsBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailsBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: Colors.primary },
  bookBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bookBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: Colors.onPrimary },
  packageLight: {
    backgroundColor: Glass.backgroundColor,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.2)',
    borderRadius: 12,
    padding: Spacing.lg > 48 ? 32 : 24
  },
  packageDark: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg > 48 ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8
  },
  packageGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,104,122,0.25)'
  },
  packagePrice: { ...Typography.displayHero, fontSize: 40, lineHeight: 46, color: Colors.primary },
  packagePriceDark: { ...Typography.displayHero, fontSize: 40, lineHeight: 46, color: '#ffffff' },
  packageFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.sm
  },
  packageBtn: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.base
  },
  packageBtnOutline: { borderWidth: 2, borderColor: Colors.primary },
  packageBtnDarkSolid: { backgroundColor: Colors.secondary },
  packageBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, fontWeight: '700', color: Colors.primary }
});
