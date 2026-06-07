import { Plus, Power, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import StatusMessage from '../components/ui/StatusMessage';
import Textarea from '../components/ui/Textarea';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

export default function LifeRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ rule_title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRules = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('life_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (loadError) setError(loadError.message);
    setRules(data ?? []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.rule_title.trim()) {
      setError('Nama rule wajib diisi.');
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from('life_rules').insert({
      user_id: user.id,
      rule_title: form.rule_title.trim(),
      description: form.description.trim(),
      is_active: true,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm({ rule_title: '', description: '' });
    setSuccess('Rule baru berhasil disimpan.');
    loadRules();
  };

  const toggleRule = async (rule) => {
    const { error: toggleError } = await supabase
      .from('life_rules')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id)
      .eq('user_id', user.id);
    if (toggleError) setError(toggleError.message);
    else loadRules();
  };

  const deleteRule = async (id) => {
    const { error: deleteError } = await supabase.from('life_rules').delete().eq('id', id).eq('user_id', user.id);
    if (deleteError) setError(deleteError.message);
    else {
      setSuccess('Rule sudah dihapus.');
      loadRules();
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Rules"
        title="Tetapkan batas yang menjaga fokus."
        description="Rule membantu kamu mengambil keputusan lebih cepat saat distraksi mulai masuk."
      />

      <div className="grid gap-6 min-[1700px]:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-white">
          <h2 className="text-2xl font-black">Tambah Rule</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nama Rule"
              value={form.rule_title}
              onChange={(event) => setForm({ ...form, rule_title: event.target.value })}
              placeholder="Tidak membuka media sosial sebelum misi utama selesai"
            />
            <Textarea
              label="Deskripsi"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Tulis alasan rule ini penting dan kapan harus dipakai."
            />
            <StatusMessage type="error">{error}</StatusMessage>
            <StatusMessage type="success">{success}</StatusMessage>
            <Button type="submit" loading={saving} disabled={saving} variant="orange" className="w-full">
              <Plus className="h-4 w-4" />
              Simpan Rule
            </Button>
          </form>
        </Card>

        <div>
          {loading ? <StatusMessage>Memuat rule kamu...</StatusMessage> : null}
          {!loading && !rules.length ? (
            <EmptyState title="Belum ada rule" description="Mulai dari satu batas sederhana yang bisa menjaga fokus harianmu." />
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <Card key={rule.id} className={rule.is_active ? 'bg-white' : 'bg-structly-gray opacity-75'}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md border-2 border-structly-black bg-structly-yellow px-2 py-1 text-xs font-black uppercase">
                      {rule.is_active ? 'aktif' : 'nonaktif'}
                    </span>
                    <h3 className="mt-3 text-xl font-black">{rule.rule_title}</h3>
                    <p className="mt-2 font-semibold text-neutral-700">{rule.description || 'Belum ada deskripsi.'}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="neutral" className="h-10 min-h-10 flex-1" onClick={() => toggleRule(rule)}>
                    <Power className="h-4 w-4" />
                    Toggle
                  </Button>
                  <Button variant="danger" className="h-10 min-h-10 px-3" onClick={() => deleteRule(rule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
