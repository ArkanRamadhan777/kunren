import { ChevronLeft, ChevronRight, CopyPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatusMessage from '../components/ui/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { formatTime, toISODate } from '../utils/date';

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const weekLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const initialRecurringForm = {
  title: '',
  start_time: '09:00',
  end_time: '10:00',
  category: 'work',
  priority: 'medium',
  weekdays: [1, 2, 3, 4, 5],
};

function getMonthRange(anchor) {
  return {
    start: toISODate(new Date(anchor.getFullYear(), anchor.getMonth(), 1)),
    end: toISODate(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)),
  };
}

function getMonthDatesByWeekdays(anchor, weekdays) {
  const totalDays = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const selectedWeekdays = new Set(weekdays.map(Number));
  return Array.from({ length: totalDays }, (_, index) => new Date(anchor.getFullYear(), anchor.getMonth(), index + 1)).filter((date) =>
    selectedWeekdays.has(date.getDay()),
  );
}

export default function SettingRundown() {
  const { user } = useAuth();
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialRecurringForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const monthRange = useMemo(() => getMonthRange(monthAnchor), [monthAnchor]);
  const targetDates = useMemo(() => getMonthDatesByWeekdays(monthAnchor, form.weekdays), [form.weekdays, monthAnchor]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('rundown_items')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthRange.start)
      .lte('date', monthRange.end);
    if (loadError) setError(loadError.message);
    setItems(data ?? []);
    setLoading(false);
  }, [monthRange.end, monthRange.start, user.id]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const toggleDay = (day) => {
    setForm((current) => {
      const exists = current.weekdays.includes(day);
      return {
        ...current,
        weekdays: exists ? current.weekdays.filter((item) => item !== day) : [...current.weekdays, day].sort((a, b) => a - b),
      };
    });
  };

  const applyRecurringRundown = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.start_time || !form.end_time) {
      setError('Nama plan, jam mulai, dan jam selesai wajib diisi.');
      return;
    }

    if (!form.weekdays.length) {
      setError('Pilih minimal satu hari aktif.');
      return;
    }

    const existingKeys = new Set(
      items.map((item) => `${item.date}|${item.title.trim().toLowerCase()}|${formatTime(item.start_time)}|${formatTime(item.end_time)}`),
    );
    const payload = targetDates
      .map((date) => ({
        user_id: user.id,
        date: toISODate(date),
        title: form.title.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        category: form.category,
        priority: form.priority,
        status: 'pending',
      }))
      .filter((item) => !existingKeys.has(`${item.date}|${item.title.toLowerCase()}|${item.start_time}|${item.end_time}`));

    if (!payload.length) {
      setSuccess('Pola ini sudah terpasang untuk bulan ini.');
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from('rundown_items').insert(payload);
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm(initialRecurringForm);
    setSuccess(`${payload.length} plan rutin sudah masuk kalender.`);
    loadItems();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Plan Rutin"
        title="Buat rutinitas tanpa input berulang."
        description="Gunakan untuk jadwal yang berulang seperti belajar, olahraga, kerja fokus, atau reset malam."
      />

      <div className="grid gap-6 min-[1700px]:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-structly-blue text-white">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <CopyPlus className="h-6 w-6" />
            Template Rutinitas
          </h2>
          <form className="mt-5 space-y-4" onSubmit={applyRecurringRundown}>
            <div className="rounded-lg border-2 border-structly-black bg-structly-white p-4 text-structly-black shadow-brutal-sm">
              <Input
                label="Nama Plan"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Contoh: Deep work tanpa distraksi"
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Mulai" type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
                <Input label="Selesai" type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 min-[520px]:grid-cols-2">
              <div className="rounded-lg border-2 border-structly-black bg-white p-3 text-structly-black shadow-brutal-sm">
                <Select label="Kategori" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option value="work">Kerja</option>
                  <option value="study">Belajar</option>
                  <option value="health">Kesehatan</option>
                  <option value="personal">Personal</option>
                  <option value="rest">Istirahat</option>
                </Select>
              </div>
              <div className="rounded-lg border-2 border-structly-black bg-white p-3 text-structly-black shadow-brutal-sm">
                <Select label="Prioritas" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white">Hari aktif</p>
              <div className="mt-2 grid grid-cols-4 gap-2 rounded-lg border-2 border-structly-black bg-structly-white p-3 shadow-brutal-sm sm:grid-cols-7">
                {weekLabels.map((label, day) => (
                  <button
                    key={label}
                    type="button"
                    className={`rounded-md border-2 border-structly-black px-2 py-2 text-sm font-black shadow-brutal-sm transition hover:-translate-y-0.5 ${
                      form.weekdays.includes(day) ? 'bg-structly-yellow text-structly-black' : 'bg-structly-white text-structly-black'
                    }`}
                    onClick={() => toggleDay(day)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <StatusMessage type="error">{error}</StatusMessage>
            <StatusMessage type="success">{success}</StatusMessage>
            <Button type="submit" loading={saving} disabled={saving} variant="orange" className="w-full">
              <CopyPlus className="h-4 w-4" />
              Pasang ke Bulan Ini
            </Button>
          </form>
        </Card>

        <Card className="bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">{monthNames[monthAnchor.getMonth()]} {monthAnchor.getFullYear()}</h2>
              <p className="mt-1 font-semibold text-neutral-700">{targetDates.length} tanggal akan mengikuti template ini.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1))} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1))} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {loading ? <StatusMessage>Memuat plan bulan ini...</StatusMessage> : null}
          <div className="mt-5 grid gap-2 sm:grid-cols-2 min-[1200px]:grid-cols-3">
            {targetDates.map((date) => (
              <div key={toISODate(date)} className="rounded-md border-2 border-structly-black bg-structly-gray p-3">
                <p className="font-black">{weekLabels[date.getDay()]}, {date.getDate()}</p>
                <p className="text-sm font-bold text-neutral-600">{monthNames[date.getMonth()]} {date.getFullYear()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
