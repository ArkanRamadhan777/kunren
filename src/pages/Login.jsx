import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import StatusMessage from '../components/ui/StatusMessage';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConfigured } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    if (!isConfigured) {
      setError('Supabase belum terhubung. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(form);
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage('Login berhasil. Dashboard sedang dibuka...');
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-structly-ink px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        <Link to="/" className="mb-6 inline-flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border-2 border-structly-black bg-structly-pink font-black shadow-brutal-sm">
            K
          </span>
          <span className="brand-wordmark text-2xl">kunren</span>
        </Link>
        <h1 className="text-3xl font-black">Masuk ke Kunren</h1>
        <p className="mt-2 font-semibold text-neutral-700">Lanjutkan plan, habit, dan review harianmu.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            placeholder="Password kamu"
          />
          <StatusMessage type="error">{error}</StatusMessage>
          <StatusMessage type="success">{message}</StatusMessage>
          <Button type="submit" loading={loading} disabled={loading} className="w-full">
            Masuk Dashboard
          </Button>
        </form>
        <p className="mt-5 text-center font-semibold">
          Baru mulai pakai Kunren?{' '}
          <Link className="font-black text-structly-blue" to="/register">
            Buat akun
          </Link>
        </p>
      </Card>
    </div>
  );
}
