import Segment from "./Segment";

interface PageProps {
  params: Promise<{
    fseId: string;
    segment: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { fseId, segment } = await params;

  console.log({ fseId, segment });

  return (
    <Segment
      fseId={fseId}
      selectedSegment={encodeURIComponent(segment)}
    />
  );
}