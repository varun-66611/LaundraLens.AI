import { usePathname, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Clock3, FileSearch, LayoutDashboard, Network, Settings } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const navItems = [
  { label: 'Command center', route: '/', Icon: LayoutDashboard },
  { label: 'Networks', route: '/networks', Icon: Network },
  { label: 'Suspicions', route: '/evidence', Icon: FileSearch },
  { label: 'Money Flow', route: '/time-machine', Icon: Clock3 },
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return <View style={styles.brandRow}><View style={styles.brandGlyph}><View style={styles.brandLineA} /><View style={styles.brandLineB} /></View>{!compact && <View><Text style={styles.brand}>LaundraLens<Text style={styles.brandAccent}>.ai</Text></Text><Text style={styles.brandMeta}>TRACE INTELLIGENCE</Text></View>}</View>;
}

function useNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  return { pathname, go: (route: typeof navItems[number]['route'] | '/settings') => router.push(route as Href) };
}

export function DesktopSidebar({ compact }: { compact: boolean }) {
  const { pathname, go } = useNavigate();
  return <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
    <Brand compact={compact} />
    <View style={styles.navList}>{navItems.map(({ Icon, label, route }) => {
      const active = pathname === route;
      return <Pressable key={route} accessibilityRole="link" accessibilityLabel={`Open ${label}`} onPress={() => go(route)} style={({ pressed }) => [styles.navItem, active && styles.navActive, pressed && styles.pressed]}><Icon color={active ? '#f3cee7' : '#827780'} size={19} />{!compact && <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>}{active && !compact && <View style={styles.navIndicator} />}</Pressable>;
    })}</View>
    <View style={styles.sidebarFoot}>{!compact && <View style={styles.systemCard}><View style={styles.between}><Text style={styles.systemLabel}>TRACE engine</Text><View style={styles.onlineDot} /></View><Text style={styles.systemValue}>Operational</Text><Text style={styles.mutedSmall}>Evidence model v1.4</Text></View>}<Pressable accessibilityRole="link" accessibilityLabel="Open Settings" onPress={() => go('/settings')} style={({ pressed }) => [styles.navItem, pathname === '/settings' && styles.navActive, pressed && styles.pressed]}><Settings color={pathname === '/settings' ? '#f3cee7' : '#827780'} size={19} />{!compact && <Text style={[styles.navText, pathname === '/settings' && styles.navTextActive]}>Settings</Text>}</Pressable></View>
  </View>;
}

export function MobileNavigation() {
  const { pathname, go } = useNavigate();
  return <View style={styles.mobileWrap}><Brand /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileList}>{navItems.map(({ Icon, label, route }) => { const active = pathname === route; return <Pressable key={route} accessibilityRole="link" accessibilityLabel={`Open ${label}`} onPress={() => go(route)} style={[styles.mobileItem, active && styles.mobileActive]}><Icon color={active ? '#f3cee7' : '#827780'} size={18} /><Text style={[styles.mobileText, active && styles.navTextActive]}>{label}</Text></Pressable>; })}<Pressable accessibilityRole="link" accessibilityLabel="Open Settings" onPress={() => go('/settings')} style={[styles.mobileItem, pathname === '/settings' && styles.mobileActive]}><Settings color={pathname === '/settings' ? '#f3cee7' : '#827780'} size={18} /><Text style={[styles.mobileText, pathname === '/settings' && styles.navTextActive]}>Settings</Text></Pressable></ScrollView></View>;
}

const styles = StyleSheet.create({
  sidebar: { width: 238, margin: 14, marginRight: 0, borderRadius: 26, backgroundColor: '#0e0b0f', borderWidth: 1, borderColor: '#211a20', padding: 18, justifyContent: 'space-between' }, sidebarCompact: { width: 78, paddingHorizontal: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 }, brandGlyph: { width: 27, height: 27, position: 'relative' }, brandLineA: { position: 'absolute', width: 5, height: 23, backgroundColor: '#efd4e6', borderRadius: 3, transform: [{ rotate: '-28deg' }], left: 6 }, brandLineB: { position: 'absolute', width: 5, height: 23, backgroundColor: '#b479a4', borderRadius: 3, transform: [{ rotate: '28deg' }], right: 6 }, brand: { color: '#f6eff4', fontSize: 17, fontWeight: '700' }, brandAccent: { color: '#d49ec4' }, brandMeta: { color: '#665c64', fontSize: 8, marginTop: 3, letterSpacing: 1.4 },
  navList: { gap: 7, marginTop: -100 }, navItem: { height: 46, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, position: 'relative' }, navActive: { backgroundColor: '#281d27', borderWidth: 1, borderColor: '#3d2a39' }, pressed: { opacity: 0.72 }, navText: { color: '#827780', fontSize: 13, fontWeight: '500' }, navTextActive: { color: '#f0dae9' }, navIndicator: { position: 'absolute', width: 3, height: 20, backgroundColor: '#dfa8cd', borderRadius: 3, right: 7 }, sidebarFoot: { gap: 10 }, systemCard: { backgroundColor: '#151116', borderRadius: 14, borderWidth: 1, borderColor: '#292129', padding: 13, gap: 5 }, systemLabel: { color: '#948892', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }, systemValue: { color: '#f0e7ed', fontSize: 13, fontWeight: '600' }, mutedSmall: { color: '#736a71', fontSize: 10.5, lineHeight: 15 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#83b99a' },
  mobileWrap: { gap: 14, paddingBottom: 4 }, mobileList: { gap: 7, paddingRight: 16 }, mobileItem: { minWidth: 48, height: 42, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', gap: 7, alignItems: 'center', borderWidth: 1, borderColor: '#292129', backgroundColor: '#111012' }, mobileActive: { backgroundColor: '#281d27', borderColor: '#5a3c52' }, mobileText: { color: '#81767f', fontSize: 10, fontWeight: '600' },
});
