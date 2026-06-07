import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import LogoMark from '../components/brand/LogoMark';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import StatusMessage from '../components/ui/StatusMessage';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { isConfigured } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.name || !form.email || !form.password) {
      setError('Nama, email, dan password wajib diisi.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (!isConfigured) {
      setError('Supabase belum terhubung. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setMessage('Akun berhasil dibuat. Kalau belum bisa masuk, cek email untuk konfirmasi akun.');
  };

  return (
    <div className="grid min-h-screen place-items-center bg-structly-ink px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        <Link to="/" className="mb-6 inline-flex items-center gap-3">
          <LogoMark className="h-10 w-10 text-2xl" />
          <span className="brand-wordmark text-2xl">kunren</span>
        </Link>
        <h1 className="text-3xl font-black">Mulai dengan sistem yang jelas</h1>
        <p className="mt-2 font-semibold text-neutral-700">Buat plan harian, jaga habit, dan review progres dalam satu tempat.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nama"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nama kamu"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@email.com"
          />
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Minimal 6 karakter"
          />
          <StatusMessage type="error">{error}</StatusMessage>
          <StatusMessage type="success">{message}</StatusMessage>
          <Button type="submit" loading={loading} disabled={loading} className="w-full" variant="orange">
            Mulai Pakai Kunren
          </Button>
        </form>
        <p className="mt-5 text-center font-semibold">
          Sudah punya akun?{' '}
          <Link className="font-black text-structly-blue" to="/login">
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  );
}
