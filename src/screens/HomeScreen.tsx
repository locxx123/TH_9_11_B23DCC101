import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Avatar from '../components/Avatar';
import {useAuth} from '../context/AuthContext';
import {subscribeConversations} from '../services/chatService';
import {subscribeUsers} from '../services/userService';
import {Conversation, UserProfile} from '../types';
import {formatListTime} from '../utils/format';
import {colors} from '../utils/theme';

export default function HomeScreen({navigation}: any) {
  const {user} = useAuth();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const u1 = subscribeConversations(user.uid, setConvs);
    const u2 = subscribeUsers(user.uid, setUsers);
    return () => {
      u1();
      u2();
    };
  }, [user]);

  const userMap = useMemo(() => {
    const m: Record<string, UserProfile> = {};
    users.forEach(u => (m[u.uid] = u));
    return m;
  }, [users]);

  return (
    <View style={styles.container}>
      <FlatList
        data={convs}
        keyExtractor={c => c.peerId}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có cuộc trò chuyện nào.{'\n'}Vào Danh bạ để bắt đầu chat.</Text>
        }
        renderItem={({item}) => {
          const peer = userMap[item.peerId];
          const name = peer?.name ?? 'Người dùng';
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Chat', {peerId: item.peerId, peerName: name})}>
              <Avatar name={name} online={peer?.online} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text
                  style={[styles.msg, item.unread > 0 && styles.msgUnread]}
                  numberOfLines={1}>
                  {item.lastSenderId === user?.uid ? 'Bạn: ' : ''}
                  {item.lastMessage}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.time}>{formatListTime(item.lastTime)}</Text>
                {item.unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread > 99 ? '99+' : item.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  info: {flex: 1, marginLeft: 12},
  name: {fontSize: 16, fontWeight: '600', color: colors.text},
  msg: {fontSize: 14, color: colors.sub, marginTop: 3},
  msgUnread: {color: colors.text, fontWeight: '700'},
  right: {alignItems: 'flex-end', marginLeft: 8},
  time: {fontSize: 12, color: colors.sub},
  badge: {
    marginTop: 6, minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  empty: {textAlign: 'center', color: colors.sub, marginTop: 60, lineHeight: 22},
});
