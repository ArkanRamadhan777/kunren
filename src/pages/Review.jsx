import { AlertTriangle, CheckCircle2, Save, TimerReset } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusMessage from '../components/ui/StatusMessage';
import Textarea from '../components/ui/Textarea';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { formatTime, todayISO } from '../utils/date';

const categoryLabels = {
  work: 'Kerja',
  study: 'Belajar',
  health: 'Kesehatan',
  personal: 'Personal',
  rest: 'Istirahat',
};

const statusLabels = {
  pending: 'Belum mulai',
  active: 'Sedang dikerjakan',
  done: 'Sesuai plan',
  skipped: 'Meleset',
};

const statusTone = {
  pending: 'bg-white',
  active: 'bg-structly-blue text-white',
  done: 'bg-structly-mint',
  skipped: 'bg-structly-pink',
};

export default function Review() {
  const { user } = useAuth();
  const [rundown, setRundown] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [reflection, setReflection] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReview = useCallback(async () => {
    setLoading(true);
    const today = todayISO();
    const [rundownRes, habitsRes, logsRes, reflectionRes] = await Promise.all([
      supabase.from('rundown_items').select('*').eq('user_id', user.id).eq('date', today).order('start_time', { ascending: true }),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('habit_id,status_today').eq('user_id', user.id).eq('log_date', today),
      supabase.from('reflections').select('*').eq('user_id', user.id).eq('review_date', today).maybeSingle(),
    ]);

    if (rundownRes.error || habitsRes.error || logsRes.error || reflectionRes.error) {
      setError('Data review belum dapat dimuat. Coba refresh atau cek Supabase.');
    } else {
      setRundown(rundownRes.data ?? []);
      setHabits(habitsRes.data ?? []);
      setHabitLogs(logsRes.data ?? []);
      setReflection(reflectionRes.data);
      setNotes(reflectionRes.data?.notes ?? '');
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  useEffect(() => {
    const channel = supabase
      .channel(`realisasi-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rundown_items', filter: `user_id=eq.${user.id}` },
        () => loadReview(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadReview, user.id]);

  const stats = useMemo(() => {
    const completed = rundown.filter((item) => item.status === 'done').length;
    const skipped = rundown.filter((item) => item.status === 'skipped').length;
    const active = rundown.filter((item) => item.status === 'active').length;
    const doneHabitIds = new Set(habitLogs.filter((log) => log.status_today).map((log) => log.habit_id));
    const doneHabits = habits.filter((habit) => doneHabitIds.has(habit.id)).length;
    return {
      completed,
      skipped,
      active,
      planned: rundown.length,
      matchRate: rundown.length ? Math.round((completed / rundown.length) * 100) : 0,
      habitConsistency: habits.length ? Math.round((doneHabits / habits.length) * 100) : 0,
    };
  }, [habitLogs, habits, rundown]);

  const saveReflection = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!notes.trim()) {
      setError('Tulis catatan singkat agar review punya konteks.');
      return;
    }

    setSaving(true);
    const payload = {
      user_id: user.id,
      review_date: todayISO(),
      notes: notes.trim(),
      completed_tasks: stats.completed,
      skipped_tasks: stats.skipped,
      habit_consistency: stats.habitConsistency,
      mood_score: 7,
      energy_score: 7,
    };
    const request = reflection
      ? supabase.from('reflections').update(payload).eq('id', reflection.id).eq('user_id', user.id)
      : supabase.from('reflections').insert(payload);
    const { error: saveError } = await request;
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSuccess('Review tersimpan. Gunakan sebagai bahan perbaikan besok.');
    loadReview();
  };

  const updateStatus = async (item, status) => {
    const { error: statusError } = await supabase
      .from('rundown_items')
      .update({ status })
      .eq('id', item.id)
      .eq('user_id', user.id);
    if (statusError) setError(statusError.message);
    else loadReview();
  };

  if (loading) {
    return <StatusMessage>Menyiapkan review hari ini...</StatusMessage>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Review"
        title="Evaluasi hari ini dengan jujur."
        description="Tandai plan yang selesai, tertunda, atau meleset. Gunakan hasilnya untuk membuat strategi yang lebih baik besok."
      />
      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{success}</StatusMessage>

      <div className="mt-5 grid gap-5 md:grid-cols-4">
        <Card className="bg-white">
          <p className="font-black uppercase text-neutral-600">Plan</p>
          <p className="mt-3 text-5xl font-black">{stats.planned}</p>
        </Card>
        <Card className="bg-structly-mint">
          <p className="font-black uppercase text-neutral-600">Sesuai</p>
          <p className="mt-3 text-5xl font-black">{stats.completed}</p>
        </Card>
        <Card className="bg-structly-pink">
          <p className="font-black uppercase text-neutral-600">Meleset</p>
          <p className="mt-3 text-5xl font-black">{stats.skipped}</p>
        </Card>
        <Card className="bg-structly-blue text-white">
          <p className="font-black uppercase text-white/80">Konsisten</p>
          <p className="mt-3 text-5xl font-black">{stats.matchRate}%</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 min-[1700px]:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-white">
          <h2 className="text-2xl font-black">Plan vs Hasil</h2>
          <div className="mt-5 space-y-3">
            {rundown.map((item) => (
              <div key={item.id} className={`rounded-md border-2 border-structly-black p-4 ${statusTone[item.status] ?? 'bg-white'}`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{item.title}</p>
                    <p className="mt-1 text-sm font-bold text-neutral-700">
                      {formatTime(item.start_time)} - {formatTime(item.end_time)} - {categoryLabels[item.category] ?? item.category}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase">{statusLabels[item.status] ?? item.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => updateStatus(item, 'active')}>
                      <TimerReset className="h-4 w-4" />
                      Aktif
                    </Button>
                    <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => updateStatus(item, 'done')}>
                      <CheckCircle2 className="h-4 w-4" />
                      Sesuai
                    </Button>
                    <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => updateStatus(item, 'skipped')}>
                      <AlertTriangle className="h-4 w-4" />
                      Meleset
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!rundown.length ? (
              <p className="rounded-md border-2 border-structly-black bg-structly-gray p-4 font-semibold text-neutral-700">
                Belum ada plan hari ini. Isi dulu di halaman Kalender.
              </p>
            ) : null}
          </div>
        </Card>

        <Card className="bg-structly-yellow">
          <h2 className="text-2xl font-black">Catatan Review</h2>
          <p className="mt-2 font-semibold">Tulis alasan plan berjalan atau meleset. Jadikan catatan ini bahan evaluasi, bukan bahan menyalahkan diri.</p>
          <form className="mt-5 space-y-4" onSubmit={saveReflection}>
            <Textarea
              label="Apa yang memengaruhi hasil hari ini?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contoh: pagi berjalan sesuai plan, sore bergeser karena meeting tambahan."
            />
            <Button type="submit" loading={saving} disabled={saving} variant="orange" className="w-full sm:w-auto">
              <Save className="h-4 w-4" />
              Simpan Review
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
