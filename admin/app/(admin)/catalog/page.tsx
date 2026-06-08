'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { useAdminToken } from '@/hooks/useAdminToken';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const STOCK_LABELS: Record<string, string> = {
  available: 'Disponible',
  low: 'Stock faible',
  out_of_stock: 'Rupture',
  on_order: 'Sur commande',
};

const STOCK_ICONS: Record<string, React.ReactNode> = {
  available: <CheckCircle size={16} className="text-green-500" />,
  low: <AlertCircle size={16} className="text-orange-400" />,
  out_of_stock: <XCircle size={16} className="text-red-500" />,
  on_order: <Clock size={16} className="text-yellow-500" />,
};

export default function CatalogPage() {
  const { token } = useAdminToken();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<Product[]>('/catalog', token)
      .then(setProducts)
      .catch(() => setError('Impossible de charger le catalogue'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sageRef.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Catalogue Produits</h1>
        <p className="text-zinc-400 mt-1">{products.length} produit(s) au total</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Recherche par nom, référence, catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Référence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Catégorie</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Prix public</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Aucun produit trouvé
                </td>
              </tr>
            )}
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{product.sageRef}</td>
                <td className="px-4 py-3 text-zinc-300">{product.name}</td>
                <td className="px-4 py-3 text-zinc-400">{product.category ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-300 font-medium">
                  {product.publicPrice.toFixed(2)} €
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {STOCK_ICONS[product.stockStatus]}
                    <span className="text-zinc-400 text-xs">
                      {STOCK_LABELS[product.stockStatus]}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {product.isActive ? (
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
