'use client';

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Notifications Push</h1>
        <p className="text-zinc-400 mt-1">Envoi de notifications aux clients</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 flex flex-col items-center justify-center text-center">
        <Bell size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-300 mb-2">Module à venir</h2>
        <p className="text-zinc-500 max-w-sm">
          Le module de gestion des notifications push (FCM/APNs) sera disponible dans la prochaine phase de développement.
        </p>
      </div>
    </div>
  );
}
