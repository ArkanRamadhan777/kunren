import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-structly-ink px-4">
      <Card className="max-w-lg bg-white text-center">
        <p className="text-sm font-black uppercase text-structly-blue">404</p>
        <h1 className="mt-2 text-4xl font-black">Halaman tidak ditemukan</h1>
        <p className="mt-3 font-semibold text-neutral-700">Alamat yang kamu buka tidak tersedia atau format tanggalnya tidak valid.</p>
        <Link to="/">
          <Button className="mt-6">Kembali ke Beranda</Button>
        </Link>
      </Card>
    </div>
  );
}
