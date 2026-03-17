import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ContinueFromSummaryButtonProps {
  onClick: () => void;
}

export function ContinueFromSummaryButton({ onClick }: ContinueFromSummaryButtonProps) {
  return (
    <Button onClick={onClick} className="btn-cta px-8">
      Confirmar y Pagar
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}
