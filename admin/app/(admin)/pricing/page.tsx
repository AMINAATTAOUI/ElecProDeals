'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useAdminToken } from '@/hooks/useAdminToken';
import type { PriceSheet, PricingRule, PricingRuleOperator, CustomerType } from '@/lib/types';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  artisan: 'Artisans / Installateurs',
  large_installer: 'Gros Installateurs',
  wholesaler: 'Grossistes',
};

const OPERATOR_LABELS: Record<PricingRuleOperator, string> = {
  multiply: '× Coefficient',
  add: '+ Montant fixe',
  subtract: '− Montant fixe',
  fixed: '= Prix fixe',
};

function formatRuleDisplay(rule: PricingRule): string {
  if (rule.operator === 'multiply') {
    const pct = Math.round((1 - rule.value) * 100);
    return pct > 0
      ? `Remise ${pct}% (× ${rule.value})`
      : `Majoration ${Math.abs(pct)}% (× ${rule.value})`;
  }
  if (rule.operator === 'add') return `+ ${rule.value} €`;
  if (rule.operator === 'subtract') return `− ${rule.value} €`;
  if (rule.operator === 'fixed') return `Prix fixe ${rule.value} €`;
  return `${rule.operator} ${rule.value}`;
}

interface RuleForm {
  operator: PricingRuleOperator;
  value: string;
  description: string;
}

interface SheetForm {
  name: string;
  appliesTo: CustomerType | '';
  isActive: boolean;
  rules: RuleForm[];
}

const emptyForm = (): SheetForm => ({
  name: '',
  appliesTo: '',
  isActive: true,
  rules: [{ operator: 'multiply', value: '1', description: '' }],
});

export default function PricingPage() {
  const { token } = useAdminToken();
  const [sheets, setSheets] = useState<PriceSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ open: boolean; editing: PriceSheet | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = useState<SheetForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadSheets = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<PriceSheet[]>('/pricing/sheets', token);
      setSheets(data);
    } catch {
      setError('Impossible de charger les feuilles de prix');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadSheets manages its own loading state
    void loadSheets();
  }, [loadSheets]);

  function openCreate() {
    setForm(emptyForm());
    setModal({ open: true, editing: null });
  }

  function openEdit(sheet: PriceSheet) {
    setForm({
      name: sheet.name,
      appliesTo: sheet.appliesTo ?? '',
      isActive: sheet.isActive,
      rules: sheet.rules
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((r) => ({
          operator: r.operator,
          value: String(r.value),
          description: r.description ?? '',
        })),
    });
    setModal({ open: true, editing: sheet });
  }

  function closeModal() {
    setModal({ open: false, editing: null });
    setForm(emptyForm());
  }

  function addRule() {
    setForm((f) => ({
      ...f,
      rules: [...f.rules, { operator: 'multiply', value: '1', description: '' }],
    }));
  }

  function removeRule(i: number) {
    setForm((f) => ({ ...f, rules: f.rules.filter((_, idx) => idx !== i) }));
  }

  function updateRule(i: number, patch: Partial<RuleForm>) {
    setForm((f) => ({
      ...f,
      rules: f.rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        appliesTo: form.appliesTo || null,
        isActive: form.isActive,
        rules: form.rules.map((r, i) => ({
          operator: r.operator,
          value: Number(r.value),
          description: r.description || null,
          sortOrder: i,
        })),
      };

      if (modal.editing) {
        await apiFetch<PriceSheet>(`/pricing/sheets/${modal.editing.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<PriceSheet>('/pricing/sheets', token, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadSheets();
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch<void>(`/pricing/sheets/${id}`, token, { method: 'DELETE' });
      setDeleteConfirm(null);
      await loadSheets();
    } catch {
      setError('Erreur lors de la suppression');
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Feuilles de prix</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gestion des politiques tarifaires B2B par typologie client
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nouvelle feuille
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-zinc-400 text-sm">Chargement...</div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          Aucune feuille de prix. Créez-en une pour commencer.
        </div>
      ) : (
        <div className="space-y-2">
          {sheets.map((sheet) => {
            const isOpen = expanded.has(sheet.id);
            return (
              <div key={sheet.id} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-4 px-4 py-3">
                  <button
                    onClick={() => toggleExpanded(sheet.id)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium text-sm">{sheet.name}</span>
                      {sheet.isActive ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded-full">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-xs mt-0.5">
                      {sheet.appliesTo
                        ? CUSTOMER_TYPE_LABELS[sheet.appliesTo]
                        : 'Feuille individuelle (aucune typologie)'}
                      {' · '}{sheet.rules.length} règle{sheet.rules.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(sheet)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    {deleteConfirm === sheet.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => void handleDelete(sheet.id)}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs text-zinc-400 hover:text-white rounded transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(sheet.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded rules */}
                {isOpen && (
                  <div className="border-t border-zinc-700 px-4 py-3 space-y-2">
                    {sheet.rules
                      .slice()
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((rule, i) => (
                        <div key={rule.id} className="flex items-center gap-3 text-sm">
                          <span className="text-zinc-500 text-xs w-5 text-right">{i + 1}.</span>
                          <span className="text-blue-400 font-mono text-xs px-2 py-0.5 bg-blue-400/10 rounded">
                            {OPERATOR_LABELS[rule.operator]}
                          </span>
                          <span className="text-white font-medium">{formatRuleDisplay(rule)}</span>
                          {rule.description && (
                            <span className="text-zinc-500 text-xs">— {rule.description}</span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                {modal.editing ? 'Modifier la feuille' : 'Nouvelle feuille de prix'}
              </h2>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Nom de la feuille</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                  placeholder="ex: Artisans Premium"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Applicable à */}
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Applicable à</label>
                <select
                  value={form.appliesTo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, appliesTo: e.target.value as CustomerType | '' }))
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">— Feuille individuelle (aucune typologie) —</option>
                  <option value="artisan">Artisans / Installateurs</option>
                  <option value="large_installer">Gros Installateurs</option>
                  <option value="wholesaler">Grossistes</option>
                </select>
              </div>

              {/* Statut */}
              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-300">Feuille active</label>
              </div>

              {/* Règles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">Règles de calcul</label>
                  <button
                    type="button"
                    onClick={addRule}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Ajouter une règle
                  </button>
                </div>
                <div className="space-y-3">
                  {form.rules.map((rule, i) => (
                    <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs">{i + 1}.</span>
                        <select
                          value={rule.operator}
                          onChange={(e) => updateRule(i, { operator: e.target.value as PricingRuleOperator })}
                          className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="multiply">× Coefficient (ex: 0.82 = remise 18%)</option>
                          <option value="add">+ Montant fixe (€)</option>
                          <option value="subtract">− Montant fixe (€)</option>
                          <option value="fixed">= Prix fixe absolu (€)</option>
                        </select>
                        {form.rules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRule(i)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={rule.value}
                          onChange={(e) => updateRule(i, { value: e.target.value })}
                          placeholder="Valeur"
                          required
                          className="w-28 bg-zinc-700 border border-zinc-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <input
                          value={rule.description}
                          onChange={(e) => updateRule(i, { description: e.target.value })}
                          placeholder="Description (optionnel)"
                          className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1.5 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {saving ? 'Enregistrement...' : modal.editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
