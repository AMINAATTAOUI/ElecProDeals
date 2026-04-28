import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FileText, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/hooks/useAppStore';
import { invoicesService } from '@/services/invoices.service';
import type { Invoice, Quote, InvoiceStatus, QuoteStatus } from '@/types/invoice.types';

type Tab = 'invoices' | 'quotes';

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
    paid: { label: 'Payée', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    unpaid: { label: 'À régler', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    overdue: { label: 'En retard', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  };
  const c = config[status];
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-xs font-semibold ${c.text}`}>{c.label}</Text>
    </View>
  );
}

function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
    pending: { label: 'En attente', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400' },
    accepted: { label: 'Accepté', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    refused: { label: 'Refusé', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    expired: { label: 'Expiré', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-500 dark:text-zinc-500' },
  };
  const c = config[status];
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-xs font-semibold ${c.text}`}>{c.label}</Text>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function InvoiceCard({ item }: { item: Invoice }) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-0.5">
            Facture
          </Text>
          <Text className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
            {item.sageRef}
          </Text>
        </View>
        <InvoiceStatusBadge status={item.status} />
      </View>
      <View className="flex-row justify-between items-center mt-1">
        <View>
          <Text className="text-xs text-zinc-400 dark:text-zinc-500">
            Émise le {formatDate(item.issuedAt)}
          </Text>
          {item.status !== 'paid' && (
            <Text className="text-xs text-zinc-400 dark:text-zinc-500">
              Échéance {formatDate(item.dueDate)}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-zinc-900 dark:text-white">
            {item.amount.toFixed(2)} €
          </Text>
          <Text className="text-xs text-zinc-400 dark:text-zinc-500">
            dont {item.vatAmount.toFixed(2)} € TVA
          </Text>
        </View>
      </View>
    </View>
  );
}

function QuoteCard({ item }: { item: Quote }) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-0.5">
            Devis
          </Text>
          <Text className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
            {item.sageRef}
          </Text>
        </View>
        <QuoteStatusBadge status={item.status} />
      </View>
      <View className="mb-2">
        {item.items.slice(0, 2).map((line, idx) => (
          <Text key={idx} className="text-xs text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
            {line.quantity}× {line.productName}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text className="text-xs text-zinc-400 dark:text-zinc-500">
            +{item.items.length - 2} article(s)
          </Text>
        )}
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-zinc-400 dark:text-zinc-500">
          Valide jusqu'au {formatDate(item.validUntil)}
        </Text>
        <Text className="text-base font-bold text-zinc-900 dark:text-white">
          {item.totalHT.toFixed(2)} € HT
        </Text>
      </View>
    </View>
  );
}

export default function InvoicesScreen() {
  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<Tab>('invoices');

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesService.getInvoices(),
  });

  const quotesQuery = useQuery({
    queryKey: ['quotes'],
    queryFn: () => invoicesService.getQuotes(),
  });

  const currentQuery = activeTab === 'invoices' ? invoicesQuery : quotesQuery;
  const isLoading = currentQuery.isLoading;
  const isError = currentQuery.isError;

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Devis & Factures</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Documents Sage — {user?.companyName}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4">
        {(['invoices', 'quotes'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`mr-6 py-3 border-b-2 ${
              activeTab === tab
                ? 'border-blue-600'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab === 'invoices' ? 'Factures' : 'Devis'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <FileText size={40} color="#a1a1aa" strokeWidth={1.5} />
          <Text className="text-zinc-400 mt-3 text-sm text-center">
            Impossible de charger les documents
          </Text>
          <TouchableOpacity
            onPress={() => currentQuery.refetch()}
            className="mt-4 flex-row items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} color="white" strokeWidth={2} />
            <Text className="text-white text-sm font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'invoices' ? (
        <FlatList
          data={invoicesQuery.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 gap-y-3"
          renderItem={({ item }) => <InvoiceCard item={item} />}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <FileText size={40} color="#a1a1aa" strokeWidth={1.5} />
              <Text className="text-zinc-400 mt-3 text-sm">Aucune facture</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={quotesQuery.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 gap-y-3"
          renderItem={({ item }) => <QuoteCard item={item} />}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <FileText size={40} color="#a1a1aa" strokeWidth={1.5} />
              <Text className="text-zinc-400 mt-3 text-sm">Aucun devis</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

