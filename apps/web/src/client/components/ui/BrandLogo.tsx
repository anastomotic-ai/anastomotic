import logoImage from '/assets/anastomotic-icon.png';
import { cn } from '@/lib/utils';

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap', className)}>
      <img src={logoImage} alt="" className="h-7 w-7 shrink-0 object-contain dark:invert" />
      <span className="text-base font-medium tracking-tight text-foreground">Anastomotic</span>
    </span>
  );
}
