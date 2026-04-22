import { View, Text, FlatList } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useAppSelector } from '@/hooks/useAppStore';

const MOCK_ORDERS = [
  { id: 'CMD-2026-0042', date: '21/04/2026', total: 342.80, status: 'shipped' as const, items: 5 },
  { id: 'CMD-2026-0039', date: '18/04/2026', total: 128.50, status: 'delivered' as const, items: 2 },
  { id: 'CMD-2026-0035', date: '14/04/2026', total: 890.00, status: 'pending' as const, items: 12 },
];

type OrderStatus = 'pending' | 'shipped' | 'delivered';

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    pending: { label: 'En cours', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    shipped: { label: 'Expédiée', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    delivered: { label: 'Livrée', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  }[status];

  return (
    <View className={`px-2.5 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}

export default function OrdersScreen() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Commandes</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Historique — {user?.companyName}
        </Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-y-3"
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
                {item.id}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-zinc-400 dark:text-zinc-500">
                {item.date} · {item.items} article{item.items > 1 ? 's' : ''}
              </Text>
              <Text className="text-base font-bold text-zinc-900 dark:text-white">
                {item.total.toFixed(2)} €
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <ShoppingCart size={40} className="text-zinc-300" strokeWidth={1.5} />
            <Text className="text-zinc-400 mt-3 text-sm">Aucune commande</Text>
          </View>
        }
      />
    </View>
  );
}
