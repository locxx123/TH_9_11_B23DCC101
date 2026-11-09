import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Avatar from '../components/Avatar';
import {useAuth} from '../context/AuthContext';
import {subscribeUsers} from '../services/userService';
import {UserProfile} from '../types';
import {formatLastSeen} from '../utils/format';
import {colors} from '../utils/theme';

export default function ContactsScreen({navigation}: any) {
  const {user} = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }
    return subscribeUsers(user.uid, setUsers);
  }, [user]);

  const data = useMemo(() => {
    const k = search.trim().toLowerCase();
    return k
      ? users.filter(u => u.name.toLowerCase().includes(k) || u.email.toLowerCase().includes(k))
      : users;
  }, [users, search]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm theo tên hoặc email..."
        placeholderTextColor={colors.sub}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />
      <FlatList
        data={data}
        keyExtractor={u => u.uid}
        ListEmptyComponent={<Text style={styles.empty}>Không có người dùng nào.</Text>}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Chat', {peerId: item.uid, peerName: item.name})}>
            <Avatar name={item.name} online={item.online} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.status, item.online && {color: colors.online}]}>
                {item.online ? 'Online' : formatLastSeen(item.lastSeen)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  search: {
    margin: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: colors.text,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  info: {marginLeft: 12, flex: 1},
  name: {fontSize: 16, fontWeight: '600', color: colors.text},
  status: {fontSize: 13, color: colors.sub, marginTop: 2},
  empty: {textAlign: 'center', color: colors.sub, marginTop: 40},
});
