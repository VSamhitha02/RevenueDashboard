import Segment from "./Segment";

interface PageProps {
  params: Promise<{
    fseId: string;
    segment: string;
  }>;
  searchParams: Promise<{
    cutoffHour?: string;
  }>;
}

export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const { fseId, segment } = await params;
  const { cutoffHour = "04" } = await searchParams;

  return (
    <Segment
      fseId={fseId}
      selectedSegment={(segment)}
      cutoffHour={Number(cutoffHour)}
    />
  );
}