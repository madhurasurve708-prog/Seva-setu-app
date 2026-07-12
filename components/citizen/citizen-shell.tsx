import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PropsWithChildren, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CITIZEN_COLORS as C } from '@/constants/citizen';
import { useCitizen } from '@/providers/citizen-provider';

const items = [
  ['Home', 'home-outline', '/dashboard'], ['Profile', 'account-outline', '/profile'], ['Announcements', 'bullhorn-outline', '/announcements'], ['Settings', 'cog-outline', '/settings'], ['About Seva Setu', 'information-outline', '/about'],
] as const;
export function CitizenShell({ title, children }: PropsWithChildren<{ title: string }>) {
  const router = useRouter(); const { profile, logout } = useCitizen(); const [open, setOpen] = useState(false);
  const navigate = (path: (typeof items)[number][2]) => { setOpen(false); router.replace(path); };
  return <View style={s.root}><SafeAreaView style={s.safe}><View style={s.header}><Pressable onPress={() => setOpen(true)} hitSlop={10}><MaterialCommunityIcons name="menu" size={28} color={C.white} /></Pressable><Text style={s.title}>{title}</Text><Pressable onPress={() => router.push('/profile')}><View style={s.avatar}><Text style={s.avatarText}>{profile?.name?.charAt(0).toUpperCase() || 'C'}</Text></View></Pressable></View>{children}</SafeAreaView>
    <Modal visible={open} transparent animationType="slide"><View style={s.modal}><Pressable style={s.backdrop} onPress={() => setOpen(false)} /><View style={s.drawer}><View style={s.brand}><View style={s.brandAvatar}><Text style={s.avatarText}>{profile?.name?.charAt(0).toUpperCase() || 'C'}</Text></View><View><Text style={s.name}>{profile?.name || 'Citizen'}</Text><Text style={s.ward}>{profile?.ward || 'Seva Setu Citizen'}</Text></View></View><ScrollView>{items.map(([label, icon, path]) => <Pressable key={label} style={s.drawerItem} onPress={() => navigate(path)}><MaterialCommunityIcons name={icon} size={22} color={C.navy}/><Text style={s.drawerText}>{label}</Text></Pressable>)}<Pressable style={s.drawerItem} onPress={async () => { await logout(); setOpen(false); router.replace('/citizen-login'); }}><MaterialCommunityIcons name="logout" size={22} color={C.danger}/><Text style={[s.drawerText, { color: C.danger }]}>Logout</Text></Pressable></ScrollView></View></View></Modal>
  </View>;
}
const s = StyleSheet.create({ root:{flex:1,backgroundColor:C.bg},safe:{flex:1,backgroundColor:C.bg},header:{height:64,backgroundColor:C.navy,flexDirection:'row',alignItems:'center',paddingHorizontal:20,justifyContent:'space-between'},title:{color:C.white,fontSize:18,fontWeight:'800'},avatar:{width:34,height:34,borderRadius:17,backgroundColor:C.saffron,alignItems:'center',justifyContent:'center'},avatarText:{color:C.white,fontWeight:'800'},modal:{flex:1,flexDirection:'row'},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.45)'},drawer:{width:'78%',backgroundColor:C.bg,paddingTop:56},brand:{backgroundColor:C.navy,padding:22,flexDirection:'row',gap:12,alignItems:'center'},brandAvatar:{width:46,height:46,borderRadius:23,backgroundColor:C.saffron,alignItems:'center',justifyContent:'center'},name:{color:C.white,fontSize:16,fontWeight:'800'},ward:{color:'rgba(255,255,255,0.75)',fontSize:12,marginTop:3},drawerItem:{flexDirection:'row',gap:16,alignItems:'center',paddingHorizontal:24,paddingVertical:18,borderBottomWidth:1,borderBottomColor:C.border},drawerText:{fontSize:15,fontWeight:'600',color:C.text} });
