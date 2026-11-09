import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Geolocation from '@react-native-community/geolocation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '../context/AuthContext';
import {markAsRead, sendMessage, subscribeMessages} from '../services/chatService';
import {subscribeUser} from '../services/userService';
import {Message, UserProfile} from '../types';
import {formatLastSeen, formatTime} from '../utils/format';
import {colors} from '../utils/theme';

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  }
  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
}

export default function ChatScreen({route, navigation}: any) {
  const {peerId, peerName} = route.params as {peerId: string; peerName: string};
  const {user} = useAuth();
  const me = user!.uid;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [peer, setPeer] = useState<UserProfile | null>(null);
  const [sendingLoc, setSendingLoc] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  // Tin nhắn realtime. Cleanup hủy listener => không bị lặp tin khi mở lại.
  useEffect(() => {
    setMessages([]);
    markAsRead(me, peerId).catch(() => {});
    const unsub = subscribeMessages(me, peerId, m => {
      setMessages(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m]));
      if (m.senderId !== me) {
        markAsRead(me, peerId).catch(() => {}); // đang mở chat thì unread luôn = 0
      }
    });
    return () => {
      unsub();
      markAsRead(me, peerId).catch(() => {});
    };
  }, [me, peerId]);

  // Trạng thái online của người đối diện
  useEffect(() => subscribeUser(peerId, setPeer), [peerId]);

  // Thanh tiêu đề: tên + trạng thái online
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={styles.headerName}>{peer?.name ?? peerName}</Text>
          <Text style={[styles.headerStatus, peer?.online && {color: colors.online}]}>
            {peer?.online ? 'Online' : formatLastSeen(peer?.lastSeen)}
          </Text>
        </View>
      ),
    });
  }, [navigation, peer, peerName]);

  const onSend = useCallback(() => {
    const t = text.trim();
    if (!t) {
      return; // không gửi tin rỗng
    }
    setText('');
    sendMessage(me, peerId, {type: 'text', text: t}).catch(() =>
      Alert.alert('Lỗi', 'Không gửi được tin nhắn.'),
    );
  }, [text, me, peerId]);

  const onSendLocation = useCallback(async () => {
    if (sendingLoc) {
      return;
    }
    const ok = await ensureLocationPermission();
    if (!ok) {
      return Alert.alert('Thiếu quyền', 'Bạn cần cấp quyền vị trí để gửi vị trí.');
    }
    setSendingLoc(true);
    Geolocation.getCurrentPosition(
      pos => {
        sendMessage(me, peerId, {
          type: 'location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
          .catch(() => Alert.alert('Lỗi', 'Không gửi được vị trí.'))
          .finally(() => setSendingLoc(false));
      },
      () => {
        setSendingLoc(false);
        Alert.alert('Lỗi', 'Không lấy được vị trí hiện tại. Hãy bật GPS / đặt vị trí cho máy ảo.');
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  }, [me, peerId, sendingLoc]);

  const renderItem = ({item}: {item: Message}) => {
    const mine = item.senderId === me;
    return (
      <View style={[styles.bubbleWrap, mine ? styles.right : styles.left]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          {item.type === 'location' && item.location ? (
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${item.location!.latitude},${item.location!.longitude}`,
                )
              }>
              <View style={styles.locRow}>
                <Ionicons name="location" size={18} color={mine ? '#fff' : colors.danger} />
                <Text style={[styles.msgText, mine && styles.textMine, styles.locTitle]}> Vị trí</Text>
              </View>
              <Text style={[styles.locCoord, mine && styles.textMine]}>
                {item.location.latitude.toFixed(5)}, {item.location.longitude.toFixed(5)}
              </Text>
              <Text style={[styles.locOpen, mine && styles.textMine]}>Nhấn để mở bản đồ</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.msgText, mine && styles.textMine]}>{item.text}</Text>
          )}
          <Text style={[styles.time, mine && styles.timeMine]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderItem}
        contentContainerStyle={{padding: 12}}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
        onLayout={() => listRef.current?.scrollToEnd({animated: false})}
      />
      <View style={[styles.inputBar, {paddingBottom: Math.max(insets.bottom, 8)}]}>
        <TouchableOpacity style={styles.locBtn} onPress={onSendLocation} disabled={sendingLoc}>
          <Ionicons name="location" size={26} color={colors.primary} style={sendingLoc && styles.dim} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.sub}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && {opacity: 0.4}]}
          onPress={onSend}
          disabled={!text.trim()}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  headerName: {fontSize: 17, fontWeight: '700', color: colors.text},
  headerStatus: {fontSize: 12, color: colors.sub},
  bubbleWrap: {flexDirection: 'row', marginVertical: 3},
  right: {justifyContent: 'flex-end'},
  left: {justifyContent: 'flex-start'},
  bubble: {maxWidth: '78%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8},
  bubbleMine: {backgroundColor: colors.mine, borderBottomRightRadius: 4},
  bubbleTheirs: {backgroundColor: colors.theirs, borderBottomLeftRadius: 4},
  msgText: {fontSize: 16, color: colors.text},
  textMine: {color: '#fff'},
  time: {fontSize: 11, color: colors.sub, marginTop: 3, alignSelf: 'flex-end'},
  timeMine: {color: 'rgba(255,255,255,0.8)'},
  dim: {opacity: 0.4},
  locRow: {flexDirection: 'row', alignItems: 'center'},
  locTitle: {fontWeight: '700'},
  locCoord: {fontSize: 13, color: colors.text, marginTop: 2},
  locOpen: {fontSize: 12, textDecorationLine: 'underline', color: colors.primary, marginTop: 2},
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingTop: 8,
    backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  locBtn: {padding: 8},
  input: {
    flex: 1, maxHeight: 110, backgroundColor: colors.bg, borderRadius: 20,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 16, color: colors.text,
  },
  sendBtn: {marginLeft: 8, backgroundColor: colors.primary, borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
});
