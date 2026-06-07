import { toISODate } from './date';

export const monthNames = [
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

export const weekLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const holidayEvents = {
  '2026-01-01': { type: 'libur', label: 'Tahun Baru Masehi' },
  '2026-01-16': { type: 'libur', label: 'Isra Mikraj' },
  '2026-02-16': { type: 'cuti', label: 'Cuti Bersama Imlek' },
  '2026-02-17': { type: 'libur', label: 'Tahun Baru Imlek' },
  '2026-03-18': { type: 'cuti', label: 'Cuti Bersama Nyepi' },
  '2026-03-19': { type: 'libur', label: 'Nyepi' },
  '2026-03-20': { type: 'cuti', label: 'Cuti Bersama Idulfitri' },
  '2026-03-21': { type: 'libur', label: 'Idulfitri' },
  '2026-03-22': { type: 'libur', label: 'Idulfitri' },
  '2026-03-23': { type: 'cuti', label: 'Cuti Bersama Idulfitri' },
  '2026-03-24': { type: 'cuti', label: 'Cuti Bersama Idulfitri' },
  '2026-04-03': { type: 'libur', label: 'Wafat Yesus Kristus' },
  '2026-04-05': { type: 'libur', label: 'Paskah' },
  '2026-05-01': { type: 'libur', label: 'Hari Buruh' },
  '2026-05-14': { type: 'libur', label: 'Kenaikan Yesus Kristus' },
  '2026-05-15': { type: 'cuti', label: 'Cuti Bersama Kenaikan' },
  '2026-05-27': { type: 'libur', label: 'Iduladha' },
  '2026-05-28': { type: 'cuti', label: 'Cuti Bersama Iduladha' },
  '2026-05-31': { type: 'libur', label: 'Waisak' },
  '2026-06-01': { type: 'libur', label: 'Hari Lahir Pancasila' },
  '2026-06-16': { type: 'libur', label: 'Tahun Baru Islam' },
  '2026-08-17': { type: 'libur', label: 'Hari Kemerdekaan RI' },
  '2026-08-25': { type: 'libur', label: 'Maulid Nabi' },
  '2026-12-24': { type: 'cuti', label: 'Cuti Bersama Natal' },
  '2026-12-25': { type: 'libur', label: 'Natal' },
};

const annualEvents = {
  '02-09': { type: 'penting', label: 'Hari Pers Nasional' },
  '04-21': { type: 'penting', label: 'Hari Kartini' },
  '05-02': { type: 'penting', label: 'Hari Pendidikan Nasional' },
  '05-20': { type: 'penting', label: 'Hari Kebangkitan Nasional' },
  '06-01': { type: 'penting', label: 'Hari Lahir Pancasila' },
  '08-17': { type: 'libur', label: 'Hari Kemerdekaan RI' },
  '10-01': { type: 'penting', label: 'Hari Kesaktian Pancasila' },
  '10-28': { type: 'penting', label: 'Hari Sumpah Pemuda' },
  '11-10': { type: 'penting', label: 'Hari Pahlawan' },
  '12-22': { type: 'penting', label: 'Hari Ibu' },
  '12-25': { type: 'libur', label: 'Natal' },
};

export function getMonthDays(anchor) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDate = new Date(year, month, 1);
  const firstDay = firstDate.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function getMonthRange(anchor) {
  return {
    start: toISODate(new Date(anchor.getFullYear(), anchor.getMonth(), 1)),
    end: toISODate(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)),
  };
}

export function getCalendarEvent(date) {
  const iso = toISODate(date);
  return holidayEvents[iso] ?? annualEvents[iso.slice(5)] ?? null;
}

export function getDayKind(date) {
  const event = getCalendarEvent(date);
  if (event?.type === 'libur' || event?.type === 'cuti') return 'Libur';
  if (date.getDay() === 0 || date.getDay() === 6) return 'Weekend';
  return 'Hari biasa';
}
