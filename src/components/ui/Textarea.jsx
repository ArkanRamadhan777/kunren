export default function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      {label ? <span className="brutal-label">{label}</span> : null}
      <textarea className="brutal-input min-h-32 resize-y" {...props} />
    </label>
  );
}
