import { useMemo } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Users, AlertTriangle, Star } from 'lucide-react';
import './AnalyticsPage.css';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#111827', border: '1px solid #1a2840', borderRadius: 8, color: '#f0f6ff', fontSize: 12,
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export default function AnalyticsPage() {
  const { incidents, officers, zones } = useLiveStore();

  const stats = useMemo(() => {
    const resolved = incidents.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status));
    const avgResponse = Math.floor(officers.reduce((a, o) => a + o.avgResponseTime, 0) / officers.length);
    const totalHandled = officers.reduce((a, o) => a + o.incidentsHandled, 0);
    const avgRating = (officers.reduce((a, o) => a + o.citizenRating, 0) / officers.length).toFixed(1);
    return { resolved: resolved.length, total: incidents.length, avgResponse, totalHandled, avgRating };
  }, [incidents, officers]);

  const incidentsByType = useMemo(() => {
    const counts = {};
    incidents.forEach(i => { counts[i.typeLabel] = (counts[i.typeLabel] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [incidents]);

  const zoneStats = useMemo(() => zones.map(z => ({
    name: z.name.split(' — ')[1],
    incidents: z.incidentCount30d,
    response: Math.floor(z.avgResponseTime / 60),
    officers: z.officerCount,
  })), [zones]);

  const monthlyData = MONTH_LABELS.map((month, i) => ({
    month,
    incidents: Math.floor(Math.random() * 40 + 20),
    resolved: Math.floor(Math.random() * 35 + 15),
    avgResponse: Math.floor(Math.random() * 4 + 3),
  }));

  const responseTimeData = officers.slice(0, 10).map(o => ({
    name: o.firstName,
    time: Math.floor(o.avgResponseTime / 60),
    rating: o.citizenRating,
  }));

  const SUMMARY_STATS = [
    { label: 'Total Incidents', value: stats.total, icon: AlertTriangle, color: 'var(--accent-red)', change: '+12%', up: true },
    { label: 'Resolved', value: stats.resolved, icon: TrendingUp, color: 'var(--accent-green)', change: '+8%', up: true },
    { label: 'Avg Response', value: `${Math.floor(stats.avgResponse / 60)}m ${stats.avgResponse % 60}s`, icon: Clock, color: 'var(--accent-cyan)', change: '-15%', up: true },
    { label: 'Citizen Rating', value: `${stats.avgRating} ⭐`, icon: Star, color: 'var(--accent-amber)', change: '+0.2', up: true },
  ];

  return (
    <div className="analytics-page page-content" id="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Performance metrics and statistics</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="analytics-stats animate-fade-in-up">
        {SUMMARY_STATS.map((s, i) => (
          <div key={s.label} className={`analytics-stat-card stagger-${i + 1}`}>
            <div className="analytics-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="analytics-stat-value">{s.value}</p>
              <p className="analytics-stat-label">{s.label}</p>
            </div>
            <div className={`stat-change ${s.up ? 'up' : 'down'}`} style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
              {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Monthly Incidents Trend */}
        <div className="chart-card animate-fade-in-up stagger-1">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Incident Trend</h3>
            <span className="chart-badge">Last 8 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incidentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} fill="url(#incidentsGrad)" name="Total" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#resolvedGrad)" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Type */}
        <div className="chart-card animate-fade-in-up stagger-2">
          <div className="chart-header">
            <h3 className="chart-title">Incidents by Type</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={incidentsByType} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {incidentsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {incidentsByType.map((item, i) => (
              <div key={item.name} className="pie-legend-item">
                <span style={{ width: 8, height: 8, background: COLORS[i % COLORS.length], borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                <span>{item.name}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Comparison */}
        <div className="chart-card full-width animate-fade-in-up stagger-3">
          <div className="chart-header">
            <h3 className="chart-title">Zone Performance Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zoneStats} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="incidents" name="Incidents (30d)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="response" name="Avg Response (min)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="officers" name="Officers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Officer Response Times */}
        <div className="chart-card animate-fade-in-up stagger-4">
          <div className="chart-header">
            <h3 className="chart-title">Officer Response Times (min)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={responseTimeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={60} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="time" name="Avg Response" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Response over time */}
        <div className="chart-card animate-fade-in-up stagger-5">
          <div className="chart-header">
            <h3 className="chart-title">Avg Response Time Trend (min)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="avgResponse" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }} name="Avg Response (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
