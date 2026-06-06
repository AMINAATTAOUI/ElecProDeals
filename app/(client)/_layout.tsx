import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { View, Text } from 'react-native';
import { Package, ShoppingCart, FileText, User, Bell } from 'lucide-react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAppSelector } from '@/hooks/useAppStore';

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  return (
    <View>
      <ShoppingCart size={size} color={color} strokeWidth={1.8} />
      {cartCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -6,
            minWidth: 16,
            height: 16,
            backgroundColor: '#2563eb',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ClientLayout() {
  useAuthGuard('client');
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';
  const activeColor = '#2563eb';
  const inactiveColor = isDark ? '#71717a' : '#a1a1aa';
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
        name="catalog/index"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="invoices/index"
        options={{
          title: 'Factures',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="account/index"
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
