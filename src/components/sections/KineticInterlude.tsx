import { VelocityPoster } from './VelocityPoster';
import type { SiteTheme } from '../../data/ialData';

interface KineticInterludeProps {
  theme?: SiteTheme;
  reducedMotion: boolean;
}

export function KineticInterlude({ reducedMotion }: KineticInterludeProps) {
  return <VelocityPoster reducedMotion={reducedMotion} />;
}
