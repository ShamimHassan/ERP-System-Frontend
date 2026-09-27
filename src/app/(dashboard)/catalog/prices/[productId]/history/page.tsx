export default function PriceHistoryPage({ params }: { params: { productId: string } }) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Price History
      </h1>
      <p className="mt-2 text-sm text-slate-500">Product ID: {params.productId}</p>
    </main>
  );
}
