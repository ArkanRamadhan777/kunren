export default function Card({ children, className = '' }) {
  return <div className={`brutal-card animate-fade-up p-4 sm:p-5 ${className}`}>{children}</div>;
}
