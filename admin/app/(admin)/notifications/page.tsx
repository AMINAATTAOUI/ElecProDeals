'use client';

import { useState, useEffect } from 'react';
import { Bell, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { Notification } from '@/lib/types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetClientId, setTargetClientId] = useState('');

  const token =
    typeof window !== 'undefined' ? (localStorage.getItem('admin_token') ?? '') : '';

  useEffect(() => {
    apiFetch<Notification[]>('/notifications', token)
      .then(setNotifications)
      .catch(() => setError('Impossible de charger les notifications'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      const notif = await apiFetch<Notification>('/notifications', token, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          targetClientId: targetClientId.trim() || null,
        }),
      });
      setNotifications((prev) => [notif, ...prev]);
      setTitle('');
      setBody('');
      setTargetClientId('');
      setSuccess('Notification envoyée avec succès');
    } catch {
      setError("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications Push</h1>
        <p className="text-sm text-zinc-400 mt-1">Envoi de notifications aux clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire envoi */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Send size={16} strokeWidth={2} />
            Envoyer une notification
          </h2>
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nouvelle promotion disponible"
                maxLength={255}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Message *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Contenu de la notification..."
                rows={3}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Client ciblé{' '}
                <span className="text-zinc-500 font-normal">(laisser vide = tous les clients)</span>
              </label>
              <input
                type="text"
                value={targetClientId}
                onChange={(e) => setTargetClientId(e.target.value)}
                placeholder="UUID du client (optionnel)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}
            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Send size={14} strokeWidth={2} />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>

        {/* Historique */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={16} strokeWidth={2} />
            Historique ({notifications.length})
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              Aucune notification envoyée
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-zinc-800/60 rounded-lg px-4 py-3 border border-zinc-700/50"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        n.status === 'sent'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {n.status === 'sent' ? 'Envoyé' : 'Échec'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">{n.body}</p>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>{n.targetClientId ? `→ Client ${n.targetClientId.slice(0, 8)}…` : '→ Tous les clients'}</span>
                    <span>{formatDate(n.sentAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

