import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Check, ChevronRight, CircleDot, Clock3, Image,
  MapPin, RefreshCw, Sparkles, WandSparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Empty, Loading, Status } from '../components/UI';

const date = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const rolePath = (role) =>
  role === 'client' ? 'client' : role === 'admin' ? 'admin' : 'editor';

const AI_DONE_STATUSES = ['ai_generated', 'under_review', 'approved', 'in_production', 'completed'];

// ---------------------------------------------------------------------------
// WeddingDetail
// ---------------------------------------------------------------------------
export function WeddingDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/weddings/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ error: true }));
  }, [id]);

  if (!data) return <Loading />;
  if (data.error) return <Empty title="Wedding unavailable" text="You may not have permission to view this wedding." />;

  const { wedding, functions } = data;
  const prefix = rolePath(user.role);

  return (
    <>
      <Link className="text-sm font-bold text-wine" to={`/${prefix}/dashboard`}>← Back to dashboard</Link>
      <div className="mt-5 overflow-hidden rounded-3xl bg-wine p-7 text-white sm:p-10">
        <p className="eyebrow text-[#edc18b]">{wedding.weddingStyle}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl">
              {wedding.brideName} <span className="text-gold">&amp;</span> {wedding.groomName}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-white/70">
              <MapPin size={16} />{wedding.venue}, {wedding.city} · {date(wedding.weddingDate)}
            </p>
          </div>
          <Status value={wedding.status} />
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card p-6">
          <div className="flex justify-between">
            <h2 className="font-display text-2xl">Celebration flow</h2>
            <span className="text-sm text-stone-400">{functions.length} functions</span>
          </div>
          <div className="mt-5 divide-y divide-stone-100">
            {functions.map((fn) => (
              <div key={fn._id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-bold">{fn.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {date(fn.date)} · {fn.startTime}{fn.venue && ` · ${fn.venue}`}
                  </p>
                </div>
                <span className="status bg-blush text-wine">{fn.importance}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="card p-6">
          <p className="eyebrow">AI production plan</p>
          <h2 className="mt-2 font-display text-2xl">Ready to shape the story?</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Generate a tailored shot list, highlight narrative and album design system.
          </p>
          <button
            onClick={() => nav(`/${prefix}/weddings/${id}/ai-plan`)}
            className="btn-primary mt-5 w-full"
          >
            <WandSparkles size={16} />
            {AI_DONE_STATUSES.includes(wedding.status) ? 'Open AI plan' : 'Generate AI plan'}
          </button>
        </aside>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// GeneratePlanPage — polls /api/ai/status/:weddingId until backend confirms done
// ---------------------------------------------------------------------------
const STEPS = [
  'Analyzing wedding brief...',
  'Processing celebration functions...',
  'Crafting cinematic video strategy...',
  'Designing highlight film structure...',
  'Creating album concept...',
  'Finalizing production plan...',
];

export function GeneratePlanPage() {
  const { id } = useParams();
  const [wedding, setWedding] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | generating | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState(0);
  const { show } = useToast();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/weddings/${id}`).then(({ data }) => setWedding(data));
  }, [id]);

  const generate = async () => {
    setPhase('generating');
    setStep(0);
    setErrorMsg('');

    // POST returns 202 immediately; actual work runs in the background on the server
    try {
      await api.post(`/ai/generate-plan/${id}`);
    } catch (e) {
      setErrorMsg(typeof e === 'string' ? e : 'Failed to start generation. Please try again.');
      setPhase('error');
      return;
    }

    // Animate step indicator forward every 4 seconds while waiting
    const stepTimer = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      4000,
    );

    // Poll status every 2 seconds until the backend marks it done or failed
    const poll = setInterval(async () => {
      try {
        const { data } = await api.get(`/ai/status/${id}`);
        if (data.done) {
          clearInterval(poll);
          clearInterval(stepTimer);
          setStep(STEPS.length - 1);
          setPhase('done');
          show('Your AI wedding plan is ready!');
        } else if (data.failed) {
          clearInterval(poll);
          clearInterval(stepTimer);
          setErrorMsg(data.error || 'AI generation failed. Please try again.');
          setPhase('error');
        }
      } catch (_) {
        // Network hiccup — keep polling
      }
    }, 2000);
  };

  if (!wedding) return <Loading />;
  const already = AI_DONE_STATUSES.includes(wedding.wedding.status);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">AI studio</p>
      <h1 className="mt-2 font-display text-4xl">{"Let's direct the story."}</h1>

      <div className="card mt-7 overflow-hidden">
        <div className="bg-[#fdf2ed] p-7">
          <p className="text-sm font-bold text-wine">
            {wedding.wedding.brideName} &amp; {wedding.wedding.groomName}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {wedding.wedding.weddingStyle} · {wedding.functions.length} functions · {wedding.wedding.city}
          </p>
        </div>

        <div className="p-7">
          {phase === 'generating' && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-blush text-wine">
                <Sparkles />
              </div>
              <h2 className="mt-5 font-display text-2xl">Creating your production plan...</h2>
              <p className="mt-2 text-sm text-stone-400">This may take up to 30 seconds</p>
              <div className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm">
                {STEPS.map((x, i) => (
                  <p
                    key={x}
                    className={
                      i < step ? 'text-emerald-600' : i === step ? 'font-bold text-wine' : 'text-stone-300'
                    }
                  >
                    {i < step ? 'v' : i === step ? 'o' : 'o'} {x}
                  </p>
                ))}
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="py-8 text-center">
              <p className="text-4xl">!</p>
              <h2 className="mt-4 font-display text-2xl text-red-600">Generation failed</h2>
              <p className="mt-3 text-sm text-stone-500">{errorMsg}</p>
              <button className="btn-primary mt-6" onClick={generate}>
                <WandSparkles size={17} /> Try Again
              </button>
            </div>
          )}

          {(phase === 'done' || already) && (
            <div className="text-center">
              <Check className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600" size={58} />
              <h2 className="mt-4 font-display text-2xl">Your plan is ready.</h2>
              <button
                className="btn-primary mt-5"
                onClick={() => nav(`/${rolePath(user.role)}/weddings/${id}/video-plan`)}
              >
                Explore production plan <ChevronRight size={16} />
              </button>
            </div>
          )}

          {phase === 'idle' && !already && (
            <>
              <h2 className="font-display text-2xl">A complete creative direction, in one click.</h2>
              <p className="mt-3 leading-relaxed text-stone-500">
                WeddingAI will translate your brief into function shot lists, a highlight-film
                structure and a considered album layout.
              </p>
              <button className="btn-primary mt-6" onClick={generate}>
                <WandSparkles size={17} /> Generate AI Wedding Plan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanPage
// ---------------------------------------------------------------------------
export function PlanPage({ tab }) {
  const { id } = useParams();
  const [plans, setPlans] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [album, setAlbum] = useState(null);
  const { show } = useToast();
  const { user } = useAuth();
  const nav = useNavigate();
  const base = `/${rolePath(user.role)}/weddings/${id}`;

  const load = () =>
    Promise.all([
      api.get(`/weddings/${id}/video-plans`),
      api.get(`/weddings/${id}/highlight`),
      api.get(`/weddings/${id}/album-design`),
    ])
      .then(([v, h, a]) => {
        setPlans(v.data.plans);
        setHighlight(h.data.highlight);
        setAlbum(a.data.albumDesign);
      })
      .catch(() => {
        setPlans([]);
        setHighlight(null);
        setAlbum(null);
      });

  useEffect(() => { load(); }, [id]);

  const regenerate = async (kind) => {
    try {
      await api.post(`/ai/regenerate-${kind}/${id}`);
      show(`${kind === 'video' ? 'Video plans' : 'Album design'} regenerated.`);
      load();
    } catch (e) {
      show(e, 'error');
    }
  };

  if (!plans) return <Loading label="Opening your creative direction..." />;
  if (!plans.length && !highlight && !album)
    return (
      <Empty
        title="No AI plan yet"
        text="Generate your wedding plan before opening the production boards."
      />
    );

  const tabs = [
    ['overview', 'Overview'],
    ['video-plan', 'Function Videos'],
    ['highlight', 'Highlight Video'],
    ['album', 'Album Design'],
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">AI production direction</p>
          <h1 className="mt-2 font-display text-4xl">The story, in every detail.</h1>
        </div>
        <button onClick={() => regenerate(tab === 'album' ? 'album' : 'video')} className="btn-secondary">
          <RefreshCw size={16} /> Regenerate
        </button>
      </div>

      <nav className="mt-7 flex gap-2 overflow-x-auto border-b border-stone-200">
        {tabs.map(([slug, label]) => (
          <button
            key={slug}
            onClick={() => nav(`${base}/${slug === 'overview' ? 'video-plan' : slug}`)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold ${
              tab === slug || (tab === 'video-plan' && slug === 'overview')
                ? 'border-b-2 border-wine text-wine'
                : 'text-stone-400'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-7">
        {tab === 'video-plan' && <VideoPlans plans={plans} />}
        {tab === 'highlight' && <Highlight highlight={highlight} />}
        {tab === 'album' && <Album album={album} />}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function VideoPlans({ plans }) {
  return (
    <div className="space-y-6">
      {plans.map((p) => (
        <section key={p._id} className="card overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-[#fdf6f3] p-6">
            <div>
              <p className="eyebrow">Version {p.version}</p>
              <h2 className="mt-1 font-display text-3xl">{p.functionName}</h2>
              <p className="mt-2 max-w-2xl text-sm text-stone-500">{p.objective}</p>
            </div>
            <span className="status bg-white text-wine">
              <Clock3 size={13} className="mr-1 inline" />{p.estimatedDuration}s edit
            </span>
          </div>
          <div className="p-6">
            <div className="grid gap-5 text-sm sm:grid-cols-3">
              <Info label="Music" value={p.musicSuggestion} />
              <Info label="Transitions" value={p.transitionStyle} />
              <Info label="Colour grade" value={p.colorGrading} />
            </div>
            <h3 className="mt-7 font-display text-xl">Shot list</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Shot</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Camera</th>
                    <th className="p-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {p.shots.map((s) => (
                    <tr key={s.shotNumber} className="border-b border-stone-100">
                      <td className="p-3 font-bold text-wine">{s.shotNumber}</td>
                      <td className="p-3 font-bold">{s.shotType}</td>
                      <td className="max-w-sm p-3 text-stone-500">{s.description}</td>
                      <td className="p-3">{s.duration}s</td>
                      <td className="p-3 text-stone-500">{s.cameraSuggestion}</td>
                      <td className="p-3">
                        <span className="status bg-blush text-wine">{s.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <List label="Important moments" values={p.importantMoments} />
              <List label="Editing notes" values={p.editingNotes} />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function Highlight({ highlight }) {
  if (!highlight) return <Empty title="Highlight plan coming soon" />;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
      <section className="card p-6">
        <p className="eyebrow">{highlight.totalDuration}s highlight film</p>
        <h2 className="mt-2 font-display text-3xl">{highlight.concept}</h2>
        <p className="mt-4 leading-relaxed text-stone-500">{highlight.story}</p>
        <div className="mt-8 space-y-0">
          {highlight.timeline.map((item, i) => (
            <div
              key={`${item.timestamp}-${i}`}
              className="relative flex gap-5 border-l border-gold/40 pb-7 pl-6 last:pb-0"
            >
              <CircleDot className="absolute -left-[9px] top-0 text-gold" size={17} />
              <p className="w-12 shrink-0 text-xs font-bold text-gold">{item.timestamp}</p>
              <div>
                <p className="font-bold">{item.section}</p>
                <p className="mt-1 text-sm text-stone-500">{item.description}</p>
                <p className="mt-2 text-xs text-stone-400">
                  {item.footageSource} · {item.transition}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <Info label="Opening" value={highlight.opening} />
        <Info label="Emotional peak" value={highlight.emotionalPeak} />
        <Info label="Finale" value={highlight.finale} />
        <Info label="Music direction" value={highlight.musicDirection} />
        <Info label="Editing style" value={highlight.editingStyle} />
      </aside>
    </div>
  );
}

function Album({ album }) {
  if (!album) return <Empty title="Album design coming soon" />;
  return (
    <>
      <section className="card bg-[#fdf7f2] p-7">
        <p className="eyebrow">Album design system · version {album.version}</p>
        <h2 className="mt-2 font-display text-4xl">{album.theme}</h2>
        <p className="mt-3 max-w-3xl text-stone-600">{album.concept}</p>
        <div className="mt-6 flex gap-3">
          {album.colorPalette.map((c) => (
            <span key={c} title={c} className="h-10 w-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
          ))}
        </div>
        <p className="mt-5 text-sm"><b>Typography:</b> {album.typography}</p>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {album.pageStructure.map((p) => (
          <article key={p.pageNumber} className="card min-h-52 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gold">Page {p.pageNumber}</span>
              <Image size={18} className="text-wine" />
            </div>
            <h3 className="mt-6 font-display text-2xl">{p.layout}</h3>
            <p className="mt-2 text-sm text-stone-500">{p.description}</p>
            <p className="mt-4 text-xs font-bold text-wine">{p.photoCount} photos · {p.photoTypes.join(' · ')}</p>
            <p className="mt-3 text-xs text-stone-400">{p.designNotes}</p>
          </article>
        ))}
      </div>
    </>
  );
}

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-gold">{label}</p>
    <p className="mt-2 text-sm leading-relaxed text-stone-600">{value || '-'}</p>
  </div>
);

const List = ({ label, values = [] }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-gold">{label}</p>
    <ul className="mt-2 space-y-1 text-sm text-stone-600">
      {values.map((v) => <li key={v}>* {v}</li>)}
    </ul>
  </div>
);
