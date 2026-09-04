import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarHeart, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function AuthShell({ children, title, subtitle }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-wine p-14 text-white lg:block">
        <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#a86072] opacity-40 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gold opacity-30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 font-display text-2xl">
            <CalendarHeart /> WeddingAI
          </div>
          <div className="mt-36 max-w-lg">
            <p className="eyebrow text-[#f1c58e]">The modern production studio</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">
              Every meaningful moment, thoughtfully planned.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              Turn a wedding brief into cinematic shot lists, an editorial highlight film and an heirloom album concept.
            </p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl text-wine lg:hidden">
            <CalendarHeart /> WeddingAI
          </Link>
          <p className="mt-10 eyebrow">Welcome to WeddingAI</p>
          <h2 className="mt-2 font-display text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: 'client@weddingai.com', password: 'WeddingAI123!' });
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(`/${data.user.role}/dashboard`);
    } catch (error) {
      show(error, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue shaping beautiful wedding stories.">
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            required
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            required
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'} <Sparkles size={16} />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        New to WeddingAI?{' '}
        <Link to="/register" className="font-bold text-wine">
          Create an account
        </Link>
      </p>
      <div className="mt-8 space-y-2">
        <p className="rounded-xl bg-blush p-3 text-center text-xs text-wine">
          <b>Client Demo:</b> client@weddingai.com · WeddingAI123!
        </p>

      </div>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate(`/${data.user.role}/dashboard`);
    } catch (error) {
      show(error, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your studio" subtitle="Bring your wedding vision and creative production together.">
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="label">Your name</label>
          <input
            required
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email address</label>
          <input
            required
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            required
            minLength="8"
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-wine">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
