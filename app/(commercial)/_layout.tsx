import { Stack } from 'expo-router';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function CommercialLayout() {
  useAuthGuard('commercial');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
