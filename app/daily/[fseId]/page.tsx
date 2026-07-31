import Dashboard from "@/components/dashboard/Dashboard";

interface PageProps {
  params: Promise<{
    fseId: string;
  }>;
  searchParams: Promise<{
    cutoffHour?: string;
  }>;
}

export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const { fseId } = await params;
  const { cutoffHour = "04" } = await searchParams;

  return (
    <Dashboard
      fseId={fseId}
      cutoffHour={Number(cutoffHour)}
    />
  );
}