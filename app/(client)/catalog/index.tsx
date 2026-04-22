import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { Package, Search } from 'lucide-react-native';
import { useAppSelector } from '@/hooks/useAppStore';

// Mock products — remplacés par catalog.service.ts en Phase 4
const MOCK_PRODUCTS = [
  { id: '1', ref: 'SIE-5SL6-20', name: 'Disjoncteur 20A Siemens', category: 'Protection', price: 24.50, stock: 'available' as const },
  { id: '2', ref: 'LEG-04704', name: 'Tableau électrique 13 modules', category: 'Tableau', price: 38.90, stock: 'available' as const },
  { id: '3', ref: 'SCH-A9F74220', name: 'Disjoncteur iC60N 20A Schneider', category: 'Protection', price: 21.80, stock: 'low' as const },
  { id: '4', ref: 'HAG-B16-030', name: 'Prise de courant 2P+T Hager', category: 'Appareillage', price: 4.20, stock: 'available' as const },
  { id: '5', ref: 'SIE-5SL6-32', name: 'Disjoncteur 32A Siemens', category: 'Protection', price: 28.70, stock: 'unavailable' as const },
  { id: '6', ref: 'LEG-07802', name: 'Interrupteur différentiel 40A 30mA', category: 'Protection', price: 67.30, stock: 'available' as const },
] as const;

type StockStatus = 'available' | 'low' | 'unavailable';

function StockBadge({ status }: { status: StockStatus }) {
  const config = {
    available: { label: 'En stock', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    low: { label: 'Stock limité', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    unavailable: { label: 'Rupture', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  }[status];

  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
}

export default function CatalogScreen() {
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Catalogue</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Bonjour {user?.firstName} — {user?.companyName}
        </Text>

        {/* Search */}
        <View className="flex-row items-center mt-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 h-11">
          <Search size={16} className="text-zinc-400" strokeWidth={1.8} />
          <TextInput
            className="flex-1 ml-2 text-sm text-zinc-900 dark:text-white"
            placeholder="Référence, nom, catégorie..."
            placeholderTextColor="#a1a1aa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Product list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-y-3"
        renderItem={({ item }) => (
          <Pressable className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 active:opacity-80">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-0.5">
                  {item.ref}
                </Text>
                <Text className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
                  {item.name}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {item.category}
                </Text>
              </View>
              <View className="items-end gap-y-1.5">
                <Text className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {item.price.toFixed(2)} €
                </Text>
                <StockBadge status={item.stock} />
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Package size={40} className="text-zinc-300" strokeWidth={1.5} />
            <Text className="text-zinc-400 mt-3 text-sm">Aucun produit trouvé</Text>
          </View>
        }
      />
    </View>
  );
}
