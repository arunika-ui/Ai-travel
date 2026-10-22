"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { TripWorkspace } from "@/components/trip/TripWorkspace";

export default function TripPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      {() => (
        <>
          <SiteHeader />
          <main id="main-content">
            <TripWorkspace tripId={params.id} />
          </main>
          <Footer />
        </>
      )}
    </AuthGuard>
  );
}
