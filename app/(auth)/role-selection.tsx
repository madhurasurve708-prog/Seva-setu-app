import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Image, ImageBackground, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const COLORS = { navy: '#0A2A43', navyDeep: '#071D30', blue: '#1E6FD9', saffron: '#F2994A', bg: '#F5F7FA', card: '#FFFFFF', text: '#101826', muted: '#5B6472', border: '#E7ECF2', white: '#FFFFFF' };

const roles: { title: string; subtitle: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; route: Href; color: string }[] = [
  { title: 'Citizen Login', subtitle: 'Report an issue in your ward', icon: 'account', route: '/citizen-login', color: COLORS.blue },
  { title: 'Nagarsevak Login', subtitle: 'Ward representative access', icon: 'office-building', route: '/nagarsevak-login', color: COLORS.navy },
  { title: 'Department Login', subtitle: 'Track and resolve complaints', icon: 'domain', route: '/department-login', color: COLORS.saffron },
  { title: 'Main Admin Login', subtitle: 'Nagaradhyaksha control panel', icon: 'shield-crown', route: '/admin-login', color: COLORS.navyDeep },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  return <View style={styles.root}>
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    <ImageBackground source={require('../../assets/images/shivaji.png')} style={styles.hero} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.heroContent}>
        <View style={styles.logoRing}><Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" /></View>
        <Text style={styles.title}>SEVA SETU</Text><Text style={styles.tagline}>Report. Send. Solve.</Text>
      </SafeAreaView>
    </ImageBackground>
    <View style={styles.sheet}>
      <View style={styles.handle} /><Text style={styles.heading}>Continue as</Text>
      <Text style={styles.subheading}>Choose your role to sign in to Seva Setu</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {roles.map((role) => <Pressable key={role.title} style={styles.card} onPress={() => router.push(role.route)}>
          <View style={[styles.icon, { backgroundColor: `${role.color}1A` }]}><MaterialCommunityIcons name={role.icon} size={26} color={role.color} /></View>
          <View style={styles.cardText}><Text style={styles.cardTitle}>{role.title}</Text><Text style={styles.cardSubtitle}>{role.subtitle}</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.muted} />
        </Pressable>)}
      </ScrollView>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.navyDeep }, hero: { height: '42%' }, overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,29,48,0.6)' }, heroContent: { flex: 1, alignItems: 'center', justifyContent: 'center' }, logoRing: { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, logo: { width: 46, height: 46 }, title: { color: COLORS.white, fontSize: 26, fontWeight: '800', letterSpacing: 2.5 }, tagline: { marginTop: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' }, sheet: { flex: 1, marginTop: -28, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: COLORS.bg, paddingHorizontal: 24, paddingTop: 14 }, handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, marginBottom: 16 }, heading: { fontSize: 21, fontWeight: '800', color: COLORS.text }, subheading: { marginTop: 4, color: COLORS.muted, fontSize: 13.5 }, list: { paddingTop: 18, paddingBottom: 24 }, card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }, icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, cardText: { flex: 1 }, cardTitle: { fontSize: 15.5, fontWeight: '700', color: COLORS.text }, cardSubtitle: { marginTop: 2, fontSize: 12.5, color: COLORS.muted },
});
