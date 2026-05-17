'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';

type SortKey = 'date' | 'amount' | 'status';
type StatusFilter = 'all' | 'approved' | 'submitted' | 'rejected' | 'draft' | 'paid';

interface ExpenseApi {
  id: string | number;
  ref?: string;
  objet?: string;
  total?: number | string;
  status?: string;
  createdAt?: string;
  objet_action?: string;
  montant_total?: number | string;
  statut?: string;
  created_at?: string;
  commission?: string;
  ville_depart?: string;
  ville_arrivee?: string;
  expenses?: unknown[];
}

interface ExpenseView {
  id: string;
  ref: string;
  title: string;
  amount: number;
  status: string;
  statusLabel: string;
  date: string;
  commission: string;
  location: string;
  itemsCount: number;
}

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true, href: '/dashboard' },
  { label: 'Notes de frais', icon: FileText, href: '/ndf' },
  { label: 'Ajouter une dépense', icon: Plus, href: '/nouvelle-ndf' },
  { label: 'Historique', icon: History, href: '/dashboard' },
  { label: 'Statistiques', icon: BarChart3, href: '/dashboard' },
  { label: 'Équipe', icon: Users, href: '/dashboard' },
  { label: 'Paramètres', icon: Settings, href: '/dashboard' },
];

const statusConfig: Record<string, { label: string; badge: string; dot: string; icon: typeof CheckCircle2 }> = {
  approved: {
    label: 'Validé',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  submitted: {
    label: 'En attente',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-500',
    icon: Clock3,
  },
  rejected: {
    label: 'Refusé',
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  draft: {
    label: 'Brouillon',
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    icon: FileText,
  },
  paid: {
    label: 'Payé',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    icon: ShieldCheck,
  },
};

const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

function toAmount(value: ExpenseApi['total']) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

function toExpenseView(expense: ExpenseApi, index: number): ExpenseView {
  const status = (expense.statut || expense.status || 'submitted').toLowerCase();
  const createdAt = expense.created_at || expense.createdAt || new Date().toISOString();
  const location = [expense.ville_depart, expense.ville_arrivee].filter(Boolean).join(' → ');

  return {
    id: String(expense.id),
    ref: expense.ref || `NDF-${String(index + 1).padStart(4, '0')}`,
    title: expense.objet_action || expense.objet || 'Note de frais',
    amount: toAmount(expense.montant_total ?? expense.total),
    status,
    statusLabel: statusConfig[status]?.label || status,
    date: createdAt,
    commission: expense.commission || 'Fédération',
    location: location || 'Mission fédérale',
    itemsCount: Array.isArray(expense.expenses) ? expense.expenses.length : 1,
  };
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-100/70 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-900/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.submitted;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${config.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-72 flex-col bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-300 lg:sticky lg:top-16 lg:z-20 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Fédération</p>
                <p className="text-lg font-black">Expense Pro</p>
              </div>
            </div>
            <button className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                item.active
                  ? 'bg-white text-slate-950 shadow-xl shadow-blue-950/20'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="m-4 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-blue-200">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Contrôle 2026</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Barèmes fédéraux, justificatifs et validations centralisés.
          </p>
        </div>
      </aside>
    </>
  );
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<ExpenseView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/expenses', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.success) {
          setExpenses((json.data ?? []).map(toExpenseView));
        } else {
          setError(json.error || 'Erreur chargement');
        }
      })
      .catch(() => setError('Erreur réseau'))
      .finally(() => setLoading(false));
  }, []);

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return expenses
      .filter((expense) => {
        const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
        const matchesQuery =
          !normalizedQuery ||
          [expense.ref, expense.title, expense.commission, expense.location, expense.statusLabel]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortKey === 'amount') return b.amount - a.amount;
        if (sortKey === 'status') return a.statusLabel.localeCompare(b.statusLabel);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [expenses, query, sortKey, statusFilter]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleExpenses = filteredExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const now = new Date();
  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedCount = expenses.filter((expense) => expense.status === 'approved' || expense.status === 'paid').length;
  const pendingCount = expenses.filter((expense) => expense.status === 'submitted' || expense.status === 'draft').length;

  const statCards = [
    {
      label: 'Total dépensé',
      value: euro.format(totalSpent),
      detail: `${expenses.length} notes suivies`,
      icon: WalletCards,
      accent: 'bg-gradient-to-r from-slate-950 to-blue-600',
    },
    {
      label: 'Dépenses du mois',
      value: euro.format(monthlyTotal),
      detail: `${monthlyExpenses.length} dossiers ce mois-ci`,
      icon: CalendarDays,
      accent: 'bg-gradient-to-r from-blue-600 to-cyan-400',
    },
    {
      label: 'Dépenses validées',
      value: String(approvedCount),
      detail: 'Contrôle fédéral terminé',
      icon: CheckCircle2,
      accent: 'bg-gradient-to-r from-emerald-500 to-green-400',
    },
    {
      label: 'Dépenses en attente',
      value: String(pendingCount),
      detail: 'À suivre par la trésorerie',
      icon: Clock3,
      accent: 'bg-gradient-to-r from-amber-400 to-blue-500',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1F5F9] text-slate-950">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <motion.header
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Dashboard</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                      Pilotage notes de frais
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <label className="relative block md:w-80">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Rechercher une note, commission..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <button className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
                    <Bell className="h-5 w-5" />
                  </button>
                  <Link
                    href="/nouvelle-ndf"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5" />
                    Nouvelle dépense
                  </Link>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-slate-950 to-blue-600 text-sm font-black text-white">
                      ML
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-black text-slate-950">Membre fédéral</p>
                      <p className="text-xs font-medium text-slate-500">Trésorerie sportive</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.header>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card, index) => (
                <StatCard key={card.label} {...card} delay={0.08 * index} />
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
              >
                <div className="border-b border-slate-100 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-slate-950">Notes de frais</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Suivi, statuts, justificatifs et validation.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label className="relative">
                        <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={statusFilter}
                          onChange={(event) => {
                            setStatusFilter(event.target.value as StatusFilter);
                            setPage(1);
                          }}
                          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="approved">Validé</option>
                          <option value="submitted">En attente</option>
                          <option value="rejected">Refusé</option>
                          <option value="draft">Brouillon</option>
                          <option value="paid">Payé</option>
                        </select>
                      </label>
                      <label className="relative">
                        <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={sortKey}
                          onChange={(event) => setSortKey(event.target.value as SortKey)}
                          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="date">Tri par date</option>
                          <option value="amount">Tri par montant</option>
                          <option value="status">Tri par statut</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-5 py-4">Référence</th>
                        <th className="px-5 py-4">Mission</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Montant</th>
                        <th className="px-5 py-4">Statut</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading &&
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="px-5 py-5" colSpan={6}>
                              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                            </td>
                          </tr>
                        ))}

                      {!loading &&
                        visibleExpenses.map((expense, index) => (
                          <motion.tr
                            key={expense.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="group border-b border-slate-100 transition hover:bg-blue-50/50"
                          >
                            <td className="px-5 py-5">
                              <p className="font-black text-slate-950">{expense.ref}</p>
                              <p className="mt-1 text-xs font-semibold text-slate-400">{expense.itemsCount} ligne(s)</p>
                            </td>
                            <td className="px-5 py-5">
                              <p className="max-w-xs truncate font-bold text-slate-800">{expense.title}</p>
                              <p className="mt-1 max-w-xs truncate text-sm text-slate-500">{expense.location}</p>
                            </td>
                            <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                              {new Date(expense.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-5 py-5 text-base font-black text-slate-950">{euro.format(expense.amount)}</td>
                            <td className="px-5 py-5">
                              <StatusBadge status={expense.status} />
                            </td>
                            <td className="px-5 py-5 text-right">
                              <Link
                                href={`/ndf/${expense.id}`}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition group-hover:border-blue-200 group-hover:text-blue-600"
                              >
                                Détail
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {!loading && visibleExpenses.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                      <FileText className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-lg font-black text-slate-950">Aucune note de frais trouvée</p>
                    <p className="mt-2 text-sm text-slate-500">Modifiez les filtres ou créez une nouvelle dépense.</p>
                    <Link
                      href="/nouvelle-ndf"
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25"
                    >
                      <Plus className="h-4 w-4" />
                      Créer une note
                    </Link>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    {filteredExpenses.length} résultat(s) • page {currentPage}/{totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="space-y-6"
              >
                <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-[0_20px_70px_rgba(15,23,42,0.20)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Nouvelle dépense</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight">Saisie rapide</h2>
                    </div>
                    <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-600/30">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-blue-300/50 bg-white/[0.06] p-5 text-center transition hover:border-blue-300 hover:bg-white/[0.08]">
                    <UploadCloud className="mx-auto h-8 w-8 text-blue-200" />
                    <p className="mt-3 text-sm font-black">Glisser un justificatif</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">PDF, PNG ou JPG, aperçu intégré dans le parcours complet.</p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Catégorie</span>
                      <select className="h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white outline-none focus:border-blue-300">
                        <option className="text-slate-950">Transport</option>
                        <option className="text-slate-950">Hôtel</option>
                        <option className="text-slate-950">Repas</option>
                        <option className="text-slate-950">Autre</option>
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Montant</span>
                        <input
                          placeholder="0,00 €"
                          className="h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-blue-300"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Date</span>
                        <input
                          type="date"
                          className="h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white outline-none focus:border-blue-300"
                        />
                      </label>
                    </div>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Commentaire</span>
                      <textarea
                        rows={3}
                        placeholder="Objet de la dépense"
                        className="resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-blue-300"
                      />
                    </label>
                  </div>

                  <Link
                    href="/nouvelle-ndf"
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    Continuer la saisie
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Validation</p>
                      <h2 className="mt-1 text-xl font-black text-slate-950">Flux trésorerie</h2>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="mt-5 space-y-4">
                    {[
                      ['Justificatif reçu', 'bg-emerald-500'],
                      ['Barème appliqué', 'bg-blue-600'],
                      ['Contrôle trésorier', 'bg-slate-300'],
                    ].map(([label, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="text-sm font-bold text-slate-700">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
