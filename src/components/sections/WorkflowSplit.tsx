import { TactileTablet } from './TactileTablet';

interface WorkflowSplitProps {
  reducedMotion: boolean;
  onOpenSearch?: (q?: string) => void;
}

export function WorkflowSplit({ reducedMotion }: WorkflowSplitProps) {
  return <TactileTablet reducedMotion={reducedMotion} />;
}
