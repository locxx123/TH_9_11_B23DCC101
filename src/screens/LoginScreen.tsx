import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity} from 'react-native';
import {authErrorMessage, login} from '../services/authService';
import {authStyles, ErrorText, Field} from '../components/AuthForm';

export default function LoginScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password); // điều hướng tự động qua AuthContext
    } catch (e: any) {
      setError(authErrorMessage(e?.code));
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={authStyles.title}>Đăng nhập</Text>
      <Field placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Field placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorText message={error} />
      <TouchableOpacity style={authStyles.button} onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Đăng nhập</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={authStyles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
