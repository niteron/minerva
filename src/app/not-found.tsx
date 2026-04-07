import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-white">Page not found</h1>
      <p className="text-slate-400 text-sm">
        That agent does not exist or the link is invalid.
      </p>
      <Link href="/agents" className="text-sky-400 hover:text-sky-300 text-sm font-medium">
        Back to legal agents
      </Link>
    </div>
  );
}
