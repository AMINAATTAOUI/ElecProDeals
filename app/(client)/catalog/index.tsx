import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, ShoppingCart, Plus, Check } from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { addItem } from '@/stores/cart.slice';
import { catalogService } from '@/services/catalog.service';
import type { Product, StockStatus } from '@/types/product.types';
import { useRouter } from 'expo-router';

const STOCK_CONFIG: Record<StockStatus, { label: string; bg: string; text: string }> = {
  available: { label: 'En stock', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  low: { label: 'Stock limité', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  out_of_stock: { label: 'Rupture', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  on_order: { label: 'Sur commande', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400' },
};

function StockBadge({ status }: { status: StockStatus }) {
  const config = STOCK_CONFIG[status];
  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
}

function ProductCard({ item, onAddToCart, added }: { item: Product; onAddToCart: () => void; added: boolean }) {
  const displayPrice = item.pricing?.finalPrice ?? item.publicPrice;
  const discount = item.pricing?.discountPercent;

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-0.5">
            {item.sageRef}
          </Text>
          <Text className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
            {item.name}
          </Text>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {item.category} · {item.unit}
          </Text>
        </View>
        <View className="items-end gap-y-1.5">
          <View className="items-end">
            <Text className="text-base font-bold text-blue-600 dark:text-blue-400">
              {displayPrice.toFixed(2)} €
            </Text>
            {discount !== undefined && discount > 0 && (
              <Text className="text-xs text-zinc-400 line-through">
                {item.publicPrice.toFixed(2)} €
              </Text>
            )}
          </View>
          <StockBadge status={item.stockStatus} />
        </View>
      </View>

      {/* Ajouter au panier */}
      <Pressable
        onPress={onAddToCart}
        disabled={item.stockStatus === 'out_of_stock'}
        className={`mt-3 flex-row items-center justify-center gap-x-1.5 h-9 rounded-lg active:opacity-70 ${
          added
            ? 'bg-green-600'
            : item.stockStatus === 'out_of_stock'
            ? 'bg-zinc-200 dark:bg-zinc-700'
            : 'bg-blue-600'
        }`}
      >
        {added ? (
          <Check size={14} color="white" strokeWidth={2.5} />
        ) : (
          <Plus size={14} color={item.stockStatus === 'out_of_stock' ? '#a1a1aa' : 'white'} strokeWidth={2.5} />
        )}
        <Text
          className={`text-xs font-semibold ${
            added
              ? 'text-white'
              : item.stockStatus === 'out_of_stock'
              ? 'text-zinc-400'
              : 'text-white'
          }`}
        >
          {added ? 'Ajouté !' : item.stockStatus === 'out_of_stock' ? 'Indisponible' : 'Ajouter au panier'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function CatalogScreen() {
  const { user } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: () => catalogService.getProducts(),
  });

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sageRef.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddToCart = (item: Product) => {
    const displayPrice = item.pricing?.finalPrice ?? item.publicPrice;
    dispatch(addItem({
      productId: item.id,
      productName: item.name,
      productRef: item.sageRef,
      unitPrice: displayPrice,
      quantity: 1,
    }));
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Catalogue</Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Bonjour {user?.firstName} — {user?.companyName}
            </Text>
          </View>
          {/* Cart badge */}
          <Pressable
            onPress={() => router.push('/(client)/orders')}
            className="relative p-2 active:opacity-70"
          >
            <ShoppingCart size={24} color="#2563eb" strokeWidth={1.8} />
            {cartCount > 0 && (
              <View className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-blue-600 rounded-full items-center justify-center px-1">
                <Text className="text-white text-[10px] font-bold">{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search */}
        <View className="flex-row items-center mt-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 h-11">
          <Search size={16} color="#a1a1aa" strokeWidth={1.8} />
          <TextInput
            className="flex-1 ml-2 text-sm text-zinc-900 dark:text-white"
            placeholder="Référence, nom, catégorie..."
            placeholderTextColor="#a1a1aa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* States */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-zinc-400 mt-3 text-sm">Chargement du catalogue...</Text>
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-8">
          <Package size={40} color="#d4d4d8" strokeWidth={1.5} />
          <Text className="text-zinc-500 dark:text-zinc-400 mt-3 text-sm text-center">
            Impossible de charger le catalogue.{'\n'}Vérifiez votre connexion.
          </Text>
          <Pressable
            className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 active:bg-blue-700"
            onPress={() => void refetch()}
          >
            <Text className="text-white font-medium text-sm">Réessayer</Text>
          </Pressable>
        </View>
      )}

      {/* Product list */}
      {!isLoading && !isError && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 gap-y-3"
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              added={addedIds.has(item.id)}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Package size={40} color="#d4d4d8" strokeWidth={1.5} />
              <Text className="text-zinc-400 mt-3 text-sm">Aucun produit trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
