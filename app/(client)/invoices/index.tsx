import { View, Text, FlatList } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useAppSelector } from '@/hooks/useAppStore';

const MOCK_DOCS = [
  { id: 'FAC-2026-0031', type: 'invoice' as const, date: '20/04/2026', amount: 342.80, status: 'unpaid' as const },
  { id: 'DEV-2026-0018', type: 'quote' as const, date: '15/04/2026', amount: 1240.00, status: 'accepted' as const },
  { id: 'FAC-2026-0027', type: 'invoice' as const, date: '10/04/2026', amount: 128.50, status: 'paid' as const },
  { id: 'DEV-2026-0015', type: 'quote' as const, date: '05/04/2026', amount: 580.00, status: 'pending' as const },
];

type DocType = 'invoice' | 'quote';
type DocStatus = 'paid' | 'unpaid' | 'accepted' | 'pending';

function StatusBadge({ status }: { status: DocStatus }) {
  const config = {
    paid: { label: 'Payée', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    unpaid: { label: 'À régler', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    accepted: { label: 'Accepté', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    pending: { label: 'En attente', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400' },
  }[status];

  return (
    <View className={`px-2.5 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}

export default function InvoicesScreen() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Devis & Factures</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Documents Sage — {user?.companyName}
        </Text>
      </View>

      <FlatList
        data={MOCK_DOCS}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-y-3"
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-0.5">
                  {item.type === 'invoice' ? 'Facture' : 'Devis'}
                </Text>
                <Text className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
                  {item.id}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-zinc-400 dark:text-zinc-500">{item.date}</Text>
              <Text className="text-base font-bold text-zinc-900 dark:text-white">
                {item.amount.toFixed(2)} €
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <FileText size={40} className="text-zinc-300" strokeWidth={1.5} />
            <Text className="text-zinc-400 mt-3 text-sm">Aucun document</Text>
          </View>
        }
      />
    </View>
  );
}
