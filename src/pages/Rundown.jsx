import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusMessage from '../components/ui/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { getCalendarEvent, getDayKind, getMonthDays, getMonthRange, monthNames, weekLabels } from '../utils/calendar';
import { todayISO, toISODate } from '../utils/date';

export default function Rundown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthDays = useMemo(() => getMonthDays(monthAnchor), [monthAnchor]);
  const monthRange = useMemo(() => getMonthRange(monthAnchor), [monthAnchor]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: loadError } = await supabase
      .from('rundown_items')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthRange.start)
      .lte('date', monthRange.end)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    if (loadError) setError(loadError.message);
    setItems(data ?? []);
    setLoading(false);
  }, [monthRange.end, monthRange.start, user.id]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`planning-calendar-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rundown_items', filter: `user_id=eq.${user.id}` },
        () => loadItems(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadItems, user.id]);

  const moveMonth = (direction) => {
    setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + direction, 1));
  };

  const moveYear = (direction) => {
    setMonthAnchor(new Date(monthAnchor.getFullYear() + direction, monthAnchor.getMonth(), 1));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Kalender"
        title="Peta harian untuk menjaga arah."
        description="Pilih tanggal, susun plan, dan lihat agenda yang perlu kamu jalankan."
      />
      <StatusMessage type="error">{error}</StatusMessage>

      <Card className="overflow-hidden bg-white p-0">
        <div className="border-b-2 border-structly-black bg-structly-blue p-5 text-white">
          <div className="flex flex-col gap-5 min-[1700px]:flex-row min-[1700px]:items-end min-[1700px]:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase">
                <CalendarDays className="h-4 w-4" />
                Kalender Plan
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <h2 className="text-6xl font-black leading-none sm:text-7xl">{monthNames[monthAnchor.getMonth()]}</h2>
                <p className="pb-2 text-4xl font-black">{monthAnchor.getFullYear()}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] min-[1700px]:min-w-[620px]">
              <div className="flex items-center justify-between gap-2 rounded-md border-2 border-structly-black bg-structly-yellow p-2 text-structly-black shadow-brutal-sm">
                <Button variant="neutral" className="h-9 min-h-9 px-2" onClick={() => moveMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-center text-lg font-black">{monthNames[monthAnchor.getMonth()]}</span>
                <Button variant="neutral" className="h-9 min-h-9 px-2" onClick={() => moveMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-md border-2 border-structly-black bg-structly-pink p-2 text-structly-black shadow-brutal-sm">
                <Button variant="neutral" className="h-9 min-h-9 px-2" onClick={() => moveYear(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-center text-lg font-black">{monthAnchor.getFullYear()}</span>
                <Button variant="neutral" className="h-9 min-h-9 px-2" onClick={() => moveYear(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-md border-2 border-structly-black bg-white px-3 py-2 text-structly-black shadow-brutal-sm">
                <p className="flex items-center gap-2 text-xs font-black uppercase">
                  <Clock3 className="h-4 w-4" />
                  Sekarang
                </p>
                <p className="mt-1 text-xl font-black">{now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? <StatusMessage>Memuat kalender bulan ini...</StatusMessage> : null}
        <div className="overflow-x-auto bg-structly-gray p-3 sm:p-5">
          <div className="grid min-w-[640px] grid-cols-7 overflow-hidden rounded-lg border-2 border-structly-black bg-white shadow-brutal">
            {weekLabels.map((label, index) => (
                <div key={label} className={`border-b-2 border-structly-black bg-structly-yellow p-3 text-center text-sm font-black ${index === 0 ? 'text-structly-orange' : ''}`}>
                  {label}
                </div>
              ))}
              {monthDays.map((date, index) => {
                const iso = date ? toISODate(date) : `blank-${index}`;
                const isToday = date && iso === todayISO();
                const count = date ? items.filter((item) => item.date === iso).length : 0;
                const event = date ? getCalendarEvent(date) : null;
                const dayKind = date ? getDayKind(date) : '';
                return (
                  <button
                    key={iso}
                    disabled={!date}
                    className="relative min-h-[118px] border-b-2 border-r-2 border-structly-black bg-white p-3 text-left transition hover:bg-structly-yellow/60 disabled:bg-neutral-100 disabled:hover:bg-neutral-100 sm:min-h-[136px]"
                    onClick={() => date && navigate(`/rundown/${iso}`)}
                  >
                    {date ? (
                      <>
                        <span className="flex items-center gap-2">
                          <span className={`grid h-10 w-10 place-items-center rounded-full border-2 border-structly-black text-base font-black ${isToday ? 'bg-structly-blue text-white' : index % 7 === 0 ? 'bg-white text-structly-orange' : 'bg-white'}`}>
                            {date.getDate()}
                          </span>
                          {count ? (
                            <span className="rounded-full border-2 border-structly-black bg-structly-mint px-2 py-1 text-xs font-black">
                              {count} plan
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-3 block text-xs font-black text-neutral-600">{dayKind}</span>
                        {event ? (
                          <span className={`mt-2 block rounded-md border-2 border-structly-black px-2 py-1 text-[11px] font-black ${event.type === 'libur' || event.type === 'cuti' ? 'bg-structly-orange' : 'bg-structly-yellow'}`}>
                            {event.label}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </button>
                );
              })}
          </div>
        </div>
      </Card>
    </div>
  );
}
