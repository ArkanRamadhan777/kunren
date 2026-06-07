import {
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoMark from '../components/brand/LogoMark';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const features = [
  { icon: CalendarDays, title: 'Daily Plan', text: 'Susun jadwal, tugas, dan waktu istirahat dalam timeline yang jelas.' },
  { icon: ShieldCheck, title: 'Personal Rules', text: 'Tetapkan batas yang membantu kamu tetap fokus saat distraksi mulai masuk.' },
  { icon: Flame, title: 'Habit Streak', text: 'Bangun konsistensi dari aksi kecil yang bisa diulang setiap hari.' },
  { icon: Target, title: 'Current Focus', text: 'Lihat prioritas yang perlu dikerjakan sekarang tanpa overload informasi.' },
  { icon: BatteryCharging, title: 'Live Updates', text: 'Plan, habit, dan review langsung mengikuti perubahan yang kamu buat.' },
  { icon: ClipboardCheck, title: 'Daily Review', text: 'Evaluasi apa yang berjalan, apa yang tertunda, dan langkah perbaikan berikutnya.' },
];

const problems = ['Hari mulai tanpa arah', 'Tugas tidak terstruktur', 'Distraksi terlalu mudah masuk', 'Niat ada, sistem belum kuat', 'Ingin konsisten tanpa burnout'];

function LandingNav() {
  const [open, setOpen] = useState(false);
  const links = [
    ['#features', 'Fitur'],
    ['#how', 'Cara Kerja'],
  ];

  return (
    <header className="sticky top-0 z-30 border-b-2 border-structly-black bg-structly-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <LogoMark className="h-11 w-11 text-2xl" />
          <span className="brand-wordmark text-2xl">kunren</span>
        </Link>
        <nav className="hidden items-center gap-6 font-black md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-structly-blue">
              {label}
            </a>
          ))}
          <Link to="/login" className="hover:text-structly-blue">
            Masuk
          </Link>
          <Link to="/register">
            <Button variant="orange">Mulai Sekarang</Button>
          </Link>
        </nav>
        <Button variant="neutral" className="h-10 min-h-10 px-3 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open ? (
        <nav className="border-t-2 border-structly-black bg-structly-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 font-black">
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <Link to="/login">Masuk</Link>
            <Link to="/register">
              <Button variant="orange" className="w-full">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function DashboardMockup() {
  return (
    <div className="brutal-card bg-white p-4 shadow-brutal-lg">
      <div className="mb-4 flex items-center justify-between border-b-2 border-structly-black pb-3">
        <div>
          <p className="text-xs font-black uppercase text-structly-blue">Misi Hari Ini</p>
          <p className="text-xl font-black">Plan Rabu</p>
        </div>
        <div className="rounded-md border-2 border-structly-black bg-structly-yellow px-3 py-1 font-black shadow-brutal-sm">
          57%
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border-2 border-structly-black bg-structly-blue p-4 text-white">
          <p className="text-sm font-black">Fokus Utama</p>
          <p className="mt-2 text-2xl font-black">Selesaikan tugas magang</p>
        </div>
        <div className="rounded-md border-2 border-structly-black bg-structly-pink p-4">
          <p className="text-sm font-black">Energi</p>
          <p className="mt-2 text-2xl font-black">7/10</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {['09:00 Deep work', '13:00 Kelas & catatan', '20:30 Review singkat'].map((item, index) => (
          <div key={item} className="flex items-center gap-3 rounded-md border-2 border-structly-black bg-structly-gray p-3">
            <CheckCircle2 className={index === 0 ? 'text-structly-green' : 'text-neutral-400'} />
            <span className="font-black">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-structly-ink">
      <LandingNav />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-structly-black bg-white px-4 py-2 font-black shadow-brutal-sm">
              <Sparkles className="h-4 w-4 text-structly-orange" />
              Build your daily discipline.
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
              kunren
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold text-white/80 sm:text-xl">
              Kunren membantu kamu menyusun hari, menjaga habit, dan mengevaluasi progres. Bukan sekadar niat, tapi sistem harian yang membuat disiplin lebih mudah dijalankan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button variant="orange" className="w-full sm:w-auto">
                  Mulai Sekarang <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="neutral" className="w-full sm:w-auto">
                  Lihat Fitur
                </Button>
              </a>
            </div>
          </div>
          <DashboardMockup />
        </section>

        <section className="border-y-2 border-structly-black bg-structly-navy px-4 py-14 text-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="max-w-2xl text-3xl font-black sm:text-4xl">Disiplin bukan soal hidup sempurna. Disiplin butuh sistem yang membuat kamu mudah kembali ke jalur.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {problems.map((problem) => (
                <div key={problem} className="rounded-md border-2 border-structly-black bg-structly-white p-4 font-black text-structly-black shadow-brutal-sm">
                  {problem}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-structly-white px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-2xl">
              <p className="font-black uppercase text-structly-orange">Fitur</p>
              <h2 className="mt-2 text-4xl font-black">Semua yang kamu butuhkan untuk tetap terarah.</h2>
              <p className="mt-3 font-semibold text-neutral-700">
                Dari rencana harian sampai evaluasi, Kunren membantu kamu membangun pola yang lebih stabil dan terukur.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="bg-white">
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-md border-2 border-structly-black bg-structly-pink shadow-brutal-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-black">{feature.title}</h3>
                    <p className="mt-2 font-semibold text-neutral-700">{feature.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="border-y-2 border-structly-black bg-structly-gray px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-4xl font-black">Cara Kerja</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {['Susun plan', 'Jalankan fokus', 'Review progres'].map((step, index) => (
                <Card key={step} className="bg-white">
                  <div className="mb-4 inline-flex rounded-md border-2 border-structly-black bg-structly-yellow px-3 py-1 text-xl font-black shadow-brutal-sm">
                    0{index + 1}
                  </div>
                  <h3 className="text-2xl font-black">{step}</h3>
                  <p className="mt-2 font-semibold text-neutral-700">
                    {index === 0 && 'Pilih tanggal, isi blok kegiatan, lalu tentukan prioritas yang realistis.'}
                    {index === 1 && 'Gunakan dashboard untuk melihat fokus saat ini dan progres harian.'}
                    {index === 2 && 'Tandai hasil hari ini, catat hambatan, lalu perbaiki strategi besok.'}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t-2 border-structly-black bg-structly-black px-4 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="brand-wordmark text-2xl">kunren</p>
            <p className="font-semibold text-white/70">Bangun ritme. Jaga fokus. Evaluasi progres.</p>
          </div>
          <div className="flex gap-5 font-bold text-white/80">
            <a href="#features">Fitur</a>
            <a href="#how">Cara Kerja</a>
            <a href="/login">Masuk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
