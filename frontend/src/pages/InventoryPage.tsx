import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_cost?: number;
  unit_price?: number;
  min_quantity: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: string;
  quantity: number;
  price_at_transaction?: number;
  total_amount?: number;
  notes?: string;
  created_at: string;
}

interface InventorySummary {
  total_items: number;
  total_value: number;
  low_stock_items: InventoryItem[];
  recent_transactions: InventoryTransaction[];
  categories: string[];
}

interface StockAlert {
  item_id: string;
  name: string;
  current_quantity: number;
  min_quantity: number;
  unit: string;
  status: string;
}

interface InventoryPageProps {
  headerRef?: React.RefObject<HTMLDivElement | null>;
  summaryRef?: React.RefObject<HTMLDivElement | null>;
  stockRef?: React.RefObject<HTMLDivElement | null>;
  transactionRef?: React.RefObject<HTMLDivElement | null>;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ headerRef, summaryRef, stockRef, transactionRef }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'transactions' | 'add'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'feed',
    quantity: 0,
    unit: 'kg',
    unit_cost: 0,
    unit_price: 0,
    min_quantity: 0,
    description: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    item_id: '',
    transaction_type: 'in',
    quantity: 0,
    notes: '',
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [itemsRes, summaryRes, alertsRes] = await Promise.all([
        api.get('/inventory/items'),
        api.get('/inventory/summary'),
        api.get('/inventory/alerts/stock'),
      ]);

      setItems(itemsRes.data);
      setSummary(summaryRes.data);
      setAlerts(alertsRes.data);
    } catch (err: any) {
      console.error('Failed to load inventory data:', err);
      setError(err.response?.data?.detail || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/items', formData);
      setFormData({
        name: '',
        category: 'feed',
        quantity: 0,
        unit: 'kg',
        unit_cost: 0,
        unit_price: 0,
        min_quantity: 0,
        description: '',
      });
      setShowAddForm(false);
      loadInventoryData();
    } catch (err: any) {
      console.error('Failed to add item:', err);
      alert(err.response?.data?.detail || 'Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/items/${itemId}`);
        loadInventoryData();
      } catch (err: any) {
        console.error('Failed to delete item:', err);
        alert(err.response?.data?.detail || 'Failed to delete item');
      }
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/transactions', transactionForm);
      setTransactionForm({
        item_id: '',
        transaction_type: 'in',
        quantity: 0,
        notes: '',
      });
      loadInventoryData();
      alert('Transaction recorded successfully!');
    } catch (err: any) {
      console.error('Failed to add transaction:', err);
      alert(err.response?.data?.detail || 'Failed to record transaction');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('inventory.loading')}</p>
        </div>
      </div>
    );
  }

  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

  const categories = [...new Set(items.map(item => item.category))];

  return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div ref={headerRef} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('inventory.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('inventory.subtitle')}
            </p>
          </div>
          <div ref={transactionRef}>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setActiveTab('add');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('inventory.addItem')}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-8 py-4 m-4 rounded flex-shrink-0">
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="w-full p-8">
        {/* Summary Cards */}
        {summary && (
          <div ref={summaryRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('inventory.totalItems')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.total_items}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('inventory.inventoryValue')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {(summary.total_value / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('inventory.vnd')}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('inventory.lowStockItems')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.low_stock_items.length}
                  </p>
                </div>
                <div className={`${summary.low_stock_items.length > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'} p-3 rounded-full`}>
                  <svg className={`w-6 h-6 ${summary.low_stock_items.length > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('inventory.categories')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.categories.length}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Alerts */}
        {alerts.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
              {t('inventory.stockAlerts')} ({alerts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map(alert => (
                <div
                  key={alert.item_id}
                  className={`p-4 rounded ${
                    alert.status === 'critical'
                      ? 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700'
                      : 'bg-yellow-100 dark:bg-yellow-800 border border-yellow-300 dark:border-yellow-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{alert.name}</p>
                      <p className={`text-sm mt-1 ${
                        alert.status === 'critical'
                          ? 'text-red-700 dark:text-red-200'
                          : 'text-yellow-700 dark:text-yellow-200'
                      }`}>
                        Current: {alert.current_quantity} {alert.unit} (Min: {alert.min_quantity} {alert.unit})
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.status === 'critical'
                        ? 'bg-red-600 dark:bg-red-700 text-white'
                        : 'bg-yellow-600 dark:bg-yellow-700 text-white'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div ref={stockRef} className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('inventory.overview')}
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'items'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('inventory.items')} ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('inventory.transactions')}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && summary && (
          <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Low Stock Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">{t('inventory.lowStockItemsSection')}</h3>
              </div>
              <div className="p-6">
                {summary.low_stock_items.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('inventory.allItemsWellStocked')}</p>
                ) : (
                  <div className="space-y-4">
                    {summary.low_stock_items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} / {item.min_quantity} {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${(item.quantity / item.min_quantity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">{t('inventory.recentTransactions')}</h3>
              </div>
              <div className="p-6">
                {summary.recent_transactions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('inventory.noTransactions')}</p>
                ) : (
                  <div className="space-y-3">
                    {summary.recent_transactions.slice(0, 5).map(trans => (
                      <div key={trans.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            trans.transaction_type === 'in'
                              ? 'bg-green-100 dark:bg-green-900'
                              : 'bg-red-100 dark:bg-red-900'
                          }`}>
                            <svg className={`w-4 h-4 ${
                              trans.transaction_type === 'in'
                                ? 'text-green-600 dark:text-green-300'
                                : 'text-red-600 dark:text-red-300'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {trans.transaction_type === 'in' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {trans.transaction_type.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(trans.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {trans.quantity} units
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="w-full">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-6 flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCategory === null
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('inventory.all')} ({items.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full font-medium transition capitalize ${
                      selectedCategory === cat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat} ({items.filter(i => i.category === cat).length})
                  </button>
                ))}
              </div>
            )}

            {/* Items Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.unitCost')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.value')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.status')}
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {t('inventory.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {t('inventory.noItems')}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const itemValue = (item.unit_cost || 0) * item.quantity;
                      const status = item.quantity <= item.min_quantity ? t('inventory.low') : t('inventory.ok');

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {item.unit_cost ? `${(item.unit_cost / 1000).toFixed(0)}K` : '-'} {t('inventory.vnd')}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {(itemValue / 1000000).toFixed(2)}M {t('inventory.vnd')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === t('inventory.low')
                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                            >
                              {t('inventory.delete')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Add Transaction Form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('inventory.recordTransaction')}
                </h3>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('inventory.item')}
                    </label>
                    <select
                      value={transactionForm.item_id}
                      onChange={(e) => setTransactionForm({ ...transactionForm, item_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">{t('inventory.selectItem')}</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantity} {item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('inventory.type')}
                    </label>
                    <select
                      value={transactionForm.transaction_type}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transaction_type: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="in">{t('inventory.in')}</option>
                      <option value="out">{t('inventory.out')}</option>
                      <option value="return">{t('inventory.return')}</option>
                      <option value="adjustment">{t('inventory.adjustment')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={transactionForm.quantity}
                      onChange={(e) => setTransactionForm({ ...transactionForm, quantity: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={transactionForm.notes}
                      onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Add any notes about this transaction..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
                  >
                    Record Transaction
                  </button>
                </form>
              </div>
            </div>

            {/* Transaction History */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {summary && summary.recent_transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No transactions recorded
                        </td>
                      </tr>
                    ) : (
                      summary?.recent_transactions.map(trans => {
                        const item = items.find(i => i.id === trans.item_id);
                        return (
                          <tr key={trans.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                              {item?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                trans.transaction_type === 'in'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              }`}>
                                {trans.transaction_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                              {trans.quantity} {item?.unit}
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                              {trans.total_amount ? `${(trans.total_amount / 1000000).toFixed(2)}M` : '-'} VND
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {new Date(trans.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Add New Item</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="feed">Feed</option>
                    <option value="medicine">Medicine</option>
                    <option value="equipment">Equipment</option>
                    <option value="seed">Seed</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      placeholder="kg, liter, etc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Cost (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Price (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Quantity (Alert threshold)
                  </label>
                  <input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default InventoryPage;
