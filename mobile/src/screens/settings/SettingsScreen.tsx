import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme/colors';
import { getProfile } from '../../services/api';

const PROFILE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4GB9SlvlVBkom21qGdHYDAFRRnXKQ3ZBXFu61OonF3USwm9YhE8dIygCqSkd0PK-ZBDdWwCPzMy52ILzK8QUuaWFqO1_cOr1aKkZWL-hDhnAR-Qh-cn1JJLeCOBAtPcVh6QHmZwfzmiBce5iYjFdMmzFsC6yLkrIZeS0GmdQoeaZ5vx0QKh85pAo_1diLeu1qrIpfmQQXT6QFhzFW7URNrGTPjxt3gkzImp4wgKebBF_4xLUGEFVAlwEQ0MnZuISrB_KEIm3Z-Gk';

const LANGUAGES = ['English (United States)', 'German (Germany)', 'French (France)', 'Spanish (Spain)'];
const TIMEZONES = ['GMT -5:00 (Eastern Time)', 'GMT +0:00 (London)', 'GMT +1:00 (Berlin)'];

export default function SettingsScreen({ navigation }: any) {
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [emailReports, setEmailReports] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProfile();
        if (mounted) setProfile(res?.user || res?.data || null);
      } catch {
        // offline — keep static display values
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fullName = profile?.name || 'Felix Vanderwaal';
  const email = profile?.email || 'f.vanderwaal@performance.ai';
  const specialization = profile?.specialization || 'Sprinting & Biometrics';
  const affiliation = profile?.affiliation || 'Elite Track Global';
  const plan = profile?.tier || 'Elite Professional';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }} onPress={() => navigation.goBack()}>
          <Icon name="notifications" size={22} color={Colors.onSurface} />
          <Image source={{ uri: PROFILE_IMG }} style={styles.headerAvatar} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={[Typography.headlineLgMobile, { color: Colors.primary, marginBottom: Spacing.xs }]}>Settings</Text>
          <Text style={[Typography.bodyMd, { color: Colors.onSurfaceVariant }]}>
            Manage your elite performance profile and account preferences.
          </Text>
        </View>

        <View style={{ paddingHorizontal: Spacing.marginMobile, gap: Spacing.gutter }}>
          {/* Profile Settings */}
          <SettingsCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Icon name="person" size={20} color={Colors.secondary} />
                <Text style={styles.cardTitle}>PROFILE SETTINGS</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.editLink}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.lg, flexWrap: 'wrap' }}>
              <View>
                <View style={styles.profilePhotoRing}>
                  <Image source={{ uri: PROFILE_IMG }} style={styles.profilePhoto} />
                  <View style={styles.cameraBtn}>
                    <Icon name="photo-camera" size={13} color="#ffffff" />
                  </View>
                </View>
              </View>
              <View style={{ flex: 1, minWidth: '60%', gap: Spacing.md }}>
                <ProfileField label="FULL NAME" value={fullName} />
                <ProfileField label="EMAIL ADDRESS" value={email} />
                <ProfileField label="SPECIALIZATION" value={specialization} />
                <ProfileField label="AFFILIATION" value={affiliation} />
              </View>
            </View>
          </SettingsCard>

          {/* Appearance */}
          <SettingsCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Icon name="palette" size={20} color={Colors.secondary} />
              <Text style={styles.cardTitle}>APPEARANCE</Text>
            </View>
            <ToggleRow
              icon="dark-mode"
              title="Dark Mode"
              subtitle="Reduce eye strain at night"
              value={darkMode}
              onChange={setDarkMode}
              divider
            />
            <ToggleRow
              icon="view-comfy"
              title="Compact View"
              subtitle="Maximize data density"
              value={compactView}
              onChange={setCompactView}
            />
          </SettingsCard>

          {/* Notifications */}
          <SettingsCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Icon name="notifications-active" size={20} color={Colors.secondary} />
              <Text style={styles.cardTitle}>NOTIFICATIONS</Text>
            </View>
            <CheckRow icon="mail" label="Email Reports" checked={emailReports} onToggle={() => setEmailReports(v => !v)} divider />
            <CheckRow icon="vibration" label="Push Alerts" checked={pushAlerts} onToggle={() => setPushAlerts(v => !v)} divider />
            <CheckRow icon="query-stats" label="AI Insight Alerts" checked={aiAlerts} onToggle={() => setAiAlerts(v => !v)} />
          </SettingsCard>

          {/* Subscription */}
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionBlob} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
              <Icon name="workspace-premium" size={20} color={Colors.secondaryFixed} />
              <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.onPrimaryContainer }]}>SUBSCRIPTION</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={styles.subscriptionTitle}>{plan}</Text>
                <Text style={[Typography.bodyMd, { color: Colors.onPrimaryContainer }]}>Renewal: Oct 24, 2024</Text>
              </View>
              <TouchableOpacity style={styles.managePlanBtn} activeOpacity={0.85}>
                <Text style={styles.managePlanText}>Manage Plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Controls */}
          <SettingsCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Icon name="security" size={20} color={Colors.secondary} />
              <Text style={styles.cardTitle}>PRIVACY CONTROLS</Text>
            </View>
            <LinkRow
              icon="privacy-tip"
              title="Data Sharing"
              subtitle="Control how AI models use your training data."
              trailing={<Icon name="chevron-right" size={22} color={Colors.outline} />}
              divider
            />
            <LinkRow
              icon="fingerprint"
              title="Two-Factor Authentication"
              subtitle="Enabled via Authenticator App"
              trailing={<Icon name="check-circle" size={22} color={Colors.onTertiaryContainer} />}
            />
          </SettingsCard>

          {/* Language & Region */}
          <SettingsCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Icon name="language" size={20} color={Colors.secondary} />
              <Text style={styles.cardTitle}>LANGUAGE & REGION</Text>
            </View>
            <View style={{ gap: Spacing.md }}>
              <View>
                <Text style={styles.selectLabel}>PREFERRED LANGUAGE</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() =>
                    setLanguage(LANGUAGES[(LANGUAGES.indexOf(language) + 1) % LANGUAGES.length])
                  }
                >
                  <Text style={styles.selectValue}>{language}</Text>
                  <Icon name="expand-more" size={18} color={Colors.outline} />
                </TouchableOpacity>
              </View>
              <View>
                <Text style={styles.selectLabel}>TIMEZONE</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() =>
                    setTimezone(TIMEZONES[(TIMEZONES.indexOf(timezone) + 1) % TIMEZONES.length])
                  }
                >
                  <Text style={styles.selectValue}>{timezone}</Text>
                  <Icon name="expand-more" size={18} color={Colors.outline} />
                </TouchableOpacity>
              </View>
            </View>
          </SettingsCard>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
              <Icon name="dangerous" size={20} color={Colors.error} />
              <Text style={[Typography.labelCaps, { fontSize: 11, color: Colors.error }]}>DANGER ZONE</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md }}>
              <View style={{ flex: 1, minWidth: 220 }}>
                <Text style={styles.dangerTitle}>Deactivate Account</Text>
                <Text style={styles.dangerBody}>
                  Temporarily disable your profile and assessments. This can be undone.
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <TouchableOpacity style={styles.deactivateBtn} activeOpacity={0.85}>
                  <Text style={styles.deactivateText}>Deactivate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.85}>
                  <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>{children}</View>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueBox}>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
  divider
}: {
  icon: keyof typeof Icon.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, divider && styles.rowDivider]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.surfaceVariant, true: Colors.secondary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

function CheckRow({
  icon,
  label,
  checked,
  onToggle,
  divider
}: {
  icon: keyof typeof Icon.glyphMap;
  label: string;
  checked: boolean;
  onToggle: () => void;
  divider?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.checkRow, divider && styles.rowDivider]} onPress={onToggle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
        <Icon name={icon} size={19} color={Colors.onSurfaceVariant} />
        <Text style={Typography.bodyMd}>{label}</Text>
      </View>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Icon name="check" size={14} color={Colors.onSecondaryContainer} />}
      </View>
    </TouchableOpacity>
  );
}

function LinkRow({
  icon,
  title,
  subtitle,
  trailing,
  divider
}: {
  icon: keyof typeof Icon.glyphMap;
  title: string;
  subtitle: string;
  trailing: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <View style={[styles.linkRow, divider && styles.rowDivider]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
        <Icon name={icon} size={19} color={Colors.onSurfaceVariant} />
        <View>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {trailing}
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(247,249,251,0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,198,205,0.15)'
  },
  headerAvatar: { width: 32, height: 32, borderRadius: 16 },
  pageHeader: { paddingHorizontal: Spacing.marginMobile, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
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
  cardTitle: { ...Typography.labelCaps, fontSize: 11, color: Colors.onSurfaceVariant },
  editLink: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: Colors.secondary },
  profilePhotoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: Colors.secondaryContainer,
    overflow: 'visible'
  },
  profilePhoto: { width: 88, height: 88, borderRadius: 44 },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 5,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  fieldLabel: { ...Typography.labelCaps, fontSize: 9, color: Colors.outline, marginBottom: Spacing.xs },
  fieldValueBox: { borderBottomWidth: 1, borderBottomColor: 'rgba(198,198,205,0.35)', paddingBottom: Spacing.xs },
  fieldValue: { ...Typography.bodyMd },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(198,198,205,0.18)' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm + 2 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: { backgroundColor: Colors.secondaryContainer, borderColor: Colors.secondary },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.base },
  subscriptionCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: 'rgba(198,198,205,0.25)',
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5
  },
  subscriptionBlob: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.secondary,
    opacity: 0.1
  },
  subscriptionTitle: { ...Typography.headlineMd, fontSize: 19, lineHeight: 25, color: '#ffffff', marginBottom: 4 },
  managePlanBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 8
  },
  managePlanText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, fontWeight: '600', color: '#ffffff' },
  selectLabel: { ...Typography.labelCaps, fontSize: 10, color: Colors.outline, marginBottom: Spacing.xs },
  selectBox: {
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 4
  },
  selectValue: { ...Typography.bodyMd, fontSize: 14 },
  dangerZone: {
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
    backgroundColor: 'rgba(255,218,214,0.12)',
    borderRadius: 12,
    padding: Spacing.md
  },
  deactivateBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 4,
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: 8
  },
  deactivateText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, fontWeight: '600', color: Colors.onSurface },
  deleteBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 4,
    backgroundColor: Colors.error,
    borderRadius: 8
  },
  deleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, fontWeight: '600', color: '#ffffff' },
  dangerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, fontWeight: '600', color: Colors.error, textAlign: 'center' },
  dangerBody: { fontSize: 12, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }
});
