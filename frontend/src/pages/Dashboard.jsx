import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock3, Film, Plus, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Empty, Loading, StatCard, Status } from '../components/UI';

const prettyDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------------------
// Shared wedding list card
// ---------------------------------------------------------------------------
function WeddingList({ weddings, editor = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!weddings.length) return <Empty />;

  return (
    <div className="grid gap-4">
      {weddings.map((w) => (
        <button
          key={w._id}
          type="button"
          onClick={() => navigate(`/${user.role}/weddings/${w._id}`)}
          className="card flex flex-col justify-between gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center"
        >
          <div className="min-w-0">
            <p className="font-display text-xl">
              {w.brideName} <span className="text-gold">&amp;</span> {w.groomName}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {w.venue}, {w.city} &middot; {prettyDate(w.weddingDate)}
            </p>
            {editor && (
              <p className="mt-2 text-xs text-stone-400">Client: {w.clientId?.name}</p>
            )}
          </div>
          <div className="shrink-0">
            <Status value={w.status} />
          </div>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Client dashboard
// ---------------------------------------------------------------------------
export function ClientDashboard() {
  const [weddings, setWeddings] = useState(null);

  useEffect(() => {
    api.get('/weddings')
      .then(({ data }) => setWeddings(data.weddings))
      .catch(() => setWeddings([]));
  }, []);

  if (!weddings) return <Loading />;

  const generated = weddings.filter((w) =>
    ['ai_generated', 'under_review', 'approved', 'in_production', 'completed'].includes(w.status)
  ).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your wedding studio</p>
          <h1 className="mt-2 font-display text-4xl">Plan every beautiful frame.</h1>
          <p className="mt-2 text-stone-500">
            Your creative brief, translated into a production-ready vision.
          </p>
        </div>
        <Link className="btn-primary" to="/client/weddings/new">
          <Plus size={17} /> Create wedding
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Total weddings"   value={weddings.length} />
        <StatCard icon={Sparkles}    label="AI plans ready"   value={generated} />
        <StatCard icon={Clock3}      label="Active planning"  value={weddings.filter((w) => w.status !== 'completed').length} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Your weddings</h2>
          <span className="text-sm text-stone-400">Recently updated</span>
        </div>
        <WeddingList weddings={weddings} />
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Editor dashboard
// ---------------------------------------------------------------------------
export function EditorDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/editor/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setData({ stats: {}, weddings: [] }));
  }, []);

  if (!data) return <Loading />;

  return (
    <>
      <p className="eyebrow">Production desk</p>
      <h1 className="mt-2 font-display text-4xl">Assigned stories.</h1>
      <p className="mt-2 text-stone-500">
        Your active project queue, ready for cinematography planning.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Film}         label="Assigned projects" value={data.stats.assigned    || 0} />
        <StatCard icon={Clock3}       label="In production"     value={data.stats.inProduction || 0} />
        <StatCard icon={CheckCircle2} label="Completed"         value={data.stats.completed    || 0} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl">Your project queue</h2>
        <WeddingList weddings={data.weddings} editor />
      </section>
    </>
  );
}
