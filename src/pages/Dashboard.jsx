import { BatteryCharging, CalendarCheck, Clock3, Plus, Repeat, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MetricCard from '../components/dashboard/MetricCard';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusMessage from '../components/ui/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { formatDayName, formatTime, todayISO } from '../utils/date';
import { calculateHabitStreak, logsForHabit } from '../utils/habits';

const categoryLabels = {
  work: 'Kerja',
  study: 'Belajar',
  health: 'Kesehatan',
  personal: 'Personal',
  rest: 'Istirahat',
};

const statusLabels = {
  pending: 'Menunggu',
  active: 'Aktif',
  done: 'Selesai',
  skipped: 'Dilewati',
};

function timeToMinutes(time) {
  const [hour, minute] = formatTime(time).split(':').map(Number);
  return hour * 60 + minute;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [rundown, setRundown] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [rules, setRules] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    const today = todayISO();
    const [rundownRes, habitsRes, logsRes, rulesRes] = await Promise.all([
      supabase
        .from('rundown_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('start_time', { ascending: true }),
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('status_today', true).lte('log_date', today),
      supabase.from('life_rules').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (rundownRes.error || habitsRes.error || logsRes.error || rulesRes.error) {
      setError('Data harian belum dapat dimuat. Periksa koneksi Supabase dan policy RLS.');
    } else {
      setRundown(rundownRes.data ?? []);
      setHabits(habitsRes.data ?? []);
      setHabitLogs(logsRes.data ?? []);
      setRules(rulesRes.data ?? []);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-rundown-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rundown_items', filter: `user_id=eq.${user.id}` },
        () => loadDashboard(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard, user.id]);

  const completed = rundown.filter((item) => item.status === 'done').length;
  const progress = rundown.length ? Math.round((completed / rundown.length) * 100) : 0;
  const mainFocus = rundown.find((item) => item.priority === 'high' && item.status !== 'done') ?? rundown[0];
  const activeRules = rules.filter((rule) => rule.is_active).length;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTask =
    rundown.find((item) => currentMinutes >= timeToMinutes(item.start_time) && currentMinutes < timeToMinutes(item.end_time) && item.status !== 'done') ??
    rundown.find((item) => item.status !== 'done');

  const greetingName = useMemo(() => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'teman';
  }, [user]);

  if (loading) {
    return <StatusMessage>Menyiapkan dashboard kamu...</StatusMessage>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Dasbor"
        title={`Hai ${greetingName}, mulai hari ini dengan arah yang jelas.`}
        description="Lihat fokus saat ini, cek progres, dan jaga ritme agar harimu tetap terkendali."
        action={
          <Link to="/rundown">
            <Button variant="orange">
              <Plus className="h-4 w-4" />
              Tambah Plan
            </Button>
          </Link>
        }
      />
      <StatusMessage type="error">{error}</StatusMessage>

      <Card className="mb-5 bg-structly-navy text-white">
        <div className="grid gap-4 min-[1700px]:grid-cols-[0.8fr_1.2fr] min-[1700px]:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase">
              <Clock3 className="h-4 w-4" />
              {formatDayName(now)}
            </p>
            <p className="mt-2 text-5xl font-black leading-none">
              {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="rounded-md border-2 border-structly-black bg-structly-white p-4 text-structly-black shadow-brutal-sm">
            <p className="text-sm font-black uppercase text-neutral-600">Fokus sekarang</p>
            <p className="mt-1 text-2xl font-black">{currentTask?.title || 'Belum ada task aktif'}</p>
            <p className="mt-2 font-bold text-neutral-700">
              {currentTask
                ? `${formatTime(currentTask.start_time)} - ${formatTime(currentTask.end_time)} - ${categoryLabels[currentTask.category] ?? currentTask.category}`
                : 'Isi plan pertama agar harimu punya arah.'}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2 min-[1700px]:grid-cols-4">
        <MetricCard
          title="Progress Hari Ini"
          value={`${completed}/${rundown.length || 0}`}
          description={`${progress}% plan sudah selesai`}
          icon={CalendarCheck}
          tone="bg-white"
        />
        <MetricCard
          title="Misi Utama"
          value={mainFocus?.title || 'Pilih satu'}
          description="Satu fokus utama agar energi tetap terarah."
          icon={Target}
          tone="bg-structly-pink"
        />
        <MetricCard title="Energi" value="7/10" description="Jaga ritme tanpa memaksakan diri." icon={BatteryCharging} tone="bg-structly-mint" />
        <MetricCard title="Rule Aktif" value={activeRules} description="Batas pribadi yang menjaga fokus harianmu." icon={ShieldCheck} tone="bg-structly-violet" />
      </div>

      <div className="mt-6 grid gap-5 min-[1700px]:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Plan Hari Ini</h2>
            <Link className="font-black text-structly-blue" to="/rundown">
              Atur
            </Link>
          </div>
          {rundown.length ? (
            <div className="space-y-3">
              {rundown.slice(0, 5).map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-md border-2 border-structly-black bg-structly-gray p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black">{item.title}</p>
                    <p className="text-sm font-bold text-neutral-600">
                      {formatTime(item.start_time)} - {formatTime(item.end_time)} - {categoryLabels[item.category] ?? item.category}
                    </p>
                  </div>
                  <span className="rounded-md border-2 border-structly-black bg-white px-3 py-1 text-sm font-black">
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-semibold text-neutral-700">Belum ada plan. Mulai dari satu blok kecil yang paling penting.</p>
          )}
        </Card>

        <div className="grid gap-5">
          <Card className="bg-white">
            <h2 className="flex items-center gap-2 text-2xl font-black">
              <Repeat className="h-6 w-6" />
              Habit Check
            </h2>
            <div className="mt-4 space-y-3">
              {habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between rounded-md border-2 border-structly-black bg-structly-gray p-3">
                  <span className="font-black">{habit.habit_name}</span>
                  <span className="font-black text-structly-blue">
                    {calculateHabitStreak(logsForHabit(habitLogs, habit.id), todayISO())} hari
                  </span>
                </div>
              ))}
              {!habits.length ? <p className="font-semibold text-neutral-700">Tambah habit kecil yang tetap bisa dijalankan saat hari padat.</p> : null}
            </div>
          </Card>
          <Card className="bg-structly-yellow">
            <h2 className="text-2xl font-black">Shortcut Disiplin</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link to="/life-rules"><Button variant="neutral" className="w-full">Buat Rule</Button></Link>
              <Link to="/habits"><Button variant="neutral" className="w-full">Catat Habit</Button></Link>
              <Link to="/review"><Button variant="neutral" className="w-full sm:col-span-2">Review Hari Ini</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
