import Card from '../ui/Card';

export default function MetricCard({ title, value, description, icon: Icon, tone = 'bg-white' }) {
  return (
    <Card className={`${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-black uppercase text-sm text-neutral-600">{title}</p>
          <p className="mt-2 break-words text-3xl font-black">{value}</p>
          {description ? <p className="mt-2 font-semibold text-neutral-700">{description}</p> : null}
        </div>
        {Icon ? (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-structly-black bg-white shadow-brutal-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
