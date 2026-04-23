import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Users, Package, Bell, LayoutDashboard, LogOut } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/stores/auth.slice';

const ADMIN_SECTIONS = [
  { icon: Users, label: 'Gestion clients', sub: 'Créer, modifier, gérer les droits — Phase 8' },
  { icon: Package, label: 'Catalogue & prix', sub: 'Import Excel, feuilles de prix B2B — Phase 4-5' },
  { icon: LayoutDashboard, label: 'Commandes en cours', sub: 'Suivi et validation — Phase 6' },
  { icon: Bell, label: 'Notifications push', sub: 'Campagnes et alertes clients — Phase 9' },
] as const;

export default function AdminDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  function handleLogout() {
    dispatch(logout());
    router.replace('/(auth)/login' as Href);
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Administration</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Backoffice ElecProDeals — {user?.email}
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-y-3">
        {ADMIN_SECTIONS.map(({ icon: Icon, label, sub }) => (
          <View
            key={label}
            className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800"
          >
            <View className="flex-row items-center gap-x-3 mb-1">
              <Icon size={20} className="text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
              <Text className="text-base font-semibold text-zinc-900 dark:text-white">{label}</Text>
            </View>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400 ml-8">{sub}</Text>
          </View>
        ))}

        <Pressable
          className="flex-row items-center gap-x-3 bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800 active:opacity-70 mt-4"
          onPress={handleLogout}
        >
          <LogOut size={18} className="text-red-500" strokeWidth={1.8} />
          <Text className="text-sm font-medium text-red-500">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
