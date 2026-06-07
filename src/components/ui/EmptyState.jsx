import { Sparkles } from 'lucide-react';
import Card from './Card';

export default function EmptyState({ title, description, action }) {
  return (
    <Card className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md border-2 border-structly-black bg-structly-yellow shadow-brutal-sm">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-md font-semibold text-neutral-700">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
