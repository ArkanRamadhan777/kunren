export default function StatusMessage({ type = 'info', children }) {
  const tone = {
    info: 'bg-white',
    success: 'bg-structly-yellow',
    error: 'bg-structly-pink',
    warning: 'bg-structly-yellow',
  };

  if (!children) return null;

  return (
    <div className={`rounded-md border-2 border-structly-black px-4 py-3 text-sm font-bold ${tone[type]}`}>
      {children}
    </div>
  );
}
