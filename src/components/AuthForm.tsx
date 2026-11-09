import React from 'react';
import {StyleSheet, Text, TextInput, TextInputProps} from 'react-native';
import {colors} from '../utils/theme';

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.sub}
      autoCapitalize="none"
      style={styles.input}
      {...props}
    />
  );
}

export function ErrorText({message}: {message: string}) {
  return message ? <Text style={styles.error}>{message}</Text> : null;
}

export const authStyles = StyleSheet.create({
  container: {flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg},
  title: {fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 24, textAlign: 'center'},
  button: {backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  link: {color: colors.primary, textAlign: 'center', marginTop: 18, fontSize: 15},
});

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  error: {color: colors.danger, marginBottom: 10, fontSize: 14},
});
