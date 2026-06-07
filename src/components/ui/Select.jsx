import { ChevronDown } from 'lucide-react';

export default function Select({ label, children, className = '', ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      {label ? <span className="brutal-label">{label}</span> : null}
      <span className="relative block">
        <select className="brutal-input appearance-none pr-12" {...props}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md border-2 border-structly-black bg-structly-yellow">
          <ChevronDown className="h-4 w-4" />
        </span>
      </span>
    </label>
  );
}
