import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, Sparkles, Users, CalendarDays } from 'lucide-react';
import api from '../services/api';
import { Empty, Loading, StatCard, Status } from '../components/UI';
import { useToast } from '../context/ToastContext';

const label = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setData({ stats: {}, recent: [] }));
  }, []);

  if (!data) return <Loading />;

  return (
    <>
      <p className="eyebrow">Studio command center</p>
      <h1 className="mt-2 font-display text-4xl">Good morning, curator.</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={CalendarDays} label="Total weddings" value={data.stats.total || 0} />
        <StatCard icon={Clock3} label="Active" value={data.stats.active || 0} />
        <StatCard icon={Sparkles} label="AI plans" value={data.stats.generated || 0} />
        <StatCard icon={Users} label="Pending review" value={data.stats.pending || 0} />
        <StatCard icon={CheckCircle2} label="Completed" value={data.stats.completed || 0} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent weddings</h2>
          <button className="text-sm font-bold text-wine" onClick={() => nav('/admin/weddings')}>
            View all
          </button>
        </div>
        {data.recent.length ? (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-400">
                <tr>
                  <th className="p-4">Couple</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((w) => (
                  <tr
                    onClick={() => nav(`/admin/weddings/${w._id}`)}
                    className="cursor-pointer border-b border-stone-50 hover:bg-stone-50"
                    key={w._id}
                  >
                    <td className="p-4 font-bold">{w.brideName} & {w.groomName}</td>
                    <td className="p-4 text-stone-500">{label(w.weddingDate)}</td>
                    <td className="p-4">{w.clientId?.name}</td>
                    <td className="p-4"><Status value={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </section>
    </>
  );
}

export function AdminWeddings() {
  const [weddings, setWeddings] = useState(null);
  const [filter, setFilter] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/admin/weddings${filter ? `?status=${filter}` : ''}`)
      .then(({ data }) => setWeddings(data.weddings))
      .catch(() => setWeddings([]));
  }, [filter]);

  if (!weddings) return <Loading />;

  const statuses = [
    ['', 'All'],
    ['planning', 'Planning'],
    ['under_review', 'Under Review'],
    ['approved', 'Approved'],
    ['in_production', 'In Production'],
    ['completed', 'Completed'],
  ];

  return (
    <>
      <p className="eyebrow">Wedding review</p>
      <h1 className="mt-2 font-display text-4xl">Every celebration, on track.</h1>
      <div className="mt-7 flex flex-wrap gap-2">
        {statuses.map(([value, name]) => (
          <button
            key={name}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === value ? 'bg-wine text-white' : 'bg-white text-stone-500 shadow-sm'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <AdminList weddings={weddings} navigate={nav} />
      </div>
    </>
  );
}

function AdminList({ weddings, navigate }) {
  if (!weddings.length) return <Empty title="No weddings in this view" />;
  return (
    <div className="grid gap-4">
      {weddings.map((w) => (
        <button
          onClick={() => navigate(`/admin/weddings/${w._id}`)}
          key={w._id}
          className="card flex flex-wrap items-center justify-between gap-4 p-5 text-left hover:shadow-lg"
        >
          <div>
            <p className="font-display text-xl">
              {w.brideName} <span className="text-gold">&</span> {w.groomName}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {w.city} · {label(w.weddingDate)} · Client: {w.clientId?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Status value={w.status} />
          </div>
        </button>
      ))}
    </div>
  );
}

export function AdminReviewTools({ weddingId, status, onUpdate }) {
  const { show } = useToast();

  const update = async (next) => {
    if (!window.confirm(`Move this wedding to ${next.replaceAll('_', ' ')}?`)) return;
    try {
      await api.put(`/admin/weddings/${weddingId}/status`, { status: next });
      show('Wedding status updated.');
      onUpdate?.();
    } catch (e) {
      show(e, 'error');
    }
  };

  const next = {
    ai_generated: 'under_review',
    under_review: 'approved',
    approved: 'in_production',
    in_production: 'completed',
  }[status];

  return (
    <div className="card p-5">
      <p className="eyebrow">Admin controls</p>
      {next ? (
        <button className="btn-primary mt-4 w-full text-xs" onClick={() => update(next)}>
          {next === 'approved' ? 'Approve plan' : `Move to ${next.replaceAll('_', ' ')}`}
        </button>
      ) : (
        <p className="mt-3 text-xs text-stone-400">Wedding workflow is marked as completed.</p>
      )}
    </div>
  );
}
