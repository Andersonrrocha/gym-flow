export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-zinc-900">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          SaaS-ready workout tracking
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">GymFlow</h1>
        <p className="mt-4 text-base text-zinc-600">
          Foundation running with Next.js frontend, NestJS API, GraphQL, and
          Prisma.
        </p>
      </section>
    </main>
  );
}
