import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Avatar from '../components/Avatar';
import {useAuth} from '../context/AuthContext';
import {logout} from '../services/authService';
import {colors} from '../utils/theme';

export default function SettingsScreen() {
  const {user} = useAuth();
  const onLogout = async () => {
    try {
      await logout(); // user = null → RootNavigator tự quay về màn Đăng nhập
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng xuất, thử lại sau.');
    }
  };
  const name = user?.displayName ?? 'Người dùng';
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Avatar name={name} size={72} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <TouchableOpacity style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg, padding: 16},
  card: {backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center'},
  name: {fontSize: 20, fontWeight: '700', marginTop: 12, color: colors.text},
  email: {fontSize: 14, color: colors.sub, marginTop: 4},
  logout: {marginTop: 24, backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center'},
  logoutText: {color: '#fff', fontWeight: '700', fontSize: 16},
});
