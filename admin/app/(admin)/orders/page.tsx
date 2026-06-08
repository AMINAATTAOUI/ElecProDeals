'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { apiFetch } from '@/lib/api';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

const CANCELLABLE: OrderStatus[] = ['pending', 'confirmed'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';

  useEffect(() => {
    apiFetch<Order[]>('/orders', token)
      .then(setOrders)
      .catch(() => setError('Impossible de charger les commandes'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/orders/${orderId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancel(orderId: string) {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/orders/${orderId}/cancel`, token, { method: 'PATCH' });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      );
    } catch {
      alert('Erreur lors de l\'annulation');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/30 p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Commandes</h1>
        <p className="text-zinc-400 mt-1">{orders.length} commande(s) au total</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">N° Commande</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Aucune commande
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-mono text-zinc-300">{order.orderNumber}</td>
                <td className="px-4 py-3 text-zinc-300">{order.clientId}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {order.total.toFixed(2)} €
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {NEXT_STATUSES[order.status] && (
                      <button
                        onClick={() => handleStatusChange(order.id, NEXT_STATUSES[order.status]!)}
                        disabled={updatingId === order.id}
                        className="rounded-md bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 transition-colors"
                      >
                        → {STATUS_LABELS[NEXT_STATUSES[order.status]!]}
                      </button>
                    )}
                    {CANCELLABLE.includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={updatingId === order.id}
                        className="rounded-md bg-red-900/40 px-2 py-1 text-xs text-red-400 hover:bg-red-900/70 disabled:opacity-50 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
