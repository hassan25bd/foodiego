import type { ReactNode } from "react";
import { verifyRole } from "@/lib/dal";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import Interactive3DBackground from "@/app/(main)/vendor/components/Interactive3DBackground";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const session = await verifyRole("restaurant");

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] font-sans">
      <Interactive3DBackground />
      <div className="relative z-10 flex h-screen min-h-0">
        <VendorSidebar />
        <div className="flex min-w-0 flex-1 flex-col min-h-0">
          <VendorHeader userName={session.name} userEmail={session.email} />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
