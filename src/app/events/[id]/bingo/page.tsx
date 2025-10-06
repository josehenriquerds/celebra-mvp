import { BingoShell } from '@/features/bingo/components/BingoShell';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BingoPage({ params }: PageProps) {
  await params;

  return <BingoShell />;
}
