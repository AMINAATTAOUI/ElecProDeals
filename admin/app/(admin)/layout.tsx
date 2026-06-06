import { Sidebar } from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-zinc-950 p-8">
        {children}
      </main>
    </div>
  );
}
