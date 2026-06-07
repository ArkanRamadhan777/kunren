import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function PasswordInput({ label = 'Password', className = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="brutal-label">{label}</span>
      <div className="relative">
        <input className="brutal-input pr-14" type={visible ? 'text' : 'password'} {...props} />
        <button
          type="button"
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md border-2 border-structly-black bg-white shadow-brutal-sm transition hover:-translate-y-[calc(50%+2px)]"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
