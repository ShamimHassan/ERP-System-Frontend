export default function QuotationDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Quotation Detail
      </h1>
      <p className="mt-2 text-sm text-slate-500">ID: {params.id}</p>
    </main>
  );
}
