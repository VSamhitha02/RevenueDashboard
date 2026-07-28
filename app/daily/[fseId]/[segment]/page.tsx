import ItemSegmentDashboard from "@/components/dashboard/ItemSegmentDashboard";
import { getRevenueDashboard } from "@/lib/axios"; // or your API function
import Segment from "./Segment";


interface PageProps {
  params: Promise<{
    fseId: string;
    segment: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { fseId, segment } = await params;

  
  console.log("fseId:", fseId);
  console.log("segment:", segment);
 

  return (
    <Segment
      fseId={fseId}
      segment={decodeURIComponent(segment)}
    />
  );
}