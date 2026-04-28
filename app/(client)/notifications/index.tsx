import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Bell, RefreshCw } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import type { AppNotification } from '@/services/notifications.service';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationCard({ item }: { item: AppNotification }) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
      <View className="flex-row items-start gap-3">
        <View className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center flex-shrink-0 mt-0.5">
          <Bell size={16} color="#2563eb" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
            {item.title}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-5">
            {item.body}
          </Text>
          <Text className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            {formatDate(item.sentAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
  });

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Notifications</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Vos alertes et informations
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Bell size={40} color="#a1a1aa" strokeWidth={1.5} />
          <Text className="text-zinc-400 mt-3 text-sm text-center">
            Impossible de charger les notifications
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 flex-row items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} color="white" strokeWidth={2} />
            <Text className="text-white text-sm font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 gap-y-3"
          renderItem={({ item }) => <NotificationCard item={item} />}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Bell size={48} color="#a1a1aa" strokeWidth={1.2} />
              <Text className="text-zinc-400 mt-4 text-base font-medium">
                Aucune notification
              </Text>
              <Text className="text-zinc-400 mt-1 text-sm text-center px-8">
                Vous serez notifié des promotions et mises à jour de vos commandes
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
