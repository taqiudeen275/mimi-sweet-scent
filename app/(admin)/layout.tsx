import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin — Mimi's Sweet Scent",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>
      <AdminSidebar />
      <div style={{
        paddingLeft: "240px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
        <main style={{ flex: 1, padding: "2.5rem 2.5rem 4rem" }}>{children}</main>
      </div>
    </div>
  );
}
