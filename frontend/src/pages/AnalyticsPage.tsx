import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsReport {
  id: string;
  period_type: string;
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_feed_cost: number;
  total_medicine_cost: number;
  total_equipment_cost: number;
  total_labor_cost: number;
  total_other_cost: number;
  total_cost: number;
  net_profit: number;
  profit_margin: number;
  total_production_quantity: number;
  production_unit?: string;
  inventory_value: number;
  low_stock_items: number;
  production_efficiency: number;
  cost_per_unit: number;
  revenue_per_unit: number;
  recommendations?: string;
  is_analyzed: boolean;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
  }>;
  period: string;
  total_revenue: number;
  total_cost: number;
  net_profit: number;
}

interface RevenueBreakdown {
  item_name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'costs' | 'performance' | 'recommendations'>('overview');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddProduction, setShowAddProduction] = useState(false);

  const [saleForm, setSaleForm] = useState({
    item_name: '',
    quantity: 0,
    unit: 'kg',
    price_per_unit: 0,
    total_amount: 0,
    shipping_cost: 0,
    sale_date: new Date().toISOString().split('T')[0],
    buyer_name: '',
  });

  const [productionForm, setProductionForm] = useState({
    production_type: 'milk',
    quantity: 0,
    unit: 'liters',
    production_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [reportRes, chartRes, revenueRes] = await Promise.all([
        api.get(`/analytics/report?period_type=${period}`),
        api.get(`/analytics/chart-data?period_type=${period}&months=6`),
        api.get(`/analytics/revenue-breakdown`),
      ]);

      setReport(reportRes.data);
      setChartData(chartRes.data);
      setRevenueBreakdown(revenueRes.data);
    } catch (err: any) {
      console.error('Failed to load analytics data:', err);
      setError(err.response?.data?.detail || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/analytics/sales', {
        ...saleForm,
        total_amount: saleForm.quantity * saleForm.price_per_unit,
      });
      setSaleForm({
        item_name: '',
        quantity: 0,
        unit: 'kg',
        price_per_unit: 0,
        total_amount: 0,
        shipping_cost: 0,
        sale_date: new Date().toISOString().split('T')[0],
        buyer_name: '',
      });
      setShowAddSale(false);
      loadAnalyticsData();
      alert('Sale recorded successfully!');
    } catch (err: any) {
      console.error('Failed to add sale:', err);
      alert(err.response?.data?.detail || 'Failed to record sale');
    }
  };

  const handleAddProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/analytics/production', productionForm);
      setProductionForm({
        production_type: 'milk',
        quantity: 0,
        unit: 'liters',
        production_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowAddProduction(false);
      loadAnalyticsData();
      alert('Production recorded successfully!');
    } catch (err: any) {
      console.error('Failed to add production:', err);
      alert(err.response?.data?.detail || 'Failed to record production');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('analytics.loading')}</p>
        </div>
      </div>
    );
  }

  const getRecommendations = () => {
    try {
      return report?.recommendations ? JSON.parse(report.recommendations) : [];
    } catch {
      return [];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('analytics.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('analytics.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddProduction(!showAddProduction)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('analytics.production')}
            </button>
            <button
              onClick={() => setShowAddSale(!showAddSale)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('analytics.sale')}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-8 py-4 m-4 rounded flex-shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8">
        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t(`analytics.${p}`)}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{t('analytics.totalRevenue')}</p>
                  <p className="text-3xl font-bold mt-2">
                    {(report.total_revenue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-green-100 mt-1">{t('analytics.vnd')}</p>
                </div>
                <svg className="w-12 h-12 text-green-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className={`bg-gradient-to-br rounded-lg shadow p-6 text-white ${
              report.net_profit >= 0
                ? 'from-blue-500 to-blue-600'
                : 'from-red-500 to-red-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-90 text-sm font-medium">{t('analytics.netProfit')}</p>
                  <p className="text-3xl font-bold mt-2">
                    {(report.net_profit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs opacity-75 mt-1">{t('analytics.vnd')}</p>
                </div>
                <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{t('analytics.totalCosts')}</p>
                  <p className="text-3xl font-bold mt-2">
                    {(report.total_cost / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-purple-100 mt-1">{t('analytics.vnd')}</p>
                </div>
                <svg className="w-12 h-12 text-purple-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">{t('analytics.profitMargin')}</p>
                  <p className="text-3xl font-bold mt-2">
                    {report.profit_margin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-orange-100 mt-1">{t('analytics.profitMarginLabel')}</p>
                </div>
                <svg className="w-12 h-12 text-orange-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">{t('analytics.productionEfficiency')}</p>
                  <p className="text-3xl font-bold mt-2">
                    {report.production_efficiency.toFixed(1)}%
                  </p>
                  <p className="text-xs text-cyan-100 mt-1">{t('analytics.efficiencyRateLabel')}</p>
                </div>
                <svg className="w-12 h-12 text-cyan-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {(['overview', 'revenue', 'costs', 'performance', 'recommendations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t(`analytics.${tab}`)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.sixMonthTrend')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.datasets[0] ? (chartData.labels as any).map((label: string, i: number) => ({
                  name: label,
                  Revenue: chartData.datasets[0]?.data[i] || 0,
                  Costs: chartData.datasets[1]?.data[i] || 0,
                  Profit: chartData.datasets[2]?.data[i] || 0,
                })) : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Revenue" stroke="#10b981" />
                  <Line type="monotone" dataKey="Costs" stroke="#ef4444" />
                  <Line type="monotone" dataKey="Profit" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Breakdown */}
            {report && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('analytics.costBreakdown')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('analytics.feed'), value: report.total_feed_cost },
                        { name: t('analytics.medicine'), value: report.total_medicine_cost },
                        { name: t('analytics.equipment'), value: report.total_equipment_cost },
                        { name: t('analytics.labor'), value: report.total_labor_cost },
                        { name: t('analytics.other'), value: report.total_other_cost },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M VND`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue by Product */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.revenueByProduct')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item_name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M VND`} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.revenueDetails')}
              </h3>
              <div className="space-y-3">
                {revenueBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.quantity} {t('analytics.unitsSold')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {(item.revenue / 1000000).toFixed(2)}M VND
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Costs Tab */}
        {activeTab === 'costs' && report && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cost Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.costDistribution')}
              </h3>
              <div className="space-y-4">
                {[
                  { name: t('analytics.feed'), value: report.total_feed_cost },
                  { name: t('analytics.medicine'), value: report.total_medicine_cost },
                  { name: t('analytics.equipment'), value: report.total_equipment_cost },
                  { name: t('analytics.labor'), value: report.total_labor_cost },
                  { name: t('analytics.other'), value: report.total_other_cost },
                ].filter(item => item.value > 0).map((item, idx) => {
                  const percent = (item.value / report.total_cost) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(item.value / 1000000).toFixed(2)}M VND ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${COLORS[idx] ? `bg-[${COLORS[idx]}]` : 'bg-gray-500'}`}
                          style={{ width: `${percent}%`, backgroundColor: COLORS[idx] }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cost Analysis
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Cost per Unit</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {(report.cost_per_unit).toFixed(0)} VND
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Average cost to produce one unit
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-300 font-medium">Revenue per Unit</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {(report.revenue_per_unit).toFixed(0)} VND
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Average revenue from one unit
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${report.revenue_per_unit > report.cost_per_unit ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
                  <p className={`text-sm font-medium ${report.revenue_per_unit > report.cost_per_unit ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                    Margin per Unit
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${report.revenue_per_unit > report.cost_per_unit ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {(report.revenue_per_unit - report.cost_per_unit).toFixed(0)} VND
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Performance Metrics
              </h3>
              {report && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Production Efficiency</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {report.production_efficiency.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min(report.production_efficiency, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Profitability</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.max(0, Math.min(report.profit_margin + 50, 100)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${report.net_profit > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.max(0, Math.min(report.profit_margin + 50, 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Cost Control</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.max(0, 100 - (report.total_cost / report.total_revenue * 100)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${Math.max(0, 100 - (report.total_cost / report.total_revenue * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Inventory Health</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {report.low_stock_items === 0 ? '100' : Math.max(10, 100 - report.low_stock_items * 20)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${report.low_stock_items === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${report.low_stock_items === 0 ? 100 : Math.max(10, 100 - report.low_stock_items * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Key Metrics Summary
              </h3>
              {report && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">Total Production</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                      {report.total_production_quantity.toFixed(0)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{report.production_unit}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-300 font-medium">Inventory Value</p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100 mt-2">
                      {(report.inventory_value / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">VND</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg">
                    <p className="text-xs text-orange-600 dark:text-orange-300 font-medium">Low Stock Items</p>
                    <p className="text-xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                      {report.low_stock_items}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Items</p>
                  </div>

                  <div className={`p-4 bg-gradient-to-br rounded-lg ${
                    report.net_profit > 0
                      ? 'from-green-50 to-green-100 dark:from-green-900 dark:to-green-800'
                      : 'from-red-50 to-red-100 dark:from-red-900 dark:to-red-800'
                  }`}>
                    <p className={`text-xs font-medium ${
                      report.net_profit > 0
                        ? 'text-green-600 dark:text-green-300'
                        : 'text-red-600 dark:text-red-300'
                    }`}>
                      Status
                    </p>
                    <p className={`text-xl font-bold mt-2 ${
                      report.net_profit > 0
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {report.net_profit > 0 ? 'Profitable' : 'Loss'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              AI-Generated Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.length > 0 ? (
                recommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-lg border-l-4 ${
                      rec.priority === 'high'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900'
                        : rec.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900'
                        : 'border-green-500 bg-green-50 dark:bg-green-900'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-semibold ${
                        rec.priority === 'high'
                          ? 'text-red-900 dark:text-red-100'
                          : rec.priority === 'medium'
                          ? 'text-yellow-900 dark:text-yellow-100'
                          : 'text-green-900 dark:text-green-100'
                      }`}>
                        {rec.title}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        rec.priority === 'high'
                          ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>

                    <p className={`text-sm mb-3 ${
                      rec.priority === 'high'
                        ? 'text-red-800 dark:text-red-200'
                        : rec.priority === 'medium'
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-green-800 dark:text-green-200'
                    }`}>
                      {rec.description}
                    </p>

                    <div className="mb-3">
                      <p className={`text-xs font-medium mb-1 ${
                        rec.priority === 'high'
                          ? 'text-red-700 dark:text-red-300'
                          : rec.priority === 'medium'
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        Recommended Action:
                      </p>
                      <p className={`text-sm ${
                        rec.priority === 'high'
                          ? 'text-red-800 dark:text-red-200'
                          : rec.priority === 'medium'
                          ? 'text-yellow-800 dark:text-yellow-200'
                          : 'text-green-800 dark:text-green-200'
                      }`}>
                        {rec.action}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-opacity-20 border-gray-900 dark:border-gray-100">
                      <p className={`text-xs font-medium ${
                        rec.priority === 'high'
                          ? 'text-red-700 dark:text-red-300'
                          : rec.priority === 'medium'
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        📊 Impact: {rec.estimated_impact}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p>No recommendations at this time. Keep up the good work!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showAddSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Record Sale</h3>
              <button
                onClick={() => setShowAddSale(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSale} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={saleForm.item_name}
                  onChange={(e) => setSaleForm({ ...saleForm, item_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={saleForm.unit}
                    onChange={(e) => setSaleForm({ ...saleForm, unit: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price per Unit (VND) *
                  </label>
                  <input
                    type="number"
                    value={saleForm.price_per_unit}
                    onChange={(e) => setSaleForm({ ...saleForm, price_per_unit: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shipping Cost (VND)
                  </label>
                  <input
                    type="number"
                    value={saleForm.shipping_cost}
                    onChange={(e) => setSaleForm({ ...saleForm, shipping_cost: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sale Date *
                </label>
                <input
                  type="date"
                  value={saleForm.sale_date}
                  onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buyer Name
                </label>
                <input
                  type="text"
                  value={saleForm.buyer_name}
                  onChange={(e) => setSaleForm({ ...saleForm, buyer_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSale(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Production Modal */}
      {showAddProduction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Record Production</h3>
              <button
                onClick={() => setShowAddProduction(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddProduction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Production Type *
                </label>
                <select
                  value={productionForm.production_type}
                  onChange={(e) => setProductionForm({ ...productionForm, production_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="milk">Milk</option>
                  <option value="eggs">Eggs</option>
                  <option value="meat">Meat</option>
                  <option value="wool">Wool</option>
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
                    value={productionForm.quantity}
                    onChange={(e) => setProductionForm({ ...productionForm, quantity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={productionForm.unit}
                    onChange={(e) => setProductionForm({ ...productionForm, unit: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Production Date *
                </label>
                <input
                  type="date"
                  value={productionForm.production_date}
                  onChange={(e) => setProductionForm({ ...productionForm, production_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={productionForm.notes}
                  onChange={(e) => setProductionForm({ ...productionForm, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Quality notes, observations, etc."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduction(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition"
                >
                  Record Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      
  );
};

export default AnalyticsPage;
