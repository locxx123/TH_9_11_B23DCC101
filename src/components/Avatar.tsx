import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../utils/theme';

const PALETTE = ['#FF9500', '#5856D6', '#34C759', '#FF2D55', '#00B5D8', '#AF52DE'];

export default function Avatar({
  name,
  size = 48,
  online,
}: {
  name: string;
  size?: number;
  online?: boolean;
}) {
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const bg = PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
  return (
    <View style={{width: size, height: size}}>
      <View
        style={[
          styles.circle,
          {width: size, height: size, borderRadius: size / 2, backgroundColor: bg},
        ]}>
        <Text style={[styles.text, {fontSize: size * 0.42}]}>{initial}</Text>
      </View>
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: online ? colors.online : '#C7C7CC',
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {alignItems: 'center', justifyContent: 'center'},
  text: {color: '#fff', fontWeight: '700'},
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
