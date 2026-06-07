import { Check, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatusMessage from '../components/ui/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { todayISO } from '../utils/date';
import { calculateHabitStreak, logsForHabit } from '../utils/habits';

const frequencyLabels = {
  daily: 'Harian',
  weekdays: 'Hari kerja',
  weekly: 'Mingguan',
};

export default function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ habit_name: '', frequency: 'daily', default_time: '07:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadHabits = useCallback(async () => {
    setLoading(true);
    const today = todayISO();
    const [habitsRes, logsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('status_today', true).lte('log_date', today),
    ]);
    if (habitsRes.error || logsRes.error) setError('Habit belum dapat dimuat. Cek schema Supabase.');
    setHabits(habitsRes.data ?? []);
    setLogs(logsRes.data ?? []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const isDoneToday = (habitId) => logs.some((log) => log.habit_id === habitId && log.status_today === true);

  const addHabit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.habit_name.trim()) {
      setError('Nama habit wajib diisi.');
      return;
    }
    setSaving(true);
    const { error: insertError } = await supabase.from('habits').insert({
      user_id: user.id,
      habit_name: form.habit_name.trim(),
      frequency: form.frequency,
      default_time: form.default_time,
      streak: 0,
      status_today: false,
    });
    setSaving(false);
    if (insertError) setError(insertError.message);
    else {
      setForm({ habit_name: '', frequency: 'daily', default_time: '07:00' });
      setSuccess('Habit baru berhasil disimpan.');
      loadHabits();
    }
  };

  const markDone = async (habit) => {
    const today = todayISO();
    const { error: logError } = await supabase.from('habit_logs').upsert(
      { user_id: user.id, habit_id: habit.id, log_date: today, status_today: true },
      { onConflict: 'habit_id,log_date' },
    );
    if (logError) setError('Status habit belum dapat diperbarui. Coba lagi.');
    else {
      setSuccess(`${habit.habit_name} selesai untuk hari ini.`);
      loadHabits();
    }
  };

  const deleteHabit = async (id) => {
    const { error: deleteError } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id);
    if (deleteError) setError(deleteError.message);
    else {
      setSuccess('Habit sudah dihapus.');
      loadHabits();
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Habit"
        title="Bangun konsistensi dari aksi kecil."
        description="Pilih habit yang realistis, ulangi setiap hari, dan biarkan progresnya terlihat."
      />
      <div className="grid gap-6 min-[1700px]:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-white">
          <h2 className="text-2xl font-black">Tambah Habit Baru</h2>
          <form className="mt-5 space-y-4" onSubmit={addHabit}>
            <Input
              label="Nama Habit"
              value={form.habit_name}
              onChange={(event) => setForm({ ...form, habit_name: event.target.value })}
              placeholder="Baca 10 menit sebelum tidur"
            />
            <Select label="Frekuensi" value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })}>
              <option value="daily">Harian</option>
              <option value="weekdays">Hari kerja</option>
              <option value="weekly">Mingguan</option>
            </Select>
            <Input
              label="Jam Default"
              type="time"
              value={form.default_time}
              onChange={(event) => setForm({ ...form, default_time: event.target.value })}
            />
            <StatusMessage type="error">{error}</StatusMessage>
            <StatusMessage type="success">{success}</StatusMessage>
            <Button type="submit" loading={saving} disabled={saving} variant="orange" className="w-full">
              <Plus className="h-4 w-4" />
              Simpan Habit
            </Button>
          </form>
        </Card>

        <div>
          {loading ? <StatusMessage>Memuat habit kamu...</StatusMessage> : null}
          {!loading && !habits.length ? (
            <EmptyState title="Belum ada habit" description="Mulai dari habit kecil yang bisa selesai dalam waktu singkat." />
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => {
              const done = isDoneToday(habit.id);
              const streak = calculateHabitStreak(logsForHabit(logs, habit.id), todayISO());
              return (
                <Card key={habit.id} className={done ? 'bg-structly-yellow' : 'bg-white'}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">{habit.habit_name}</h3>
                      <p className="mt-1 font-bold text-neutral-600">
                        {frequencyLabels[habit.frequency] ?? habit.frequency} - {habit.default_time?.slice(0, 5) ?? '07:00'}
                      </p>
                    </div>
                    <span className="rounded-md border-2 border-structly-black bg-structly-orange px-3 py-1 font-black shadow-brutal-sm">
                      {streak}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-8 rounded border-2 border-structly-black ${index < Math.min(streak, 7) ? 'bg-structly-blue' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button variant={done ? 'neutral' : 'orange'} className="h-10 min-h-10 flex-1" disabled={done} onClick={() => markDone(habit)}>
                      <Check className="h-4 w-4" />
                      {done ? 'Selesai Hari Ini' : 'Tandai Selesai'}
                    </Button>
                    <Button variant="danger" className="h-10 min-h-10 px-3" onClick={() => deleteHabit(habit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
