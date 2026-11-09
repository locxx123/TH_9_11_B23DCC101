import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useAuth} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import {colors} from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon =
  (active: IconName, inactive: IconName) =>
  ({color, focused, size}: {color: string; focused: boolean; size: number}) =>
    <Ionicons name={focused ? active : inactive} size={size} color={color} />;

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{tabBarActiveTintColor: colors.primary}}>
      <Tab.Screen name="Home" component={HomeScreen} options={{title: 'Tin nhắn', tabBarIcon: icon('chatbubbles', 'chatbubbles-outline')}} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{title: 'Danh bạ', tabBarIcon: icon('people', 'people-outline')}} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{title: 'Thông báo', tabBarIcon: icon('notifications', 'notifications-outline')}} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{title: 'Cài đặt', tabBarIcon: icon('settings', 'settings-outline')}} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const {user, initializing} = useAuth();

  if (initializing) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{title: ''}} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'Đăng ký'}} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
