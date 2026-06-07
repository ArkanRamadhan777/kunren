export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-sm font-black uppercase text-structly-blue">{eyebrow}</p> : null}
        <h1 className="break-words text-2xl font-black leading-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl font-semibold text-neutral-700">{description}</p> : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}
