'use client';

import { useState, useEffect } from 'react';
import { User, UserRole, PriceSheet } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { useAdminToken } from '@/hooks/useAdminToken';
import { CheckCircle, XCircle, Tag } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  commercial: 'Commercial',
  admin: 'Administrateur',
};

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  artisan: 'Artisan / Installateur',
  large_installer: 'Gros installateur',
  wholesaler: 'Grossiste',
};

interface AssignModalProps {
  user: User;
  sheets: PriceSheet[];
  token: string;
  onClose: () => void;
  onSaved: (updated: User) => void;
}

function AssignModal({ user, sheets, token, onClose, onSaved }: AssignModalProps) {
  const [selected, setSelected] = useState<string>(user.pricingSheetId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<User>(`/users/${user.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ pricingSheetId: selected === '' ? null : selected }),
      });
      onSaved(updated);
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Assigner une feuille de prix</h2>
        <p className="text-sm text-zinc-400 mb-5">
          {user.firstName} {user.lastName} — {user.companyName ?? user.email}
        </p>

        <label className="block text-xs font-medium text-zinc-400 mb-1">Feuille de prix</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
        >
          <option value="">— Aucune (prix public) —</option>
          {sheets.filter((s) => s.isActive).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.appliesTo ? ` (${CUSTOMER_TYPE_LABELS[s.appliesTo] ?? s.appliesTo})` : ' (individuelle)'}
            </option>
          ))}
        </select>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { token } = useAdminToken();
  const [users, setUsers] = useState<User[]>([]);
  const [sheets, setSheets] = useState<PriceSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRole | 'all'>('all');
  const [assigningUser, setAssigningUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<User[]>('/users', token),
      apiFetch<PriceSheet[]>('/pricing/sheets', token),
    ])
      .then(([u, s]) => { setUsers(u); setSheets(s); })
      .catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false));
  }, [token]);

  function getSheetName(pricingSheetId: string | null): string {
    if (!pricingSheetId) return '—';
    const sheet = sheets.find((s) => s.id === pricingSheetId);
    return sheet ? sheet.name : '—';
  }

  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-zinc-400">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/30 p-6 text-red-400">{error}</div>
    );
  }

  return (
    <div>
      {assigningUser && (
        <AssignModal
          user={assigningUser}
          sheets={sheets}
          token={token}
          onClose={() => setAssigningUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setAssigningUser(null);
          }}
        />
      )}

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
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Feuille de prix</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
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
                  {user.role === 'client' ? (
                    <button
                      onClick={() => setAssigningUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-blue-600 hover:text-blue-400 transition-colors"
                    >
                      <Tag size={11} />
                      {getSheetName(user.pricingSheetId)}
                    </button>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
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
