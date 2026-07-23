import Dashboard from "@/components/dashboard/Dashboard";

interface PageProps {
  params: Promise<{
    fseId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { fseId } = await params;

  return <Dashboard fseId={fseId} />;
}