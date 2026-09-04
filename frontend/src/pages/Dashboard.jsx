import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, Plus, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Empty, Loading, StatCard, Status } from '../components/UI';

const prettyDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------------------
// Wedding list card
// ---------------------------------------------------------------------------
function WeddingList({ weddings }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!weddings.length) return <Empty />;

  return (
    <div className="grid gap-4">
      {weddings.map((w) => (
        <button
          key={w._id}
          type="button"
          onClick={() => navigate(`/${user?.role || 'client'}/weddings/${w._id}`)}
          className="card flex flex-col justify-between gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center"
        >
          <div className="min-w-0">
            <p className="font-display text-xl">
              {w.brideName} <span className="text-gold">&amp;</span> {w.groomName}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {w.venue}, {w.city} &middot; {prettyDate(w.weddingDate)}
            </p>
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

      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Total weddings" value={weddings.length} />
        <StatCard icon={Sparkles} label="AI plans ready" value={generated} />
        <StatCard icon={Clock3} label="Active planning" value={weddings.filter((w) => w.status !== 'completed').length} />
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
