import { SiteHeader } from "@/components/SiteHeader";
import { TripView } from "@/components/TripView";

export default function TripPage({ params }: { params: { id: string } }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <TripView tripId={params.id} />
      </main>
    </>
  );
}
