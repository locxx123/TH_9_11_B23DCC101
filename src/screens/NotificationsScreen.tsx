import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {colors} from '../utils/theme';

const DATA = [
  {id: '1', title: 'Chào mừng bạn', body: 'Cảm ơn bạn đã sử dụng ứng dụng chat.'},
  {id: '2', title: 'Cập nhật', body: 'Phiên bản mới đã sẵn sàng.'},
];

export default function NotificationsScreen() {
  return (
    <FlatList
      style={{backgroundColor: colors.bg}}
      data={DATA}
      keyExtractor={i => i.id}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#fff', margin: 12, marginBottom: 0, padding: 14, borderRadius: 12},
  title: {fontSize: 16, fontWeight: '700', color: colors.text},
  body: {fontSize: 14, color: colors.sub, marginTop: 4},
});
