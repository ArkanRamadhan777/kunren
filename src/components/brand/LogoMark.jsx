export default function LogoMark({ className = '' }) {
  return (
    <span
      className={`relative grid place-items-center overflow-hidden rounded-md border-2 border-structly-black bg-structly-pink font-display font-black text-structly-black shadow-brutal-sm ${className}`}
      aria-label="Kunren logo"
    >
      <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-structly-black bg-structly-yellow" />
      <span className="absolute bottom-1 left-1 h-1.5 w-4 rounded-full border border-structly-black bg-structly-blue" />
      <span className="relative z-10 -rotate-6 leading-none">K</span>
    </span>
  );
}
