import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-structly-blue text-white hover:-translate-y-0.5',
  orange: 'bg-structly-orange text-structly-black hover:-translate-y-0.5',
  neutral: 'bg-white text-structly-black hover:-translate-y-0.5',
  ghost: 'bg-transparent text-structly-black shadow-none hover:bg-structly-gray',
  danger: 'bg-structly-orange text-white hover:-translate-y-0.5',
};

export default function Button({
  children,
  className = '',
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`interactive-pop inline-flex min-h-11 items-center justify-center gap-2 rounded-md border-2 border-structly-black px-4 py-2 font-black shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
