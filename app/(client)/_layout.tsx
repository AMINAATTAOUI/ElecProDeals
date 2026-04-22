import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Package, ShoppingCart, FileText, User } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function ClientLayout() {
  useAuthGuard('client');
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';
  const activeColor = '#2563eb'; // blue-600
  const inactiveColor = isDark ? '#71717a' : '#a1a1aa'; // zinc-500/400
  const bgColor = isDark ? '#09090b' : '#ffffff';
  const borderColor = isDark ? '#27272a' : '#e4e4e7';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Factures',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
