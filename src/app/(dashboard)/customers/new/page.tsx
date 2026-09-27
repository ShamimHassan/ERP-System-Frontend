import CustomerForm from "@/components/features/customers/CustomerForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewCustomerPage() {
  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/customers" className="hover:text-slate-900 dark:hover:text-slate-100">Customers</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">New Customer</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        New Customer
      </h1>
      <CustomerForm />
    </div>
  );
}
