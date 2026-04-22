import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/hooks/useAppStore';
import { setCredentials } from '@/stores/auth.slice';
import type { AuthUser, UserRole } from '@/types/user.types';

// ─── Mock Auth ─────────────────────────────────────────────────────────────────
// POC: simule une connexion. Remplacé par auth.service.ts en Phase 3.
function mockAuthenticate(email: string): { user: AuthUser; accessToken: string } | null {
  if (!email.trim()) return null;

  let role: UserRole = 'client';
  if (email.includes('admin')) role = 'admin';
  else if (email.includes('commercial')) role = 'commercial';

  const user: AuthUser = {
    id: `mock-${role}-001`,
    email: email.toLowerCase().trim(),
    role,
    firstName: role === 'admin' ? 'Admin' : role === 'commercial' ? 'Marie' : 'Jean',
    lastName: role === 'admin' ? 'Système' : role === 'commercial' ? 'Dupont' : 'Martin',
    companyName: role === 'client' ? 'Martin Électricité SARL' : 'ElecProDeals',
    siret: '12345678901234',
  };

  return { user, accessToken: 'mock-access-token-dev' };
}
// ───────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const result = mockAuthenticate(email);
      if (!result) {
        setError('Identifiants incorrects.');
        setLoading(false);
        return;
      }

      dispatch(setCredentials(result));

      // Expo Router will pick up the Redux state change via app/index.tsx
      switch (result.user.role) {
        case 'admin':
          router.replace('/(admin)' as Href);
          break;
        case 'commercial':
          router.replace('/(commercial)' as Href);
          break;
        default:
          router.replace('/(client)/catalog' as Href);
      }

      setLoading(false);
    }, 800);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-zinc-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center mb-4">
            <Zap className="text-white" size={32} strokeWidth={2.5} />
          </View>
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            ElecProDeals
          </Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Espace professionnel B2B
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-4">
          <View>
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email professionnel
            </Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Mail size={18} className="text-zinc-400" strokeWidth={1.8} />
              </View>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="vous@entreprise.fr"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="pl-10"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Mot de passe
            </Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={18} className="text-zinc-400" strokeWidth={1.8} />
              </View>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                className="pl-10 pr-10"
              />
              <Pressable
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
              >
                {showPassword
                  ? <EyeOff size={18} className="text-zinc-400" strokeWidth={1.8} />
                  : <Eye size={18} className="text-zinc-400" strokeWidth={1.8} />
                }
              </Pressable>
            </View>
          </View>

          {error && (
            <Text className="text-sm text-red-500 text-center">{error}</Text>
          )}

          <Pressable
            className="mt-2 h-12 rounded-xl bg-blue-600 active:bg-blue-700 items-center justify-center"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Se connecter</Text>
            }
          </Pressable>
        </View>

        {/* Demo hint */}
        <View className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
          <Text className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
            Mode démo — accès de test
          </Text>
          <Text className="text-xs text-blue-600 dark:text-blue-500">
            client@demo.fr → espace client{'\n'}
            commercial@demo.fr → espace commercial{'\n'}
            admin@demo.fr → espace admin
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

