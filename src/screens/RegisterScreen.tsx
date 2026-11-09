import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity} from 'react-native';
import {authErrorMessage, register} from '../services/authService';
import {authStyles, ErrorText, Field} from '../components/AuthForm';

export default function RegisterScreen({navigation}: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      return setError('Vui lòng nhập đầy đủ thông tin.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError('Email không hợp lệ.');
    }
    if (password.length < 6) {
      return setError('Mật khẩu tối thiểu 6 ký tự.');
    }
    if (password !== confirm) {
      return setError('Mật khẩu nhập lại không khớp.');
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password); // tự đăng nhập, điều hướng qua AuthContext
    } catch (e: any) {
      setError(authErrorMessage(e?.code));
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={authStyles.title}>Đăng ký</Text>
      <Field placeholder="Họ tên" autoCapitalize="words" value={name} onChangeText={setName} />
      <Field placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Field placeholder="Mật khẩu (tối thiểu 6 ký tự)" secureTextEntry value={password} onChangeText={setPassword} />
      <Field placeholder="Nhập lại mật khẩu" secureTextEntry value={confirm} onChangeText={setConfirm} />
      <ErrorText message={error} />
      <TouchableOpacity style={authStyles.button} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Đăng ký</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={authStyles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
