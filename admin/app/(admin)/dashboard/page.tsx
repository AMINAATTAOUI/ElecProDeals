'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Users, Package, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminToken } from '@/hooks/useAdminToken';

interface DashboardStats {
  ordersToday: number;
  revenueThisMonth: number;
  activeClients: number;
  pendingOrders: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <span className="text-zinc-500">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-100 mb-1">{value}</div>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAdminToken();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<DashboardStats>('/admin/stats', token).then(setStats).catch(() => {
      // Stats non critiques — on laisse afficher "—" en cas d'erreur
    });
  }, [token]);

  const fmt = (n: number | undefined, decimals = 0) =>
    n === undefined ? '—' : n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Commandes aujourd'hui"
          value={fmt(stats?.ordersToday)}
          icon={<ShoppingCart size={20} />}
          description="Données temps réel"
        />
        <StatCard
          title="CA du mois"
          value={stats ? `${fmt(stats.revenueThisMonth, 2)} €` : '—'}
          icon={<Package size={20} />}
          description="Chiffre d'affaires"
        />
        <StatCard
          title="Clients actifs"
          value={fmt(stats?.activeClients)}
          icon={<Users size={20} />}
          description="Comptes activés"
        />
        <StatCard
          title="Commandes en attente"
          value={fmt(stats?.pendingOrders)}
          icon={<Clock size={20} />}
          description="Statut pending/confirmed"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart size={16} />
            Gérer les commandes
          </Link>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 transition-colors"
          >
            <Users size={16} />
            Gérer les clients
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 transition-colors"
          >
            <Package size={16} />
            Gérer le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
