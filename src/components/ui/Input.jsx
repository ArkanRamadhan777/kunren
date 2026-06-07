export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      {label ? <span className="brutal-label">{label}</span> : null}
      <input className="brutal-input" {...props} />
      {error ? <span className="text-sm font-bold text-structly-orange">{error}</span> : null}
    </label>
  );
}
