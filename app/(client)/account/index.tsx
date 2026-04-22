import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { LogOut, User, Building2, Shield } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/stores/auth.slice';

const CUSTOMER_TYPE_LABELS = {
  artisan: 'Artisan / Installateur',
  large_installer: 'Gros installateur',
  wholesaler: 'Grossiste',
} as const;

export default function AccountScreen() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  function handleLogout() {
    dispatch(logout());
    router.replace('/(auth)/login' as Href);
  }

  if (!user) return null;

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Mon compte</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Profil et paramètres
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-y-4">
        {/* Profile card */}
        <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
          <View className="flex-row items-center gap-x-3 mb-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center">
              <User size={22} className="text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
            </View>
            <View>
              <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                {user.firstName} {user.lastName}
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</Text>
            </View>
          </View>

          <View className="gap-y-2">
            <View className="flex-row items-center gap-x-2">
              <Building2 size={15} className="text-zinc-400" strokeWidth={1.8} />
              <Text className="text-sm text-zinc-700 dark:text-zinc-300">{user.companyName}</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <Shield size={15} className="text-zinc-400" strokeWidth={1.8} />
              <Text className="text-sm text-zinc-700 dark:text-zinc-300">SIRET : {user.siret}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          className="flex-row items-center gap-x-3 bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800 active:opacity-70"
          onPress={handleLogout}
        >
          <LogOut size={18} className="text-red-500" strokeWidth={1.8} />
          <Text className="text-sm font-medium text-red-500">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
