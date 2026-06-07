import { ArrowLeft, Check, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import NotFound from './NotFound';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatusMessage from '../components/ui/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { getCalendarEvent, getDayKind } from '../utils/calendar';
import { formatDateLabel, formatDayName, formatTime, isValidISODate, parseISODate, todayISO } from '../utils/date';
import { calculateHabitStreak, logsForHabit } from '../utils/habits';

const initialForm = {
  title: '',
  start_time: '09:00',
  end_time: '10:00',
  category: 'work',
  priority: 'medium',
  status: 'pending',
};
const categoryLabels = {
  work: 'Kerja',
  study: 'Belajar',
  health: 'Kesehatan',
  personal: 'Personal',
  rest: 'Istirahat',
};
const priorityLabels = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
};
const statusLabels = {
  pending: 'Menunggu',
  active: 'Aktif',
  done: 'Selesai',
  skipped: 'Dilewati',
};
const statusTone = {
  pending: 'bg-white',
  active: 'bg-structly-blue text-white',
  done: 'bg-structly-mint',
  skipped: 'bg-structly-pink',
};
const frequencyLabels = {
  daily: 'Harian',
  weekdays: 'Hari kerja',
  weekly: 'Mingguan',
};
const hourSlots = Array.from({ length: 24 }, (_, index) => index);
const hourHeight = 64;
const habitDurationMinutes = 30;

function addHour(hour) {
  if (hour >= 23) return '23:59';
  return `${String(hour + 1).padStart(2, '0')}:00`;
}

function addDaysISO(value, amount) {
  const date = parseISODate(value);
  date.setDate(date.getDate() + amount);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timeToMinutes(time) {
  const [hour, minute] = formatTime(time).split(':').map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes) {
  const capped = Math.min(minutes, 23 * 60 + 30);
  const hour = Math.floor(capped / 60);
  const minute = capped % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getHabitPlanTitle(habit) {
  return `Habit: ${habit.habit_name}`;
}

function isHabitDueOnDate(habit, dateObj) {
  const day = dateObj.getDay();
  if (habit.frequency === 'weekdays') return day >= 1 && day <= 5;
  if (habit.frequency === 'weekly' && habit.created_at) return new Date(habit.created_at).getDay() === day;
  return true;
}

function isOvernightItem(item) {
  return timeToMinutes(item.end_time) <= timeToMinutes(item.start_time);
}

function getVisibleRange(item, selectedDate) {
  const start = timeToMinutes(item.start_time);
  const end = timeToMinutes(item.end_time);

  if (item.date < selectedDate && isOvernightItem(item)) {
    return { start: 0, end };
  }

  if (item.date === selectedDate && isOvernightItem(item)) {
    return { start, end: 24 * 60 };
  }

  return { start, end };
}

function getEventStyle(item, selectedDate) {
  const { start, end } = getVisibleRange(item, selectedDate);
  const duration = Math.max(end, start + 30) - start;
  const height = Math.max(50, (duration / 60) * hourHeight);
  return { top: `${(start / 60) * hourHeight}px`, height: `${height}px` };
}

function getEventDurationLabel(item, selectedDate) {
  const { start, end } = getVisibleRange(item, selectedDate);
  const totalMinutes = Math.max(0, end - start);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes} menit`;
  if (!minutes) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

export default function PlanningDay() {
  const { date } = useParams();
  const { user } = useAuth();
  const selectedDate = isValidISODate(date) ? date : todayISO();
  const selectedDateObj = useMemo(() => parseISODate(selectedDate), [selectedDate]);
  const calendarEvent = getCalendarEvent(selectedDateObj);
  const [items, setItems] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingDate, setEditingDate] = useState(selectedDate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    const previousDate = addDaysISO(selectedDate, -1);
    const { data, error: loadError } = await supabase
      .from('rundown_items')
      .select('*')
      .eq('user_id', user.id)
      .in('date', [previousDate, selectedDate])
      .order('start_time', { ascending: true });
    if (loadError) setError(loadError.message);
    setItems((data ?? []).filter((item) => item.date === selectedDate || (item.date === previousDate && isOvernightItem(item))));
    setLoading(false);
  }, [selectedDate, user.id]);

  const loadHabits = useCallback(async () => {
    const [habitsRes, logsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('status_today', true).lte('log_date', selectedDate),
    ]);

    if (habitsRes.error || logsRes.error) {
      setError('Habit belum dapat dimuat. Cek schema Supabase.');
      return;
    }

    setHabits((habitsRes.data ?? []).filter((habit) => isHabitDueOnDate(habit, selectedDateObj)));
    setHabitLogs(logsRes.data ?? []);
  }, [selectedDate, selectedDateObj, user.id]);

  useEffect(() => {
    loadItems();
    loadHabits();
  }, [loadHabits, loadItems]);

  useEffect(() => {
    const channel = supabase
      .channel(`planning-day-${user.id}-${selectedDate}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rundown_items', filter: `user_id=eq.${user.id}` },
        () => loadItems(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadItems, selectedDate, user.id]);

  const openNewForm = () => {
    setEditingId(null);
    setEditingDate(selectedDate);
    setForm(initialForm);
    setShowForm(true);
  };

  const pickSlot = (hour) => {
    setEditingId(null);
    setEditingDate(selectedDate);
    setShowForm(true);
    setForm({
      ...initialForm,
      start_time: `${String(hour).padStart(2, '0')}:00`,
      end_time: addHour(hour),
    });
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setEditingDate(item.date);
    setShowForm(true);
    setForm({
      title: item.title,
      start_time: formatTime(item.start_time),
      end_time: formatTime(item.end_time),
      category: item.category,
      priority: item.priority,
      status: item.status,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim() || !form.start_time || !form.end_time) {
      setError('Nama plan, jam mulai, dan jam selesai wajib diisi.');
      return;
    }

    setSaving(true);
    const payload = { ...form, title: form.title.trim(), user_id: user.id, date: editingId ? editingDate : selectedDate };
    const request = editingId
      ? supabase.from('rundown_items').update(payload).eq('id', editingId).eq('user_id', user.id)
      : supabase.from('rundown_items').insert(payload);
    const { error: saveError } = await request;
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setForm(initialForm);
    setEditingId(null);
    setEditingDate(selectedDate);
    setShowForm(false);
    setSuccess(editingId ? 'Plan sudah di-update.' : 'Plan baru masuk timeline.');
    loadItems();
  };

  const updateStatus = async (item, status) => {
    const { error: statusError } = await supabase
      .from('rundown_items')
      .update({ status })
      .eq('id', item.id)
      .eq('user_id', user.id);
    if (statusError) setError(statusError.message);
    else loadItems();
  };

  const deleteItem = async (id) => {
    const { error: deleteError } = await supabase.from('rundown_items').delete().eq('id', id).eq('user_id', user.id);
    if (deleteError) setError(deleteError.message);
    else loadItems();
  };

  const isHabitDone = (habitId) =>
    habitLogs.some((log) => log.habit_id === habitId && log.log_date === selectedDate && log.status_today === true);

  const isHabitInTimeline = (habit) => items.some((item) => item.habit_id === habit.id || item.title === getHabitPlanTitle(habit));

  const addHabitToTimeline = async (habit) => {
    setError('');
    setSuccess('');

    const startMinutes = timeToMinutes(habit.default_time ?? '07:00');
    const payload = {
      user_id: user.id,
      habit_id: habit.id,
      date: selectedDate,
      title: getHabitPlanTitle(habit),
      start_time: minutesToTime(startMinutes),
      end_time: minutesToTime(startMinutes + habitDurationMinutes),
      category: 'health',
      priority: 'medium',
      status: isHabitDone(habit.id) ? 'done' : 'pending',
    };

    const { error: insertError } = await supabase.from('rundown_items').insert(payload);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(`${habit.habit_name} masuk ke timeline.`);
    loadItems();
  };

  const markHabitDone = async (habit) => {
    setError('');
    setSuccess('');
    const { error: logError } = await supabase.from('habit_logs').upsert(
      { user_id: user.id, habit_id: habit.id, log_date: selectedDate, status_today: true },
      { onConflict: 'habit_id,log_date' },
    );

    if (logError) {
      setError('Status habit belum dapat diperbarui. Coba lagi.');
      return;
    }

    const matchingPlan = items.find((item) => item.habit_id === habit.id || item.title === getHabitPlanTitle(habit));
    if (matchingPlan) {
      await supabase.from('rundown_items').update({ status: 'done' }).eq('id', matchingPlan.id).eq('user_id', user.id);
    }

    setSuccess(`${habit.habit_name} selesai untuk tanggal ini.`);
    loadHabits();
    loadItems();
  };

  if (!isValidISODate(date)) {
    return <NotFound />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Timeline"
        title={`${formatDayName(selectedDateObj)}, ${formatDateLabel(selectedDateObj)}`}
        description={`${getDayKind(selectedDateObj)}${calendarEvent ? ` - ${calendarEvent.label}` : ''}`}
        action={
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link to="/rundown">
              <Button variant="neutral" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Kalender
              </Button>
            </Link>
            <Button variant="orange" className="w-full sm:w-auto" onClick={openNewForm}>
              <Plus className="h-4 w-4" />
                Tambah Plan
            </Button>
          </div>
        }
      />
      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{success}</StatusMessage>

      <div className="grid gap-6 min-[1700px]:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden bg-white p-0">
          {loading ? <StatusMessage>Memuat timeline...</StatusMessage> : null}
          <div className="overflow-x-auto">
            <div className="min-w-[520px] sm:min-w-[680px]">
              <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr]">
                <div className="bg-structly-gray">
                  {hourSlots.map((hour) => (
                    <div key={hour} className="border-b-2 border-r-2 border-structly-black p-2 text-xs font-black" style={{ height: `${hourHeight}px` }}>
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                <div className="relative bg-white" style={{ height: `${hourSlots.length * hourHeight}px` }}>
                  {hourSlots.map((hour) => (
                    <button
                      key={hour}
                      className="block w-full border-b-2 border-structly-black text-left transition hover:bg-structly-yellow/50"
                      style={{ height: `${hourHeight}px` }}
                      onClick={() => pickSlot(hour)}
                      aria-label={`Tambah plan jam ${hour}`}
                    />
                  ))}
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`absolute left-0 right-0 z-10 flex flex-col overflow-hidden border-y-2 border-structly-black px-5 py-3 text-left transition hover:bg-structly-yellow ${statusTone[item.status] ?? 'bg-white'}`}
                      style={getEventStyle(item, selectedDate)}
                      onClick={(event) => {
                        event.stopPropagation();
                        editItem(item);
                      }}
                    >
                      <p className="truncate text-sm font-black">{item.title}</p>
                      <p className="mt-1 text-xs font-bold">{formatTime(item.start_time)} - {formatTime(item.end_time)}</p>
                      <p className="mt-1 truncate text-[11px] font-black uppercase">
                        {item.date < selectedDate ? 'Lanjutan - ' : ''}
                        {statusLabels[item.status] ?? item.status}
                      </p>
                      <span className="mt-auto self-start rounded-md border-2 border-structly-black bg-white px-2 py-0.5 text-[11px] font-black text-structly-black">
                        {getEventDurationLabel(item, selectedDate)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          {showForm ? (
            <Card className="bg-white">
              <h2 className="text-2xl font-black">{editingId ? 'Edit Plan' : 'Tambah Plan'}</h2>
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <Input label="Nama Plan" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Kerjain tugas desain" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Mulai" type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
                  <Input label="Selesai" type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Kategori" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    <option value="work">Kerja</option>
                    <option value="study">Belajar</option>
                    <option value="health">Kesehatan</option>
                    <option value="personal">Personal</option>
                    <option value="rest">Istirahat</option>
                  </Select>
                  <Select label="Prioritas" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </Select>
                </div>
                <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="pending">Belum mulai</option>
                  <option value="active">Sedang dikerjakan</option>
                  <option value="done">Sesuai plan</option>
                  <option value="skipped">Meleset</option>
                </Select>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" loading={saving} disabled={saving} variant="orange" className="flex-1">
                    <Plus className="h-4 w-4" />
                    {editingId ? 'Simpan' : 'Tambah'}
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => {
                      setEditingId(null);
                      setEditingDate(selectedDate);
                      setForm(initialForm);
                      setShowForm(false);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="bg-structly-blue text-white">
              <h2 className="text-2xl font-black">Timeline tanggal ini</h2>
              <p className="mt-2 font-semibold text-white/85">Klik Tambah Plan atau pilih slot kosong untuk memasukkan agenda.</p>
            </Card>
          )}

          <Card className="bg-structly-mint">
            <h2 className="text-xl font-black">Plan Tanggal Ini</h2>
            {!items.length ? (
              <EmptyState title="Masih kosong" description="Belum ada plan di tanggal ini. Mulai dari satu agenda utama." />
            ) : (
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-md border-2 border-structly-black bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{item.title}</p>
                        <p className="text-sm font-bold text-neutral-600">
                          {formatTime(item.start_time)} - {formatTime(item.end_time)} - {categoryLabels[item.category] ?? item.category}
                        </p>
                        <p className="mt-1 text-xs font-black uppercase">
                          {item.date < selectedDate ? 'Lanjutan dari kemarin - ' : ''}
                          {priorityLabels[item.priority] ?? item.priority} - {statusLabels[item.status] ?? item.status}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="neutral" className="h-9 min-h-9 px-2" onClick={() => updateStatus(item, 'done')}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="neutral" className="h-9 min-h-9 px-2" onClick={() => editItem(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="danger" className="h-9 min-h-9 px-2" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase text-structly-blue">
                  <Repeat className="h-4 w-4" />
                  Habit
                </p>
                <h2 className="mt-1 text-xl font-black">Habit Tanggal Ini</h2>
              </div>
              <span className="rounded-md border-2 border-structly-black bg-structly-yellow px-3 py-1 text-sm font-black shadow-brutal-sm">
                {habitLogs.filter((log) => log.log_date === selectedDate && log.status_today).length}/{habits.length}
              </span>
            </div>

            {!habits.length ? (
              <EmptyState title="Belum ada habit" description="Tambah habit dulu, lalu masukkan ke planning harian." />
            ) : (
              <div className="mt-4 space-y-3">
                {habits.map((habit) => {
                  const done = isHabitDone(habit.id);
                  const inTimeline = isHabitInTimeline(habit);
                  return (
                    <div key={habit.id} className={`rounded-md border-2 border-structly-black p-3 ${done ? 'bg-structly-yellow' : 'bg-structly-gray'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{habit.habit_name}</p>
                          <p className="text-sm font-bold text-neutral-600">
                            {frequencyLabels[habit.frequency] ?? habit.frequency} - {formatTime(habit.default_time ?? '07:00')}
                          </p>
                        </div>
                        <span className="rounded-md border-2 border-structly-black bg-white px-2 py-1 text-xs font-black">
                          {calculateHabitStreak(logsForHabit(habitLogs, habit.id), selectedDate)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <Button variant="neutral" className="h-10 min-h-10 px-3" disabled={inTimeline} onClick={() => addHabitToTimeline(habit)}>
                          <Plus className="h-4 w-4" />
                          {inTimeline ? 'Sudah di timeline' : 'Masuk Timeline'}
                        </Button>
                        <Button variant={done ? 'neutral' : 'orange'} className="h-10 min-h-10 px-3" disabled={done} onClick={() => markHabitDone(habit)}>
                          <Check className="h-4 w-4" />
                          {done ? 'Selesai' : 'Tandai Selesai'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
