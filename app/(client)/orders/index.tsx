import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Trash2, Package, CheckCircle } from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { removeItem, updateQuantity, clearCart } from '@/stores/cart.slice';
import { ordersService } from '@/services/orders.service';
import type { Order, OrderStatus } from '@/types/order.types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending:    { label: 'En attente',  bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-400' },
  confirmed:  { label: 'Confirmée',   bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-400' },
  processing: { label: 'En cours',    bg: 'bg-indigo-100 dark:bg-indigo-900/30',text: 'text-indigo-700 dark:text-indigo-400' },
  shipped:    { label: 'Expédiée',    bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-700 dark:text-cyan-400' },
  delivered:  { label: 'Livrée',      bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400' },
  cancelled:  { label: 'Annulée',     bg: 'bg-zinc-100 dark:bg-zinc-800',       text: 'text-zinc-500 dark:text-zinc-400' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}

function CartSection() {
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const total = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () =>
      ordersService.createOrder({
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: 'deferred',
      }),
    onSuccess: () => {
      dispatch(clearCart());
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => {
      Alert.alert('Erreur', 'Impossible de passer la commande. Réessayez.');
    },
  });

  if (success) {
    return (
      <View className="mx-4 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 items-center">
        <CheckCircle size={32} color="#16a34a" strokeWidth={1.8} />
        <Text className="text-green-700 dark:text-green-400 font-semibold mt-2">Commande envoyée !</Text>
        <Text className="text-green-600 dark:text-green-500 text-xs mt-1 text-center">
          Votre bon de commande a été transmis.
        </Text>
      </View>
    );
  }

  if (cartItems.length === 0) return null;

  return (
    <View className="mx-4 mt-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <View className="px-4 py-3 bg-blue-600 flex-row items-center gap-x-2">
        <ShoppingCart size={16} color="white" strokeWidth={2} />
        <Text className="text-white font-semibold text-sm">
          Mon panier · {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
        </Text>
      </View>

      {cartItems.map((item) => (
        <View
          key={item.productId}
          className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
        >
          <View className="flex-1 mr-3">
            <Text className="text-xs font-mono text-zinc-400">{item.productRef}</Text>
            <Text className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">
              {item.productName}
            </Text>
            <Text className="text-xs text-zinc-400 mt-0.5">
              {item.unitPrice.toFixed(2)} € / unité
            </Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            {/* Qty controls */}
            <Pressable
              onPress={() =>
                item.quantity > 1
                  ? dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))
                  : dispatch(removeItem(item.productId))
              }
              className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 items-center justify-center active:opacity-60"
            >
              <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-base leading-none">−</Text>
            </Pressable>
            <Text className="text-sm font-semibold text-zinc-900 dark:text-white w-5 text-center">
              {item.quantity}
            </Text>
            <Pressable
              onPress={() =>
                dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
              }
              className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 items-center justify-center active:opacity-60"
            >
              <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-base leading-none">+</Text>
            </Pressable>
            <Pressable
              onPress={() => dispatch(removeItem(item.productId))}
              className="ml-1 w-7 h-7 items-center justify-center active:opacity-60"
            >
              <Trash2 size={15} color="#ef4444" strokeWidth={1.8} />
            </Pressable>
          </View>
        </View>
      ))}

      {/* Total + CTA */}
      <View className="px-4 py-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">Total HT estimé</Text>
          <Text className="text-lg font-bold text-zinc-900 dark:text-white">{total.toFixed(2)} €</Text>
        </View>
        <Pressable
          onPress={() => placeOrder()}
          disabled={isPending}
          className="h-11 bg-blue-600 rounded-xl items-center justify-center active:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">Passer la commande</Text>
          )}
        </Pressable>
        <Text className="text-center text-xs text-zinc-400 mt-2">
          Paiement différé — facture Sage
        </Text>
      </View>
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items.length;
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
          {order.orderNumber}
        </Text>
        <StatusBadge status={order.status} />
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-zinc-400 dark:text-zinc-500">
          {date} · {itemCount} article{itemCount > 1 ? 's' : ''}
        </Text>
        <Text className="text-base font-bold text-zinc-900 dark:text-white">
          {Number(order.total).toFixed(2)} €
        </Text>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const { user } = useAppSelector((s) => s.auth);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.getMyOrders(),
  });

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Commandes</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {user?.companyName}
        </Text>
      </View>

      <ScrollView contentContainerClassName="pb-8">
        {/* Panier actif */}
        <CartSection />

        {/* Historique */}
        <View className="mx-4 mt-5">
          <Text className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Historique
          </Text>

          {isLoading && (
            <View className="items-center py-8">
              <ActivityIndicator color="#2563eb" />
            </View>
          )}

          {!isLoading && (orders ?? []).length === 0 && (
            <View className="items-center py-12">
              <Package size={36} color="#d4d4d8" strokeWidth={1.5} />
              <Text className="text-zinc-400 mt-3 text-sm">Aucune commande passée</Text>
            </View>
          )}

          {!isLoading && (orders ?? []).map((order) => (
            <View key={order.id} className="mb-3">
              <OrderCard order={order} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


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
