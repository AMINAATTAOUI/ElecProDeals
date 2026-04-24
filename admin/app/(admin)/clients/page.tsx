'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  commercial: 'Commercial',
  admin: 'Administrateur',
};

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  standard: 'Artisan / Installateur',
  large_installer: 'Gros installateur',
  wholesaler: 'Grossiste',
};

export default function ClientsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRole | 'all'>('all');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';

  useEffect(() => {
    apiFetch<User[]>('/users', token)
      .then(setUsers)
      .catch(() => setError('Impossible de charger les clients'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter);

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
        <h1 className="text-2xl font-bold text-zinc-100">Clients & Utilisateurs</h1>
        <p className="text-zinc-400 mt-1">{users.length} utilisateur(s) au total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'client', 'commercial', 'admin'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {f === 'all' ? 'Tous' : ROLE_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Type client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Entreprise</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Aucun utilisateur
                </td>
              </tr>
            )}
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 text-zinc-300">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-300">
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {user.customerType ? CUSTOMER_TYPE_LABELS[user.customerType] ?? user.customerType : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-300">{user.companyName ?? '—'}</td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
