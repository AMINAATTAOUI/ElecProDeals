/// <reference types="nativewind/types" />

type ColorSchemeSystem = 'light' | 'dark' | 'system';

// Allow className prop on lucide-react-native icons (NativeWind cssInterop)
// and augment missing re-exports in strict moduleResolution: bundler context
declare module 'lucide-react-native' {
  interface LucideProps {
    className?: string;
    strokeWidth?: number | string;
  }
  export type LucideIcon = React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGElement>>;
  // Explicit re-exports of icons used in components/ui/ that may not resolve in bundler mode
  export const AlertCircle: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Bell: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Home: LucideIcon;
  export const Menu: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Settings: LucideIcon;
  export const User: LucideIcon;
  export const WifiOff: LucideIcon;
  export const X: LucideIcon;
}
