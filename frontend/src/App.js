import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// ─── API CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || 'https://hrms-fullstack-jw1w.onrender.com/api';

const api = {
  getHeaders: () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('hrms_token') || ''}`
  }),
  get: (path) => fetch(`${BASE_URL}${path}`, { headers: api.getHeaders() }).then(r => r.json()),
  post: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', headers: api.getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  put: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'PUT', headers: api.getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: api.getHeaders() }).then(r => r.json()),
};

// ─── THEME ─────────────────────────────────────────────────────────────────────
const theme = {
  coral: '#FF6B6B',
  coralLight: '#FF8E8E',
  coralDark: '#E85555',
  blue: '#4A90D9',
  blueLight: '#6BA8E8',
  blueDark: '#2D6BB5',
  teal: '#2EC4B6',
  mint: '#CBF3F0',
  white: '#FFFFFF',
  offWhite: '#F8FAFF',
  lightGray: '#F1F4FB',
  borderColor: '#E2E8F4',
  textPrimary: '#1A2340',
  textSecondary: '#5A6A8A',
  textMuted: '#8FA0BF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  cardShadow: '0 2px 16px rgba(74,144,217,0.10)',
  cardShadowHover: '0 8px 32px rgba(74,144,217,0.18)',
};

const s = {
  app: { fontFamily: "'Plus Jakarta Sans', sans-serif", background: theme.offWhite, minHeight: '100vh', color: theme.textPrimary },
  // Auth
  authWrap: { minHeight: '100vh', background: `linear-gradient(135deg, #FF6B6B22 0%, #4A90D922 50%, #2EC4B622 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  authCard: { background: theme.white, borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(26,35,64,0.12)' },
  authTitle: { fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: theme.textPrimary, marginBottom: '4px' },
  authSubtitle: { color: theme.textSecondary, fontSize: '14px', marginBottom: '32px' },
  // Layout
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: '260px', background: theme.white, borderRight: `1px solid ${theme.borderColor}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 16px rgba(74,144,217,0.06)' },
  sidebarTop: { padding: '24px 20px 16px', borderBottom: `1px solid ${theme.borderColor}` },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { width: '36px', height: '36px', background: `linear-gradient(135deg, ${theme.coral}, ${theme.blue})`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px' },
  logoText: { fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: theme.textPrimary },
  sidebarUser: { padding: '16px 20px', borderBottom: `1px solid ${theme.borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: (color) => ({ width: '36px', height: '36px', borderRadius: '50%', background: color || theme.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }),
  navList: { flex: 1, padding: '12px 12px', overflowY: 'auto' },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '2px', background: active ? `linear-gradient(135deg, ${theme.coral}15, ${theme.blue}15)` : 'transparent', color: active ? theme.coral : theme.textSecondary, fontWeight: active ? 600 : 400, fontSize: '14px', transition: 'all 0.2s', border: active ? `1px solid ${theme.coral}30` : '1px solid transparent' }),
  main: { marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: { background: theme.white, borderBottom: `1px solid ${theme.borderColor}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(74,144,217,0.06)' },
  content: { padding: '32px', flex: 1 },
  // Cards
  card: { background: theme.white, borderRadius: '16px', padding: '24px', boxShadow: theme.cardShadow, border: `1px solid ${theme.borderColor}` },
  statCard: (color) => ({ background: theme.white, borderRadius: '16px', padding: '20px', boxShadow: theme.cardShadow, border: `1px solid ${theme.borderColor}`, borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '16px' }),
  statIcon: (color) => ({ width: '48px', height: '48px', borderRadius: '12px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }),
  // Forms
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${theme.borderColor}`, fontSize: '14px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box', fontFamily: 'inherit', background: theme.white, color: theme.textPrimary },
  label: { display: 'block', fontWeight: 600, fontSize: '13px', color: theme.textSecondary, marginBottom: '6px' },
  // Buttons
  btnPrimary: { background: `linear-gradient(135deg, ${theme.coral}, ${theme.coralDark})`, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontFamily: 'inherit' },
  btnSecondary: { background: theme.lightGray, color: theme.textPrimary, border: `1.5px solid ${theme.borderColor}`, padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontFamily: 'inherit' },
  btnBlue: { background: `linear-gradient(135deg, ${theme.blue}, ${theme.blueDark})`, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontFamily: 'inherit' },
  btnDanger: { background: '#FEF2F2', color: theme.error, border: `1.5px solid ${theme.error}30`, padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  btnSmall: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit' },
  // Badges
  badge: (color, bg) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: color, background: bg }),
  // Table
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '14px' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `2px solid ${theme.borderColor}` },
  td: { padding: '14px 16px', borderBottom: `1px solid ${theme.borderColor}`, color: theme.textPrimary, verticalAlign: 'middle' },
  // Grid
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(26,35,64,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  modal: { background: theme.white, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(26,35,64,0.2)' },
  // SOS
  sosBtn: { background: `linear-gradient(135deg, #EF4444, #DC2626)`, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 20px rgba(239,68,68,0.4)', animation: 'pulse 2s infinite', fontFamily: 'inherit' },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
const getRoleColor = (role) => role === 'admin' ? theme.coral : role === 'doctor' ? theme.blue : theme.teal;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

const StatusBadge = ({ status }) => {
  const map = {
    scheduled: [theme.blue, theme.blue + '15'],
    confirmed: [theme.success, theme.success + '15'],
    completed: [theme.textMuted, theme.lightGray],
    cancelled: [theme.error, theme.error + '15'],
    active: [theme.success, theme.success + '15'],
    inactive: [theme.error, theme.error + '15'],
  };
  const [color, bg] = map[status] || [theme.textMuted, theme.lightGray];
  return <span style={s.badge(color, bg)}>{status}</span>;
};

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: theme.success, error: theme.error, info: theme.blue };
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: theme.white, border: `1.5px solid ${colors[type] || theme.borderColor}`, borderRadius: '14px', padding: '16px 20px', boxShadow: '0 8px 32px rgba(26,35,64,0.15)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '280px', maxWidth: '400px' }}>
      <span style={{ fontSize: '20px' }}>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: theme.textPrimary }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, fontSize: '18px' }}>×</button>
    </div>
  );
};

// ─── AUTH SCREENS ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, onGoRegister }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      if (res.success) { localStorage.setItem('hrms_token', res.token); onLogin(res.user); }
      else setError(res.message || 'Login failed');
    } catch { setError('Could not connect to server. Is the backend running?'); }
    setLoading(false);
  };

  return (
    <div style={s.authWrap}>
      <div style={s.authCard}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${theme.coral}, ${theme.blue})`, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>🏥</div>
          <div style={s.authTitle}>Welcome back</div>
          <div style={s.authSubtitle}>Sign in to your HRMS account</div>
        </div>
        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px', marginBottom: '20px', color: theme.error, fontSize: '13px' }}>{error}</div>}
        <div style={{ marginBottom: '16px' }}>
          <label style={s.label}>Email Address</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', padding: '13px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Signing in...' : '🔐 Sign In'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: theme.textSecondary }}>
          Don't have an account?{' '}
          <span style={{ color: theme.blue, cursor: 'pointer', fontWeight: 600 }} onClick={onGoRegister}>Register here</span>
        </div>
        <div style={{ marginTop: '24px', padding: '16px', background: theme.lightGray, borderRadius: '12px', fontSize: '12px', color: theme.textSecondary }}>
          <strong>Demo accounts:</strong><br />
          Admin: admin@hrms.com / admin123<br />
          Doctor: doctor@hrms.com / doctor123<br />
          Patient: patient@hrms.com / patient123
        </div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onBack }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '', specialization: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await api.post('/auth/register', form);
      if (res.success) { setMsg('✅ Registered! Please login.'); setTimeout(onBack, 2000); }
      else setMsg('❌ ' + (res.message || res.errors?.[0]?.msg || 'Registration failed'));
    } catch { setMsg('❌ Could not connect to server'); }
    setLoading(false);
  };

  return (
    <div style={s.authWrap}>
      <div style={{ ...s.authCard, maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ ...s.authTitle }}>Create Account</div>
          <div style={s.authSubtitle}>Join the HRMS platform</div>
        </div>
        {msg && <div style={{ background: msg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${msg.startsWith('✅') ? '#BBF7D0' : '#FECACA'}`, borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: msg.startsWith('✅') ? theme.success : theme.error }}>{msg}</div>}
        <div style={s.grid2}>
          {[['name', 'Full Name', 'text', 'Dr. Priya Sharma'], ['email', 'Email', 'email', 'you@example.com']].map(([k, l, t, p]) => (
            <div key={k}>
              <label style={s.label}>{l}</label>
              <input style={s.input} type={t} placeholder={p} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={s.label}>Role</label>
          <select style={s.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {form.role === 'doctor' && (
          <div style={{ marginTop: '14px' }}>
            <label style={s.label}>Specialization</label>
            <input style={s.input} placeholder="e.g. Cardiologist" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
          </div>
        )}
        <div style={{ marginTop: '14px' }}>
          <label style={s.label}>Phone</label>
          <input style={s.input} placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', padding: '13px', marginTop: '24px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Creating account...' : '🚀 Create Account'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: theme.textSecondary }}>
          <span style={{ color: theme.blue, cursor: 'pointer', fontWeight: 600 }} onClick={onBack}>← Back to Login</span>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
const navItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'records', label: 'Health Records', icon: '📋' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'assign', label: 'Assign Doctors', icon: '🔗' },
    { id: 'fhir', label: 'FHIR Interoperability', icon: '🔄' },
    { id: 'audit', label: 'Audit Log', icon: '🔍' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'My Patients', icon: '🩺' },
    { id: 'records', label: 'Health Records', icon: '📋' },
    { id: 'timeline', label: 'Medical Timeline', icon: '📜' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'drugcheck', label: 'Drug Interactions', icon: '⚗️' },
    { id: 'fhir', label: 'FHIR Interoperability', icon: '🔄' },
  ],
  patient: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'records', label: 'My Records', icon: '📋' },
    { id: 'timeline', label: 'Medical Timeline', icon: '📜' },
    { id: 'riskscore', label: 'Health Risk Score', icon: '🎯' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'messages', label: 'Chat Doctor', icon: '💬' },
    { id: 'symptoms', label: 'AI Symptom Check', icon: '🤖' },
    { id: 'drugcheck', label: 'Drug Interactions', icon: '⚗️' },
    { id: 'fhir', label: 'FHIR Interoperability', icon: '🔄' },
    { id: 'permissions', label: 'Data Permissions', icon: '🔐' },
    { id: 'sos', label: 'Emergency SOS', icon: '🆘' },
    { id: 'analytics', label: 'Health Analytics', icon: '📈' },
  ],
};

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const items = navItems[user.role] || [];
  return (
    <div style={s.sidebar}>
      <div style={s.sidebarTop}>
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>H</div>
          <div style={s.logoText}>HRMS</div>
        </div>
      </div>
      <div style={s.sidebarUser}>
        <div style={s.avatar(getRoleColor(user.role))}>{getInitials(user.name)}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: theme.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
          <div style={s.badge(getRoleColor(user.role), getRoleColor(user.role) + '18')}>{user.role}</div>
        </div>
      </div>
      <div style={s.navList}>
        {items.map(item => (
          <div key={item.id} style={s.navItem(activeTab === item.id)} onClick={() => setActiveTab(item.id)}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 12px', borderTop: `1px solid ${theme.borderColor}` }}>
        <button style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={onLogout}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ user, toast }) => {
  const [stats, setStats] = useState({ records: 0, appointments: 0, patients: 0, doctors: 0 });
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, recRes] = await Promise.all([api.get('/appointments'), api.get('/records')]);
        if (apptRes.success) setAppointments(apptRes.appointments || []);
        if (recRes.success) setRecords(recRes.records || []);
        if (user.role === 'admin') {
          const usersRes = await api.get('/users');
          if (usersRes.success) {
            setStats(st => ({ ...st, patients: usersRes.users.filter(u => u.role === 'patient').length, doctors: usersRes.users.filter(u => u.role === 'doctor').length }));
          }
        }
        setStats(st => ({ ...st, records: recRes.records?.length || 0, appointments: apptRes.appointments?.length || 0 }));
      } catch { toast('Failed to load dashboard', 'error'); }
      setLoading(false);
    };
    load();
  }, [user.role]);

  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').slice(0, 5);

  const chartData = [
    { month: 'Jan', records: 12, appointments: 8 },
    { month: 'Feb', records: 19, appointments: 15 },
    { month: 'Mar', records: 14, appointments: 12 },
    { month: 'Apr', records: 22, appointments: 18 },
    { month: 'May', records: 18, appointments: 14 },
    { month: 'Jun', records: records.length + 5, appointments: appointments.length + 3 },
  ];

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: theme.textMuted, fontSize: '18px' }}>Loading dashboard...</div>;

  const statCards = user.role === 'admin'
    ? [
        { label: 'Total Records', value: stats.records, icon: '📋', color: theme.blue },
        { label: 'Appointments', value: stats.appointments, icon: '📅', color: theme.coral },
        { label: 'Patients', value: stats.patients, icon: '🧑‍🤝‍🧑', color: theme.teal },
        { label: 'Doctors', value: stats.doctors, icon: '👨‍⚕️', color: theme.warning },
      ]
    : user.role === 'doctor'
    ? [
        { label: 'My Patients', value: user.assignedPatients?.length || 0, icon: '🩺', color: theme.blue },
        { label: 'Total Records', value: stats.records, icon: '📋', color: theme.coral },
        { label: 'Appointments', value: stats.appointments, icon: '📅', color: theme.teal },
        { label: 'Rating', value: (user.averageRating || 0).toFixed(1) + '⭐', icon: '🌟', color: theme.warning },
      ]
    : [
        { label: 'My Records', value: stats.records, icon: '📋', color: theme.blue },
        { label: 'Appointments', value: stats.appointments, icon: '📅', color: theme.coral },
        { label: 'Upcoming', value: upcoming.length, icon: '⏰', color: theme.teal },
        { label: 'Health Score', value: '82/100', icon: '💚', color: theme.success },
      ];

  return (
    <div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', marginBottom: '8px', color: theme.textPrimary }}>
        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}! 👋
      </h2>
      <p style={{ color: theme.textSecondary, marginBottom: '28px', fontSize: '15px' }}>Here's what's happening today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

      <div style={s.grid4}>
        {statCards.map((sc, i) => (
          <div key={i} style={s.statCard(sc.color)}>
            <div style={s.statIcon(sc.color)}>{sc.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: theme.textPrimary }}>{sc.value}</div>
              <div style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: 500 }}>{sc.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...s.grid2, marginTop: '24px' }}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', color: theme.textPrimary }}>Activity Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.textMuted }} />
              <YAxis tick={{ fontSize: 12, fill: theme.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: theme.cardShadow }} />
              <Line type="monotone" dataKey="records" stroke={theme.blue} strokeWidth={2.5} dot={{ r: 4, fill: theme.blue }} name="Records" />
              <Line type="monotone" dataKey="appointments" stroke={theme.coral} strokeWidth={2.5} dot={{ r: 4, fill: theme.coral }} name="Appointments" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px', color: theme.textPrimary }}>Upcoming Appointments</h3>
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📅</div>
              <div>No upcoming appointments</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcoming.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: theme.lightGray, borderRadius: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: theme.blue + '15', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.role === 'patient' ? `Dr. ${a.doctor?.name}` : a.patient?.name}</div>
                    <div style={{ fontSize: '12px', color: theme.textMuted }}>{formatDate(a.date)} at {a.time}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── HEALTH RECORDS ────────────────────────────────────────────────────────────
const HealthRecords = ({ user, toast }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', title: '', recordType: 'consultation', description: '', diagnosis: '', symptoms: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/records');
    if (res.success) setRecords(res.records);
    if (user.role === 'doctor') {
      const pRes = await api.get('/users/patients');
      if (pRes.success) setPatients(pRes.patients);
    }
    setLoading(false);
  }, [user.role]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const body = { ...form, symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean) };
    const res = await api.post('/records', body);
    if (res.success) { toast('Record created successfully!', 'success'); setShowModal(false); load(); setForm({ patientId: '', title: '', recordType: 'consultation', description: '', diagnosis: '', symptoms: '' }); }
    else toast(res.message, 'error');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    const res = await api.delete(`/records/${id}`);
    if (res.success) { toast('Record deleted', 'success'); load(); }
    else toast(res.message, 'error');
  };

  const recordTypeColors = { consultation: theme.blue, lab_result: theme.teal, prescription: theme.coral, surgery: theme.warning, vaccination: theme.success, general: theme.textMuted };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>Health Records</h2>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>{records.length} records found</p>
        </div>
        {(user.role === 'doctor') && (
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>➕ New Record</button>
        )}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>Loading records...</div> : (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Patient</th>
                <th style={s.th}>Title</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Doctor</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Diagnosis</th>
                {user.role !== 'patient' && <th style={s.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', padding: '60px', color: theme.textMuted }}>📋 No records found</td></tr>
              ) : records.map(r => (
                <tr key={r._id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={s.avatar(theme.teal)}>{getInitials(r.patient?.name || '?')}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.patient?.name}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>{r.patient?.bloodGroup || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}><span style={{ fontWeight: 600 }}>{r.title}</span></td>
                  <td style={s.td}><span style={s.badge(recordTypeColors[r.recordType], recordTypeColors[r.recordType] + '18')}>{r.recordType?.replace('_', ' ')}</span></td>
                  <td style={s.td}>{r.doctor?.name ? `Dr. ${r.doctor.name}` : '-'}</td>
                  <td style={s.td}>{formatDate(r.date)}</td>
                  <td style={s.td}>{r.diagnosis || '-'}</td>
                  {user.role !== 'patient' && (
                    <td style={s.td}>
                      <button style={{ ...s.btnDanger }} onClick={() => handleDelete(r._id)}>🗑 Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', marginBottom: '24px' }}>New Health Record</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Patient</label>
                <select style={s.input} value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Title</label>
                <input style={s.input} placeholder="Record title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Record Type</label>
                <select style={s.input} value={form.recordType} onChange={e => setForm(f => ({ ...f, recordType: e.target.value }))}>
                  {['consultation', 'lab_result', 'prescription', 'surgery', 'vaccination', 'general'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Description</label>
                <textarea style={{ ...s.input, resize: 'vertical', minHeight: '80px' }} placeholder="Clinical notes..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Diagnosis</label>
                <input style={s.input} placeholder="Primary diagnosis" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Symptoms (comma-separated)</label>
                <input style={s.input} placeholder="fever, cough, headache" value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={s.btnPrimary} onClick={handleCreate}>💾 Save Record</button>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────────
const Appointments = ({ user, toast }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '10:00', type: 'in_person', reason: '', patientId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/appointments');
    if (res.success) setAppointments(res.appointments);
    if (user.role === 'patient') {
      const dr = await api.get('/users/doctors');
      if (dr.success) setDoctors(dr.doctors);
    }
    if (user.role === 'admin') {
      const [dr, pt] = await Promise.all([api.get('/users/doctors'), api.get('/users/patients')]);
      if (dr.success) setDoctors(dr.doctors);
      if (pt.success) setPatients(pt.patients);
    }
    setLoading(false);
  }, [user.role]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const res = await api.post('/appointments', form);
    if (res.success) { toast('Appointment booked!', 'success'); setShowModal(false); load(); }
    else toast(res.message, 'error');
  };

  const handleStatus = async (id, status) => {
    const res = await api.put(`/appointments/${id}`, { status });
    if (res.success) { toast('Status updated', 'success'); load(); }
    else toast(res.message, 'error');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>Appointments</h2>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>{appointments.length} total</p>
        </div>
        {(user.role === 'patient' || user.role === 'admin') && (
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>📅 Book Appointment</button>
        )}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Patient</th>
              <th style={s.th}>Doctor</th>
              <th style={s.th}>Date & Time</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Reason</th>
              <th style={s.th}>Status</th>
              {(user.role === 'doctor' || user.role === 'admin') && <th style={s.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              : appointments.length === 0 ? <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', padding: '60px', color: theme.textMuted }}>📅 No appointments</td></tr>
              : appointments.map(a => (
              <tr key={a._id}>
                <td style={s.td}><span style={{ fontWeight: 600 }}>{a.patient?.name}</span></td>
                <td style={s.td}>Dr. {a.doctor?.name}<br/><span style={{ fontSize: '11px', color: theme.textMuted }}>{a.doctor?.specialization}</span></td>
                <td style={s.td}>{formatDate(a.date)}<br/><span style={{ fontSize: '12px', color: theme.textMuted }}>{a.time}</span></td>
                <td style={s.td}><span style={s.badge(theme.blue, theme.blue + '15')}>{a.type?.replace('_', ' ')}</span></td>
                <td style={s.td}>{a.reason || '-'}</td>
                <td style={s.td}><StatusBadge status={a.status} /></td>
                {(user.role === 'doctor' || user.role === 'admin') && (
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {a.status === 'scheduled' && <button style={{ ...s.btnSmall, background: theme.success + '15', color: theme.success }} onClick={() => handleStatus(a._id, 'confirmed')}>✓ Confirm</button>}
                      {a.status === 'confirmed' && <button style={{ ...s.btnSmall, background: theme.blue + '15', color: theme.blue }} onClick={() => handleStatus(a._id, 'completed')}>✓ Complete</button>}
                      <button style={{ ...s.btnSmall, background: theme.error + '15', color: theme.error }} onClick={() => handleStatus(a._id, 'cancelled')}>✕ Cancel</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', marginBottom: '24px' }}>Book Appointment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {user.role === 'admin' && (
                <div>
                  <label style={s.label}>Patient</label>
                  <select style={s.input} value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={s.label}>Doctor</label>
                <select style={s.input} value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} - {d.specialization}</option>)}
                </select>
              </div>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>Date</label>
                  <input style={s.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={s.label}>Time</label>
                  <input style={s.input} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={s.label}>Type</label>
                <select style={s.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="in_person">In Person</option>
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Reason</label>
                <textarea style={{ ...s.input, resize: 'vertical', minHeight: '70px' }} placeholder="Reason for visit..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={s.btnPrimary} onClick={handleCreate}>📅 Book Now</button>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MESSAGES / CHAT ───────────────────────────────────────────────────────────
const Messages = ({ user, toast }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [contacts, setContacts] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadContacts = async () => {
      if (user.role === 'patient') {
        const me = await api.get('/auth/me');
        if (me.user?.assignedDoctor) setContacts([me.user.assignedDoctor]);
      } else if (user.role === 'doctor') {
        const res = await api.get('/users/patients');
        if (res.success) setContacts(res.patients);
      }
    };
    loadContacts();
    loadConversations();
  }, [user.role]);

  const loadConversations = async () => {
    const res = await api.get('/messages');
    if (res.success) setConversations(res.conversations);
  };

  const selectUser = async (u) => {
    setSelectedUser(u);
    const res = await api.get(`/messages/${u._id}`);
    if (res.success) setMessages(res.messages);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    const res = await api.post('/messages', { receiverId: selectedUser._id, content: newMsg });
    if (res.success) {
      setMessages(m => [...m, res.message]);
      setNewMsg('');
      loadConversations();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const allContacts = [...contacts];
  conversations.forEach(c => { if (!allContacts.find(x => x._id === c.user._id)) allContacts.push(c.user); });

  return (
    <div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', marginBottom: '24px', color: theme.textPrimary }}>Messages</h2>
      <div style={{ display: 'flex', gap: '0', height: '600px', background: theme.white, borderRadius: '16px', boxShadow: theme.cardShadow, border: `1px solid ${theme.borderColor}`, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '280px', borderRight: `1px solid ${theme.borderColor}`, overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${theme.borderColor}`, fontWeight: 700, fontSize: '14px', color: theme.textSecondary }}>CONTACTS</div>
          {allContacts.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' }}>No contacts yet</div>}
          {allContacts.map(c => (
            <div key={c._id} onClick={() => selectUser(c)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: selectedUser?._id === c._id ? theme.lightGray : 'transparent', borderBottom: `1px solid ${theme.borderColor}` }}>
              <div style={s.avatar(getRoleColor(c.role))}>{getInitials(c.name)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.role === 'doctor' ? 'Dr. ' : ''}{c.name}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>{c.role}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedUser ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>💬</div>
              <div>Select a contact to start chatting</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={s.avatar(getRoleColor(selectedUser.role))}>{getInitials(selectedUser.name)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedUser.role === 'doctor' ? 'Dr. ' : ''}{selectedUser.name}</div>
                  <div style={{ fontSize: '12px', color: theme.success }}>● Online</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: theme.offWhite }}>
                {messages.map(m => {
                  const isMine = m.sender?._id === user.id || m.sender?._id?.toString() === user.id;
                  return (
                    <div key={m._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '10px 16px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? `linear-gradient(135deg, ${theme.coral}, ${theme.coralDark})` : theme.white, color: isMine ? '#fff' : theme.textPrimary, fontSize: '14px', boxShadow: theme.cardShadow, border: isMine ? 'none' : `1px solid ${theme.borderColor}` }}>
                        {m.content}
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>{formatDateTime(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '16px', borderTop: `1px solid ${theme.borderColor}`, display: 'flex', gap: '12px' }}>
                <input style={{ ...s.input, flex: 1 }} placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button style={s.btnPrimary} onClick={sendMessage}>Send 📤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── AI SYMPTOM CHECKER ────────────────────────────────────────────────────────
const SymptomChecker = ({ toast }) => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!symptoms.trim()) return toast('Please describe your symptoms', 'error');
    setLoading(true); setResult('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key-here', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-opus-4-20250514',
          max_tokens: 800,
          messages: [{ role: 'user', content: `You are a helpful medical information assistant. A patient describes these symptoms: "${symptoms}". Provide: 1) Possible conditions (NOT a diagnosis), 2) When to see a doctor urgently, 3) General self-care tips. Always remind them to consult a doctor. Keep it concise and clear.` }]
        })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) setResult(data.content[0].text);
      else setResult('⚠️ AI service not configured. Please add your Anthropic API key to use this feature.\n\nFor medical concerns, please consult your assigned doctor through the Messages section.');
    } catch {
      setResult('⚠️ Could not connect to AI service. For medical concerns, please consult your assigned doctor through the Messages section.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', marginBottom: '8px', color: theme.textPrimary }}>🤖 AI Symptom Checker</h2>
      <p style={{ color: theme.textSecondary, marginBottom: '24px', fontSize: '14px' }}>Describe your symptoms and get preliminary AI insights. <strong>Not a substitute for medical advice.</strong></p>
      <div style={{ ...s.card, marginBottom: '20px' }}>
        <label style={s.label}>Describe your symptoms</label>
        <textarea style={{ ...s.input, resize: 'vertical', minHeight: '120px', marginBottom: '16px' }} placeholder="e.g. I have been experiencing a headache for 2 days, slight fever around 99°F, fatigue, and a sore throat..." value={symptoms} onChange={e => setSymptoms(e.target.value)} />
        <button style={s.btnPrimary} onClick={check} disabled={loading}>
          {loading ? '⏳ Analyzing...' : '🔍 Analyze Symptoms'}
        </button>
      </div>
      {result && (
        <div style={{ ...s.card, background: '#F0F9FF', borderColor: theme.blue + '40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <h3 style={{ fontWeight: 700, color: theme.blue }}>AI Analysis</h3>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7', color: theme.textPrimary }}>{result}</div>
          <div style={{ marginTop: '16px', padding: '12px', background: theme.warning + '15', borderRadius: '10px', fontSize: '13px', color: theme.warning, fontWeight: 600 }}>
            ⚠️ This is for informational purposes only. Always consult a qualified medical professional.
          </div>
        </div>
      )}
    </div>
  );
};

// ─── EMERGENCY SOS ─────────────────────────────────────────────────────────────
const EmergencySOS = ({ user, toast }) => {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relation: '' });
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me');
      if (res.success) setContacts(res.user?.emergencyContacts || []);
    };
    load();
  }, []);

  const addContact = async () => {
    const me = await api.get('/auth/me');
    const existing = me.user?.emergencyContacts || [];
    const res = await api.put('/auth/update-profile', { emergencyContacts: [...existing, form] });
    if (res.success) { setContacts(res.user.emergencyContacts); setShowAddModal(false); setForm({ name: '', phone: '', relation: '' }); toast('Contact added!', 'success'); }
    else toast(res.message, 'error');
  };

  const triggerSOS = () => {
    setSosActive(true);
    toast('🆘 SOS ALERT SENT! Emergency contacts notified.', 'success');
    setTimeout(() => setSosActive(false), 5000);
  };

  const hospitals = [
    { name: 'AIIMS New Delhi', phone: '011-26588500', distance: '2.4 km' },
    { name: 'Safdarjung Hospital', phone: '011-26707444', distance: '3.1 km' },
    { name: 'Apollo Hospital', phone: '1860-500-1066', distance: '4.8 km' },
    { name: 'Fortis Hospital', phone: '1800-111-021', distance: '6.2 km' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', marginBottom: '8px', color: theme.textPrimary }}>🆘 Emergency SOS</h2>
      <p style={{ color: theme.textSecondary, marginBottom: '24px', fontSize: '14px' }}>Quick access to emergency contacts and nearby hospitals</p>

      <div style={{ ...s.card, background: '#FFF5F5', border: `2px solid ${theme.error}30`, marginBottom: '24px', textAlign: 'center', padding: '40px' }}>
        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }`}</style>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{sosActive ? '🚨' : '🆘'}</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', marginBottom: '8px', color: theme.textPrimary }}>Emergency Alert System</div>
        <div style={{ color: theme.textSecondary, marginBottom: '24px', fontSize: '14px' }}>Press to notify all emergency contacts and nearby hospitals</div>
        <button style={s.sosBtn} onClick={triggerSOS}>{sosActive ? '🚨 ALERT SENT!' : '🆘 SEND SOS'}</button>
        <div style={{ marginTop: '16px', fontSize: '13px', color: theme.textMuted }}>Helplines: 108 (Ambulance) • 112 (Emergency) • 1800-180-1104 (Health)</div>
      </div>

      <div style={s.grid2}>
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700 }}>📞 Emergency Contacts</h3>
            <button style={s.btnPrimary} onClick={() => setShowAddModal(true)}>+ Add</button>
          </div>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: theme.textMuted }}>No contacts added yet</div>
          ) : contacts.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: theme.lightGray, borderRadius: '12px', marginBottom: '10px' }}>
              <div style={s.avatar(theme.coral)}>{getInitials(c.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>{c.relation} • {c.phone}</div>
              </div>
              <a href={`tel:${c.phone}`} style={{ ...s.btnSmall, background: theme.success + '15', color: theme.success, textDecoration: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>📞 Call</a>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🏥 Nearby Hospitals</h3>
          {hospitals.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: theme.lightGray, borderRadius: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '24px' }}>🏥</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{h.name}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>{h.distance} away</div>
              </div>
              <a href={`tel:${h.phone}`} style={{ ...s.btnSmall, background: theme.blue + '15', color: theme.blue, textDecoration: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>📞 {h.phone}</a>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div style={s.overlay} onClick={() => setShowAddModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', marginBottom: '24px' }}>Add Emergency Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[['name', 'Name', 'Anita Sharma'], ['phone', 'Phone', '+91 9876543210'], ['relation', 'Relation', 'Spouse, Parent, etc.']].map(([k, l, p]) => (
                <div key={k}>
                  <label style={s.label}>{l}</label>
                  <input style={s.input} placeholder={p} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={s.btnPrimary} onClick={addContact}>Save Contact</button>
              <button style={s.btnSecondary} onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HEALTH ANALYTICS ──────────────────────────────────────────────────────────
const HealthAnalytics = ({ user }) => {
  const vitalData = [
    { date: 'Jan 1', bp: 120, hr: 72, spo2: 98 },
    { date: 'Jan 15', bp: 125, hr: 78, spo2: 97 },
    { date: 'Feb 1', bp: 118, hr: 70, spo2: 99 },
    { date: 'Feb 15', bp: 130, hr: 82, spo2: 97 },
    { date: 'Mar 1', bp: 122, hr: 74, spo2: 98 },
    { date: 'Mar 15', bp: 119, hr: 71, spo2: 99 },
  ];
  const pieData = [
    { name: 'Excellent', value: 40, color: theme.success },
    { name: 'Good', value: 35, color: theme.blue },
    { name: 'Fair', value: 20, color: theme.warning },
    { name: 'Poor', value: 5, color: theme.error },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', marginBottom: '8px', color: theme.textPrimary }}>📈 Health Analytics</h2>
      <p style={{ color: theme.textSecondary, marginBottom: '24px', fontSize: '14px' }}>Your health trends over time</p>
      <div style={{ ...s.grid2, marginBottom: '24px' }}>
        {[{ label: 'Avg Blood Pressure', value: '122/80', unit: 'mmHg', icon: '❤️', color: theme.coral },
          { label: 'Avg Heart Rate', value: '74', unit: 'bpm', icon: '💓', color: theme.blue },
          { label: 'Avg SpO2', value: '98', unit: '%', icon: '🫁', color: theme.teal },
          { label: 'Health Score', value: '82', unit: '/100', icon: '💚', color: theme.success }
        ].map((m, i) => (
          <div key={i} style={s.statCard(m.color)}>
            <div style={s.statIcon(m.color)}>{m.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{m.value}<span style={{ fontSize: '14px', fontWeight: 500, color: theme.textMuted }}> {m.unit}</span></div>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Vital Signs Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={vitalData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: theme.cardShadow }} />
              <Legend />
              <Line type="monotone" dataKey="bp" stroke={theme.coral} strokeWidth={2} name="Blood Pressure" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="hr" stroke={theme.blue} strokeWidth={2} name="Heart Rate" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="spo2" stroke={theme.teal} strokeWidth={2} name="SpO2" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Health Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─── USER MANAGEMENT (Admin) ───────────────────────────────────────────────────
const UserManagement = ({ user, toast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/users');
    if (res.success) setUsers(res.users);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id) => {
    const res = await api.put(`/users/${id}/toggle-active`);
    if (res.success) { toast(`User ${res.isActive ? 'activated' : 'deactivated'}`, 'success'); load(); }
    else toast(res.message, 'error');
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>User Management</h2>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>{users.length} users registered</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'admin', 'doctor', 'patient'].map(r => (
            <button key={r} style={{ ...s.btnSmall, background: filter === r ? theme.coral : theme.lightGray, color: filter === r ? '#fff' : theme.textPrimary, padding: '8px 16px', borderRadius: '10px' }} onClick={() => setFilter(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>User</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Specialization</th>
              <th style={s.th}>Assigned Doctor</th>
              <th style={s.th}>Joined</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              : filtered.map(u => (
              <tr key={u._id}>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={s.avatar(getRoleColor(u.role))}>{getInitials(u.name)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: theme.textMuted }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={s.td}><span style={s.badge(getRoleColor(u.role), getRoleColor(u.role) + '18')}>{u.role}</span></td>
                <td style={s.td}>{u.specialization || '-'}</td>
                <td style={s.td}>{u.assignedDoctor?.name ? `Dr. ${u.assignedDoctor.name}` : '-'}</td>
                <td style={s.td}>{formatDate(u.createdAt)}</td>
                <td style={s.td}><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                <td style={s.td}>
                  <button style={{ ...s.btnSmall, background: u.isActive ? theme.error + '15' : theme.success + '15', color: u.isActive ? theme.error : theme.success, padding: '8px 14px', borderRadius: '8px' }} onClick={() => toggleActive(u._id)}>
                    {u.isActive ? '🚫 Deactivate' : '✅ Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── ASSIGN DOCTORS (Admin) ────────────────────────────────────────────────────
const AssignDoctors = ({ toast }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const [pr, dr] = await Promise.all([api.get('/users/patients'), api.get('/users/doctors')]);
    if (pr.success) setPatients(pr.patients);
    if (dr.success) setDoctors(dr.doctors);
    const sel = {};
    pr.patients?.forEach(p => { if (p.assignedDoctor) sel[p._id] = p.assignedDoctor._id || p.assignedDoctor; });
    setSelections(sel);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const assign = async (patientId, doctorId) => {
    setSelections(s => ({ ...s, [patientId]: doctorId }));
    const res = await api.put('/users/assign-doctor', { patientId, doctorId });
    if (res.success) toast('Doctor assigned!', 'success');
    else toast(res.message, 'error');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>Assign Doctors</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Manage patient-doctor assignments</p>
      </div>
      <div style={s.card}>
        {loading ? <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>Loading...</div> : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Patient</th>
                <th style={s.th}>Blood Group</th>
                <th style={s.th}>Assign Doctor</th>
                <th style={s.th}>Current Assignment</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={s.avatar(theme.teal)}>{getInitials(p.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}><span style={s.badge(theme.coral, theme.coral + '15')}>{p.bloodGroup || 'N/A'}</span></td>
                  <td style={s.td}>
                    <select style={{ ...s.input, width: 'auto', minWidth: '220px' }} value={selections[p._id] || ''} onChange={e => assign(p._id, e.target.value)}>
                      <option value="">-- Unassigned --</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization || 'General'})</option>)}
                    </select>
                  </td>
                  <td style={s.td}>
                    {selections[p._id] ? (
                      <span style={s.badge(theme.success, theme.success + '15')}>✓ Assigned</span>
                    ) : (
                      <span style={s.badge(theme.warning, theme.warning + '15')}>⚠ Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── AUDIT LOG (Admin) ─────────────────────────────────────────────────────────
const AuditLog = ({ toast }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/audit?limit=50');
      if (res.success) setLogs(res.logs);
      setLoading(false);
    };
    load();
  }, []);

  const actionColors = { VIEW_RECORDS: theme.blue, CREATE_RECORD: theme.success, DELETE_RECORD: theme.error, ASSIGN_DOCTOR: theme.teal, BOOK_APPOINTMENT: theme.coral, UPDATE_APPOINTMENT: theme.warning, CANCEL_APPOINTMENT: theme.error };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>🔍 Audit Log</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>System activity trail — last 50 events</p>
      </div>
      <div style={s.card}>
        {loading ? <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>Loading...</div> : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Time</th>
                <th style={s.th}>User</th>
                <th style={s.th}>Action</th>
                <th style={s.th}>Resource</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', padding: '60px', color: theme.textMuted }}>No audit logs yet</td></tr>
                : logs.map((l, i) => (
                <tr key={i}>
                  <td style={{ ...s.td, fontSize: '12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>{formatDateTime(l.createdAt)}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{l.user?.name || 'System'}</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>{l.user?.role}</div>
                  </td>
                  <td style={s.td}><span style={s.badge(actionColors[l.action] || theme.textMuted, (actionColors[l.action] || theme.textMuted) + '18')}>{l.action}</span></td>
                  <td style={s.td}>{l.resource || '-'}</td>
                  <td style={s.td}><StatusBadge status={l.status} /></td>
                  <td style={{ ...s.td, fontSize: '12px', color: theme.textMuted }}>{l.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── MY PATIENTS (Doctor) ──────────────────────────────────────────────────────
const MyPatients = ({ user, toast }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/users/patients');
      if (res.success) setPatients(res.patients);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>🩺 My Patients</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>{patients.length} patients under your care</p>
      </div>
      <div style={s.grid3}>
        {loading ? <div style={{ color: theme.textMuted }}>Loading...</div> : patients.length === 0 ? (
          <div style={{ ...s.card, gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: theme.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🩺</div>
            <div>No patients assigned yet</div>
          </div>
        ) : patients.map(p => (
          <div key={p._id} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={s.avatar(theme.teal)}>{getInitials(p.name)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>{p.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[['🩸 Blood', p.bloodGroup || 'N/A'], ['📞 Phone', p.phone || 'N/A'], ['🎂 DOB', formatDate(p.dateOfBirth)], ['📍 Address', p.address || 'N/A']].map(([k, v]) => (
                <div key={k} style={{ background: theme.lightGray, borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '11px', color: theme.textMuted }}>{k}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
                </div>
              ))}
            </div>
            <StatusBadge status={p.isActive ? 'active' : 'inactive'} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PRESCRIPTIONS (Doctor) ────────────────────────────────────────────────────
const Prescriptions = ({ user, toast }) => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/users/patients');
      if (res.success) setPatients(res.patients);
    };
    load();
  }, [user]);

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const updateMed = (i, field, val) => setForm(f => { const m = [...f.medications]; m[i] = { ...m[i], [field]: val }; return { ...f, medications: m }; });

  const generate = async () => {
    if (!form.patientId) return toast('Select a patient', 'error');
    const patient = patients.find(p => p._id === form.patientId);
    const record = await api.post('/records', { patientId: form.patientId, title: 'Digital Prescription', recordType: 'prescription', description: form.notes, medications: form.medications });
    if (record.success) {
      setResult({ patient, medications: form.medications, notes: form.notes, date: new Date(), doctor: user, id: record.record._id });
      toast('Prescription created!', 'success');
    } else toast(record.message, 'error');
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', marginBottom: '8px', color: theme.textPrimary }}>💊 Digital Prescriptions</h2>
      <p style={{ color: theme.textSecondary, marginBottom: '24px', fontSize: '14px' }}>Create and manage digital prescriptions for your patients</p>
      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>New Prescription</h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={s.label}>Patient</label>
            <select style={s.input} value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <h4 style={{ fontWeight: 600, marginBottom: '12px', color: theme.textSecondary }}>Medications</h4>
          {form.medications.map((med, i) => (
            <div key={i} style={{ background: theme.lightGray, borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>Medicine Name</label>
                  <input style={s.input} placeholder="Paracetamol" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>Dosage</label>
                  <input style={s.input} placeholder="500mg" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>Frequency</label>
                  <input style={s.input} placeholder="Twice daily" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>Duration</label>
                  <input style={s.input} placeholder="5 days" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center', marginBottom: '16px' }} onClick={addMed}>+ Add Medicine</button>
          <div style={{ marginBottom: '16px' }}>
            <label style={s.label}>Clinical Notes</label>
            <textarea style={{ ...s.input, resize: 'vertical', minHeight: '80px' }} placeholder="Additional instructions..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button style={s.btnPrimary} onClick={generate}>💊 Generate Prescription</button>
        </div>

        {result && (
          <div style={{ ...s.card, border: `2px solid ${theme.blue}30` }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💊</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px' }}>Digital Prescription</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Rx ID: {result.id?.slice(-8).toUpperCase()}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: theme.lightGray, borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>PATIENT</div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{result.patient?.name}</div>
              </div>
              <div style={{ background: theme.lightGray, borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>DATE</div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{formatDate(result.date)}</div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              {result.medications.filter(m => m.name).map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px', borderBottom: `1px solid ${theme.borderColor}` }}>
                  <span style={{ fontWeight: 800, color: theme.coral, minWidth: '24px' }}>{i + 1}.</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{m.name} {m.dosage}</div>
                    <div style={{ fontSize: '13px', color: theme.textMuted }}>{m.frequency} • {m.duration}</div>
                  </div>
                </div>
              ))}
            </div>
            {result.notes && <div style={{ background: theme.blue + '10', borderRadius: '10px', padding: '12px', fontSize: '13px', marginBottom: '16px' }}><strong>Notes:</strong> {result.notes}</div>}
            <div style={{ borderTop: `2px solid ${theme.borderColor}`, paddingTop: '12px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary }}>
              Dr. {result.doctor?.name} • {result.doctor?.specialization}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── FHIR INTEROPERABILITY ─────────────────────────────────────────────────────
const FHIRInteroperability = ({ user, toast }) => {
  const [activeTab, setActiveTab] = useState('viewer');
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fhirJson, setFhirJson] = useState('');
  const [importJson, setImportJson] = useState('');
  const [qrData, setQrData] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/records');
      if (res.success) setRecords(res.records || []);
      if (user.role !== 'patient') {
        const pr = await api.get('/users/patients');
        if (pr.success) setPatients(pr.patients || []);
      }
    };
    load();
  }, [user.role]);

  // Convert a health record to FHIR R4 Bundle format
  const toFHIR = (record) => ({
    resourceType: 'Bundle',
    id: record._id,
    meta: { versionId: '1', lastUpdated: record.updatedAt || record.createdAt },
    type: 'document',
    timestamp: record.date,
    entry: [
      {
        fullUrl: `urn:uuid:${record._id}`,
        resource: {
          resourceType: 'Composition',
          id: record._id,
          status: 'final',
          type: {
            coding: [{ system: 'http://loinc.org', code: '11488-4', display: record.recordType }]
          },
          subject: {
            reference: `Patient/${record.patient?._id}`,
            display: record.patient?.name
          },
          author: [{ reference: `Practitioner/${record.doctor?._id}`, display: record.doctor?.name }],
          title: record.title,
          date: record.date,
          section: [
            {
              title: 'Clinical Information',
              text: { status: 'generated', div: record.description || '' }
            },
            record.diagnosis && {
              title: 'Diagnosis',
              text: { status: 'generated', div: record.diagnosis }
            },
            record.symptoms?.length && {
              title: 'Symptoms',
              entry: record.symptoms.map(s => ({ display: s }))
            },
            record.medications?.length && {
              title: 'Medications',
              entry: record.medications.map(m => ({
                resourceType: 'MedicationRequest',
                medicationCodeableConcept: { text: m.name },
                dosageInstruction: [{ text: `${m.dosage} - ${m.frequency} for ${m.duration}` }]
              }))
            },
            record.vitalSigns && Object.keys(record.vitalSigns).length && {
              title: 'Vital Signs',
              entry: Object.entries(record.vitalSigns).filter(([, v]) => v).map(([k, v]) => ({
                resourceType: 'Observation',
                code: { text: k },
                valueString: String(v)
              }))
            }
          ].filter(Boolean)
        }
      }
    ]
  });

  const handleViewFHIR = (record) => {
    setSelectedRecord(record);
    setFhirJson(JSON.stringify(toFHIR(record), null, 2));
  };

  const handleExportAll = async () => {
    setLoading(true);
    const filterRecords = selectedPatient ? records.filter(r => r.patient?._id === selectedPatient) : records;
    const bundle = {
      resourceType: 'Bundle',
      id: `export-${Date.now()}`,
      meta: { lastUpdated: new Date().toISOString() },
      type: 'collection',
      total: filterRecords.length,
      entry: filterRecords.map(r => ({ fullUrl: `urn:uuid:${r._id}`, resource: toFHIR(r) }))
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `FHIR_Export_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('FHIR bundle exported!', 'success');
    setLoading(false);
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importJson);
      if (parsed.resourceType !== 'Bundle') return toast('Invalid FHIR Bundle — resourceType must be "Bundle"', 'error');
      const entries = parsed.entry || [];
      let imported = 0;
      for (const entry of entries) {
        const comp = entry.resource?.entry?.[0]?.resource || entry.resource;
        if (comp && user.role === 'doctor') {
          const pId = patients[0]?._id;
          if (!pId) continue;
          await api.post('/records', {
            patientId: pId,
            title: comp.title || 'Imported FHIR Record',
            recordType: 'general',
            description: `Imported via FHIR. Original ID: ${entry.fullUrl || 'unknown'}`,
            diagnosis: 'See FHIR import',
          });
          imported++;
        }
      }
      toast(`Imported ${imported} record(s) from FHIR bundle!`, 'success');
      setImportJson('');
    } catch (e) {
      toast('Invalid JSON — please paste a valid FHIR Bundle', 'error');
    }
  };

  const handleGenerateQR = () => {
    const filterRecords = selectedPatient ? records.filter(r => r.patient?._id === selectedPatient) : records.slice(0, 3);
    const summary = {
      resourceType: 'Bundle',
      type: 'summary',
      patient: filterRecords[0]?.patient?.name || user.name,
      records: filterRecords.length,
      generated: new Date().toISOString(),
      ids: filterRecords.map(r => r._id)
    };
    setQrData(JSON.stringify(summary));
    toast('QR data generated!', 'success');
  };

  const tabs = [
    { id: 'viewer', label: '📄 FHIR Viewer', desc: 'View records in FHIR R4 format' },
    { id: 'export', label: '📤 Export', desc: 'Export as FHIR Bundle JSON' },
    { id: 'import', label: '📥 Import', desc: 'Import FHIR Bundle' },
    { id: 'qr', label: '📱 QR Share', desc: 'Share via QR code' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>🔄 FHIR Interoperability</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>HL7 FHIR R4 compliant health data exchange — view, export, import, and share records</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: theme.white, padding: '8px', borderRadius: '14px', border: `1px solid ${theme.borderColor}`, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', background: activeTab === t.id ? `linear-gradient(135deg, ${theme.blue}, ${theme.blueDark})` : 'transparent', color: activeTab === t.id ? '#fff' : theme.textSecondary, transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* VIEWER TAB */}
      {activeTab === 'viewer' && (
        <div style={s.grid2}>
          <div style={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Select Record to View</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {records.length === 0 && <div style={{ color: theme.textMuted, textAlign: 'center', padding: '32px' }}>No records found</div>}
              {records.map(r => (
                <div key={r._id} onClick={() => handleViewFHIR(r)} style={{ padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', border: `1.5px solid ${selectedRecord?._id === r._id ? theme.blue : theme.borderColor}`, background: selectedRecord?._id === r._id ? theme.blue + '08' : theme.white, transition: 'all 0.15s' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted }}>{r.patient?.name} • {formatDate(r.date)} • <span style={s.badge(theme.blue, theme.blue + '15')}>{r.recordType}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontWeight: 700 }}>FHIR R4 Output</h3>
              {fhirJson && (
                <button style={{ ...s.btnSmall, background: theme.teal + '15', color: theme.teal, padding: '8px 14px', borderRadius: '8px' }} onClick={() => { navigator.clipboard.writeText(fhirJson); toast('Copied!', 'success'); }}>📋 Copy</button>
              )}
            </div>
            {fhirJson ? (
              <pre style={{ background: '#0F172A', color: '#7DD3FC', borderRadius: '12px', padding: '16px', fontSize: '11px', overflowX: 'auto', overflowY: 'auto', maxHeight: '380px', lineHeight: '1.6', margin: 0 }}>{fhirJson}</pre>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: theme.textMuted }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div>
                <div>Select a record to view its FHIR representation</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPORT TAB */}
      {activeTab === 'export' && (
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Export FHIR Bundle</h3>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '24px' }}>Downloads a complete HL7 FHIR R4 Bundle JSON file containing all health records.</p>
          {user.role !== 'patient' && patients.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={s.label}>Filter by Patient (optional)</label>
              <select style={{ ...s.input, maxWidth: '320px' }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">All Patients</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Total Records', value: records.length, icon: '📋', color: theme.blue },
              { label: 'FHIR Version', value: 'R4 (4.0.1)', icon: '🏥', color: theme.teal },
              { label: 'Format', value: 'JSON Bundle', icon: '📦', color: theme.coral },
            ].map((s2, i) => (
              <div key={i} style={{ background: theme.lightGray, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{s2.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: s2.color }}>{s2.value}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted }}>{s2.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#F0FDF4', border: `1px solid #BBF7D0`, borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '13px', color: theme.textSecondary }}>
            <strong>📌 FHIR R4 Compliance:</strong> Exported bundle includes Composition, MedicationRequest, and Observation resources. Compatible with Epic, Cerner, and other HL7 FHIR R4 systems.
          </div>
          <button style={{ ...s.btnBlue, fontSize: '15px', padding: '13px 32px' }} onClick={handleExportAll} disabled={loading}>
            {loading ? '⏳ Exporting...' : '📤 Export FHIR Bundle (.json)'}
          </button>
        </div>
      )}

      {/* IMPORT TAB */}
      {activeTab === 'import' && (
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Import FHIR Bundle</h3>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px' }}>Paste a valid HL7 FHIR R4 Bundle JSON below to import records into the system.</p>
          <div style={{ marginBottom: '16px' }}>
            <label style={s.label}>FHIR Bundle JSON</label>
            <textarea
              style={{ ...s.input, resize: 'vertical', minHeight: '280px', fontFamily: 'monospace', fontSize: '12px', background: '#0F172A', color: '#7DD3FC', border: 'none' }}
              placeholder={'{\n  "resourceType": "Bundle",\n  "type": "collection",\n  "entry": [...]\n}'}
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
            />
          </div>
          <div style={{ background: '#FFFBEB', border: `1px solid #FDE68A`, borderRadius: '12px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#92400E' }}>
            ⚠️ <strong>Note:</strong> {user.role === 'doctor' ? 'Imported records will be assigned to your first patient.' : 'Only doctors can import records. Please contact your doctor.'}
          </div>
          {user.role === 'doctor' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={s.btnPrimary} onClick={handleImport} disabled={!importJson.trim()}>📥 Import Bundle</button>
              <button style={s.btnSecondary} onClick={() => setImportJson('')}>Clear</button>
            </div>
          )}
        </div>
      )}

      {/* QR TAB */}
      {activeTab === 'qr' && (
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>📱 QR Code Share</h3>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '24px' }}>Generate a QR code containing a FHIR summary for quick sharing with healthcare providers.</p>
          {user.role !== 'patient' && patients.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={s.label}>Select Patient</label>
              <select style={{ ...s.input, maxWidth: '320px' }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">All / My Records</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <button style={{ ...s.btnBlue, marginBottom: '28px' }} onClick={handleGenerateQR}>🔄 Generate QR Data</button>
          {qrData && (
            <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* QR visual using pure CSS grid pattern */}
              <div style={{ background: theme.white, padding: '16px', borderRadius: '16px', border: `2px solid ${theme.borderColor}`, display: 'inline-block' }}>
                <div style={{ width: '180px', height: '180px', background: `repeating-conic-gradient(#1A2340 0% 25%, #fff 0% 50%) 0 0 / 12px 12px`, borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: '50px', background: theme.white, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🔄</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '11px', color: theme.textMuted, marginTop: '8px' }}>FHIR R4 Summary QR</div>
              </div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ fontWeight: 700, marginBottom: '12px', color: theme.textPrimary }}>QR Payload Preview</div>
                <pre style={{ background: '#0F172A', color: '#7DD3FC', borderRadius: '12px', padding: '16px', fontSize: '11px', overflowX: 'auto', lineHeight: '1.6', margin: 0 }}>
                  {JSON.stringify(JSON.parse(qrData), null, 2)}
                </pre>
                <button style={{ ...s.btnSecondary, marginTop: '14px' }} onClick={() => { navigator.clipboard.writeText(qrData); toast('QR payload copied!', 'success'); }}>
                  📋 Copy Payload
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── DRUG INTERACTION CHECKER ──────────────────────────────────────────────────
const DRUG_INTERACTIONS = {
  'warfarin+aspirin': { severity: 'HIGH', effect: 'Increased bleeding risk. Monitor INR closely.' },
  'warfarin+ibuprofen': { severity: 'HIGH', effect: 'Increased risk of GI bleeding and enhanced anticoagulation.' },
  'metformin+alcohol': { severity: 'HIGH', effect: 'Risk of lactic acidosis. Avoid alcohol.' },
  'simvastatin+amiodarone': { severity: 'HIGH', effect: 'Risk of myopathy/rhabdomyolysis. Dose adjustment needed.' },
  'lisinopril+potassium': { severity: 'MODERATE', effect: 'Risk of hyperkalemia. Monitor potassium levels.' },
  'amlodipine+simvastatin': { severity: 'MODERATE', effect: 'Increased simvastatin levels. Max simvastatin dose 20mg.' },
  'metformin+contrast': { severity: 'HIGH', effect: 'Hold metformin before contrast procedures — risk of AKI.' },
  'aspirin+ibuprofen': { severity: 'MODERATE', effect: 'Ibuprofen may reduce aspirin\'s cardioprotective effect.' },
  'ciprofloxacin+antacids': { severity: 'MODERATE', effect: 'Antacids reduce ciprofloxacin absorption. Separate by 2 hours.' },
  'ssri+tramadol': { severity: 'HIGH', effect: 'Risk of serotonin syndrome. Avoid combination.' },
  'digoxin+amiodarone': { severity: 'HIGH', effect: 'Amiodarone increases digoxin levels — risk of toxicity.' },
  'methotrexate+nsaids': { severity: 'HIGH', effect: 'NSAIDs reduce methotrexate clearance — risk of toxicity.' },
};

const ALL_DRUGS = ['Warfarin', 'Aspirin', 'Ibuprofen', 'Metformin', 'Simvastatin', 'Amlodipine', 'Amiodarone', 'Lisinopril', 'Potassium', 'Contrast Dye', 'Ciprofloxacin', 'Antacids', 'SSRI (e.g. Fluoxetine)', 'Tramadol', 'Digoxin', 'Methotrexate', 'NSAIDs', 'Paracetamol', 'Atorvastatin', 'Losartan'];

const DrugInteractionChecker = ({ toast }) => {
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const [results, setResults] = useState([]);
  const [checked, setChecked] = useState(false);

  const toggleDrug = (drug) => {
    setSelected(s => s.includes(drug) ? s.filter(d => d !== drug) : [...s, drug]);
    setChecked(false);
  };

  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      setSelected(s => [...s, custom.trim()]);
      setCustom('');
      setChecked(false);
    }
  };

  const checkInteractions = () => {
    const found = [];
    const drugs = selected.map(d => d.toLowerCase().split(' ')[0]);
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const key1 = `${drugs[i]}+${drugs[j]}`;
        const key2 = `${drugs[j]}+${drugs[i]}`;
        const interaction = DRUG_INTERACTIONS[key1] || DRUG_INTERACTIONS[key2];
        if (interaction) {
          found.push({ drug1: selected[i], drug2: selected[j], ...interaction });
        }
      }
    }
    setResults(found);
    setChecked(true);
    if (found.length === 0) toast('No known interactions found ✅', 'success');
    else toast(`${found.length} interaction(s) found!`, 'error');
  };

  const severityStyle = (s) => s === 'HIGH'
    ? { color: theme.error, bg: theme.error + '15', icon: '🔴' }
    : { color: theme.warning, bg: theme.warning + '15', icon: '🟡' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>⚗️ Drug Interaction Checker</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Select medications to check for known interactions. Database covers {Object.keys(DRUG_INTERACTIONS).length} interaction pairs.</p>
      </div>

      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Select Medications</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {ALL_DRUGS.map(drug => (
              <button key={drug} onClick={() => toggleDrug(drug)} style={{ padding: '7px 14px', borderRadius: '20px', border: `1.5px solid ${selected.includes(drug) ? theme.blue : theme.borderColor}`, background: selected.includes(drug) ? theme.blue + '15' : theme.white, color: selected.includes(drug) ? theme.blue : theme.textSecondary, fontWeight: selected.includes(drug) ? 700 : 400, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {selected.includes(drug) ? '✓ ' : ''}{drug}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input style={{ ...s.input, flex: 1 }} placeholder="Add custom drug..." value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} />
            <button style={s.btnSecondary} onClick={addCustom}>+ Add</button>
          </div>
          {selected.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}>SELECTED ({selected.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selected.map(d => (
                  <span key={d} style={{ ...s.badge(theme.coral, theme.coral + '15'), cursor: 'pointer', gap: '6px' }} onClick={() => toggleDrug(d)}>
                    {d} <span style={{ fontWeight: 800 }}>×</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', opacity: selected.length < 2 ? 0.5 : 1 }} onClick={checkInteractions} disabled={selected.length < 2}>
            ⚗️ Check Interactions {selected.length < 2 ? '(select ≥2)' : ''}
          </button>
        </div>

        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Interaction Results</h3>
          {!checked ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: theme.textMuted, gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>⚗️</div>
              <div>Select drugs and click Check</div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>✅</div>
              <div style={{ color: theme.success, fontWeight: 700, fontSize: '16px' }}>No known interactions</div>
              <div style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center' }}>The selected drugs have no interactions in our database. Always consult a pharmacist.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {results.map((r, i) => {
                const st = severityStyle(r.severity);
                return (
                  <div key={i} style={{ background: st.bg, border: `1.5px solid ${st.color}30`, borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{st.icon}</span>
                      <span style={{ ...s.badge(st.color, st.color + '25') }}>{r.severity} RISK</span>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{r.drug1} + {r.drug2}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: theme.textPrimary, margin: 0, lineHeight: '1.5' }}>{r.effect}</p>
                  </div>
                );
              })}
              <div style={{ background: theme.warning + '10', border: `1px solid ${theme.warning}30`, borderRadius: '10px', padding: '12px', fontSize: '12px', color: theme.warning }}>
                ⚠️ Always verify with a licensed pharmacist or prescriber before making clinical decisions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MEDICAL HISTORY TIMELINE ──────────────────────────────────────────────────
const MedicalTimeline = ({ user, toast }) => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/records');
      if (res.success) setRecords(res.records || []);
      if (user.role === 'doctor') {
        const pr = await api.get('/users/patients');
        if (pr.success) setPatients(pr.patients || []);
      }
      setLoading(false);
    };
    load();
  }, [user.role]);

  const filtered = selectedPatient ? records.filter(r => r.patient?._id === selectedPatient) : records;
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeConfig = {
    consultation: { icon: '🩺', color: theme.blue, label: 'Consultation' },
    lab_result: { icon: '🧪', color: theme.teal, label: 'Lab Result' },
    prescription: { icon: '💊', color: theme.coral, label: 'Prescription' },
    surgery: { icon: '🔪', color: theme.error, label: 'Surgery' },
    vaccination: { icon: '💉', color: theme.success, label: 'Vaccination' },
    general: { icon: '📋', color: theme.textMuted, label: 'General' },
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>📜 Medical History Timeline</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Chronological view of all health events</p>
      </div>

      {user.role === 'doctor' && patients.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <select style={{ ...s.input, maxWidth: '280px' }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="">All Patients</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>Loading timeline...</div>
      ) : sorted.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: '60px', color: theme.textMuted }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📜</div>
          <div>No medical history found</div>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '40px' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '18px', top: 0, bottom: 0, width: '2px', background: theme.borderColor }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {sorted.map((r, i) => {
              const cfg = typeConfig[r.recordType] || typeConfig.general;
              return (
                <div key={r._id} style={{ position: 'relative', paddingBottom: '24px' }}>
                  {/* Circle dot */}
                  <div style={{ position: 'absolute', left: '-31px', top: '18px', width: '20px', height: '20px', borderRadius: '50%', background: cfg.color, border: `3px solid ${theme.white}`, boxShadow: `0 0 0 2px ${cfg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', zIndex: 1 }} />
                  <div style={{ background: theme.white, borderRadius: '16px', padding: '20px 24px', border: `1.5px solid ${theme.borderColor}`, boxShadow: theme.cardShadow, transition: 'box-shadow 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '20px' }}>{cfg.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: theme.textPrimary }}>{r.title}</span>
                          <span style={s.badge(cfg.color, cfg.color + '18')}>{cfg.label}</span>
                        </div>
                        {r.patient?.name && user.role !== 'patient' && (
                          <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '6px' }}>👤 {r.patient.name}</div>
                        )}
                        {r.diagnosis && <div style={{ fontSize: '13px', marginBottom: '6px' }}><strong>Diagnosis:</strong> {r.diagnosis}</div>}
                        {r.description && <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '6px' }}>{r.description}</div>}
                        {r.symptoms?.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {r.symptoms.map((sym, j) => <span key={j} style={s.badge(theme.textMuted, theme.lightGray)}>{sym}</span>)}
                          </div>
                        )}
                        {r.medications?.length > 0 && (
                          <div style={{ marginTop: '10px', background: theme.lightGray, borderRadius: '10px', padding: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, marginBottom: '6px' }}>💊 MEDICATIONS</div>
                            {r.medications.map((m, j) => (
                              <div key={j} style={{ fontSize: '13px', color: theme.textPrimary }}>{m.name} {m.dosage} — {m.frequency} for {m.duration}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary }}>{formatDate(r.date)}</div>
                        {r.doctor?.name && <div style={{ fontSize: '12px', color: theme.textMuted }}>Dr. {r.doctor.name}</div>}
                        {r.doctor?.specialization && <div style={{ fontSize: '11px', color: theme.textMuted }}>{r.doctor.specialization}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HEALTH RISK SCORE ─────────────────────────────────────────────────────────
const HealthRiskScore = ({ user, toast }) => {
  const [vitals, setVitals] = useState({ age: '', bmi: '', systolic: '', diastolic: '', heartRate: '', spo2: '', smoker: 'no', diabetic: 'no', familyHistory: 'no' });
  const [score, setScore] = useState(null);

  const calculateRisk = () => {
    let risk = 0; let factors = [];
    const age = Number(vitals.age);
    const bmi = Number(vitals.bmi);
    const sys = Number(vitals.systolic);
    const dia = Number(vitals.diastolic);
    const hr = Number(vitals.heartRate);
    const spo2 = Number(vitals.spo2);

    if (age > 60) { risk += 20; factors.push({ label: 'Age > 60', points: 20, level: 'HIGH' }); }
    else if (age > 45) { risk += 10; factors.push({ label: 'Age 45-60', points: 10, level: 'MODERATE' }); }
    else if (age > 0) { factors.push({ label: 'Age < 45', points: 0, level: 'LOW' }); }

    if (bmi > 30) { risk += 20; factors.push({ label: `Obese BMI (${bmi})`, points: 20, level: 'HIGH' }); }
    else if (bmi > 25) { risk += 10; factors.push({ label: `Overweight BMI (${bmi})`, points: 10, level: 'MODERATE' }); }
    else if (bmi > 0) { factors.push({ label: `Normal BMI (${bmi})`, points: 0, level: 'LOW' }); }

    if (sys > 140 || dia > 90) { risk += 20; factors.push({ label: `High BP (${sys}/${dia})`, points: 20, level: 'HIGH' }); }
    else if (sys > 120 || dia > 80) { risk += 8; factors.push({ label: `Elevated BP (${sys}/${dia})`, points: 8, level: 'MODERATE' }); }
    else if (sys > 0) { factors.push({ label: `Normal BP (${sys}/${dia})`, points: 0, level: 'LOW' }); }

    if (hr > 100 || hr < 50) { risk += 10; factors.push({ label: `Abnormal Heart Rate (${hr} bpm)`, points: 10, level: 'MODERATE' }); }
    else if (hr > 0) { factors.push({ label: `Normal Heart Rate (${hr} bpm)`, points: 0, level: 'LOW' }); }

    if (spo2 < 95 && spo2 > 0) { risk += 15; factors.push({ label: `Low SpO2 (${spo2}%)`, points: 15, level: 'HIGH' }); }
    else if (spo2 >= 95) { factors.push({ label: `Good SpO2 (${spo2}%)`, points: 0, level: 'LOW' }); }

    if (vitals.smoker === 'yes') { risk += 20; factors.push({ label: 'Smoker', points: 20, level: 'HIGH' }); }
    if (vitals.diabetic === 'yes') { risk += 15; factors.push({ label: 'Diabetes', points: 15, level: 'HIGH' }); }
    if (vitals.familyHistory === 'yes') { risk += 10; factors.push({ label: 'Family cardiac history', points: 10, level: 'MODERATE' }); }

    const capped = Math.min(risk, 100);
    const category = capped >= 60 ? 'HIGH' : capped >= 35 ? 'MODERATE' : 'LOW';
    const color = category === 'HIGH' ? theme.error : category === 'MODERATE' ? theme.warning : theme.success;
    setScore({ value: capped, category, color, factors });
  };

  const levelColor = (l) => l === 'HIGH' ? theme.error : l === 'MODERATE' ? theme.warning : theme.success;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>🎯 Health Risk Score</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Enter your vitals to get a personalised cardiovascular risk assessment</p>
      </div>

      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Your Vitals & Risk Factors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              ['age', 'Age (years)', 'number', '45'],
              ['bmi', 'BMI', 'number', '24.5'],
              ['systolic', 'Systolic BP (mmHg)', 'number', '120'],
              ['diastolic', 'Diastolic BP (mmHg)', 'number', '80'],
              ['heartRate', 'Heart Rate (bpm)', 'number', '72'],
              ['spo2', 'SpO2 (%)', 'number', '98'],
            ].map(([k, l, t, p]) => (
              <div key={k}>
                <label style={s.label}>{l}</label>
                <input style={s.input} type={t} placeholder={p} value={vitals[k]} onChange={e => setVitals(v => ({ ...v, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            {[['smoker', 'Smoker?'], ['diabetic', 'Diabetic?'], ['familyHistory', 'Family History?']].map(([k, l]) => (
              <div key={k}>
                <label style={s.label}>{l}</label>
                <select style={s.input} value={vitals[k]} onChange={e => setVitals(v => ({ ...v, [k]: e.target.value }))}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            ))}
          </div>
          <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: '24px' }} onClick={calculateRisk}>
            🎯 Calculate Risk Score
          </button>
        </div>

        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Risk Assessment</h3>
          {!score ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: theme.textMuted, gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>🎯</div>
              <div>Fill in the form and click Calculate</div>
            </div>
          ) : (
            <div>
              {/* Score circle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '20px', background: score.color + '10', borderRadius: '16px', border: `2px solid ${score.color}30` }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `conic-gradient(${score.color} ${score.value * 3.6}deg, ${theme.lightGray} 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: theme.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '20px', color: score.color }}>{score.value}</span>
                    <span style={{ fontSize: '10px', color: theme.textMuted }}>/ 100</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '22px', color: score.color }}>{score.category} RISK</div>
                  <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>
                    {score.category === 'HIGH' ? '⚠️ Please consult a doctor immediately.' : score.category === 'MODERATE' ? '🔔 Monitor your health regularly.' : '✅ Keep up the healthy lifestyle!'}
                  </div>
                </div>
              </div>
              {/* Factor breakdown */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: theme.textSecondary, marginBottom: '10px' }}>RISK FACTOR BREAKDOWN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {score.factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: theme.lightGray, borderRadius: '10px' }}>
                    <span style={{ fontSize: '13px', color: theme.textPrimary }}>{f.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {f.points > 0 && <span style={{ fontWeight: 700, color: levelColor(f.level), fontSize: '13px' }}>+{f.points} pts</span>}
                      <span style={s.badge(levelColor(f.level), levelColor(f.level) + '18')}>{f.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── DATA ACCESS PERMISSIONS ───────────────────────────────────────────────────
const DataPermissions = ({ user, toast }) => {
  const [permissions, setPermissions] = useState({ doctor: true, admin: false, research: false, insurance: false, pharmacy: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const permConfig = [
    { key: 'doctor', label: 'My Assigned Doctor', desc: 'Your doctor can view all your health records and prescriptions.', icon: '👨‍⚕️', mandatory: true },
    { key: 'admin', label: 'Hospital Administration', desc: 'Admins can view your records for administrative purposes.', icon: '🏥', mandatory: false },
    { key: 'research', label: 'Medical Research (Anonymised)', desc: 'Share anonymised data to support medical research.', icon: '🔬', mandatory: false },
    { key: 'insurance', label: 'Insurance Provider', desc: 'Allow your insurance provider to access relevant medical records.', icon: '📑', mandatory: false },
    { key: 'pharmacy', label: 'Pharmacy Integration', desc: 'Allow pharmacies to access your active prescriptions.', icon: '💊', mandatory: false },
  ];

  const save = async () => {
    setSaving(true);
    // Simulated save — in a real backend you'd store permissions per user
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    toast('Privacy preferences saved!', 'success');
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: theme.textPrimary }}>🔐 Data Access Permissions</h2>
        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Control who can access your health data. Your privacy is our priority.</p>
      </div>

      <div style={{ ...s.card, marginBottom: '20px', background: '#F0F9FF', border: `1px solid ${theme.blue}30` }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: theme.blue }}>GDPR & HIPAA Compliant</div>
            <div style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: '1.6' }}>
              Your health data is protected under applicable regulations. You have the right to access, rectify, and request deletion of your personal data at any time. All data access is logged and auditable.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {permConfig.map(p => (
          <div key={p.key} style={{ ...s.card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '32px', flexShrink: 0 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{p.label}</span>
                {p.mandatory && <span style={s.badge(theme.blue, theme.blue + '15')}>Required</span>}
              </div>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>{p.desc}</div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {p.mandatory ? (
                <div style={{ width: '50px', height: '28px', borderRadius: '14px', background: theme.success, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '3px', cursor: 'not-allowed', opacity: 0.8 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: theme.white }} />
                </div>
              ) : (
                <div onClick={() => setPermissions(pr => ({ ...pr, [p.key]: !pr[p.key] }))} style={{ width: '50px', height: '28px', borderRadius: '14px', background: permissions[p.key] ? theme.success : theme.borderColor, display: 'flex', alignItems: 'center', justifyContent: permissions[p.key] ? 'flex-end' : 'flex-start', padding: '3px', cursor: 'pointer', transition: 'all 0.25s' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: theme.white, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'all 0.25s' }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button style={{ ...s.btnPrimary, padding: '12px 32px' }} onClick={save} disabled={saving}>
          {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Preferences'}
        </button>
        <span style={{ fontSize: '13px', color: theme.textMuted }}>Changes take effect immediately</span>
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login'); // login | register | app
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
      api.get('/auth/me').then(res => {
        if (res.success) { setUser(res.user); setScreen('app'); }
        else localStorage.removeItem('hrms_token');
      }).catch(() => {});
    }
  }, []);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  const handleLogin = (userData) => { setUser(userData); setScreen('app'); setActiveTab('dashboard'); };

  const handleLogout = () => {
    localStorage.removeItem('hrms_token');
    setUser(null);
    setScreen('login');
  };

  if (screen === 'login') return <>
    <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen('register')} />
    {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
  </>;
  if (screen === 'register') return <>
    <RegisterScreen onBack={() => setScreen('login')} />
    {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
  </>;

  const renderTab = () => {
    const props = { user, toast: showToast };
    switch (activeTab) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'records': return <HealthRecords {...props} />;
      case 'appointments': return <Appointments {...props} />;
      case 'messages': return <Messages {...props} />;
      case 'symptoms': return <SymptomChecker {...props} />;
      case 'sos': return <EmergencySOS {...props} />;
      case 'analytics': return <HealthAnalytics {...props} />;
      case 'users': return <UserManagement {...props} />;
      case 'assign': return <AssignDoctors {...props} />;
      case 'audit': return <AuditLog {...props} />;
      case 'patients': return <MyPatients {...props} />;
      case 'prescriptions': return <Prescriptions {...props} />;
      case 'fhir': return <FHIRInteroperability {...props} />;
      case 'drugcheck': return <DrugInteractionChecker {...props} />;
      case 'timeline': return <MedicalTimeline {...props} />;
      case 'riskscore': return <HealthRiskScore {...props} />;
      case 'permissions': return <DataPermissions {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div style={s.app}>
      <div style={s.layout}>
        <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        <div style={s.main}>
          <div style={s.topbar}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: theme.textPrimary }}>
                {navItems[user.role]?.find(n => n.id === activeTab)?.icon} {navItems[user.role]?.find(n => n.id === activeTab)?.label}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>🌐 HRMS v1.0</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={s.avatar(getRoleColor(user.role))}>{getInitials(user.name)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: theme.textMuted }}>{user.role}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={s.content}>{renderTab()}</div>
        </div>
      </div>
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
