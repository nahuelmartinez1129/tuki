import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
 <div className="min-h-screen bg-tuki-night lg:flex">
  <AdminSidebar />

<main
  className="
    flex-1
    p-4
    pt-24
    sm:p-6
    sm:pt-24
    lg:p-10
    lg:pt-10
  "
>
    {children}
  </main>
</div>
  );
}
