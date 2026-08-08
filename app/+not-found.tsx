import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

/** A deliberate recovery path for invalid deep links instead of a blank screen. */
export default function NotFoundScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.copy}>This page is unavailable or the link has expired.</Text>
      <Link href="/(auth)/role-selection" style={styles.link}>Return to Seva Setu</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { color: '#102A43', fontSize: 22, fontWeight: '800' },
  copy: { color: '#52606D', marginTop: 8, fontSize: 14, textAlign: 'center' },
  link: { marginTop: 20, color: '#0B4F8A', fontSize: 15, fontWeight: '800' },
});
