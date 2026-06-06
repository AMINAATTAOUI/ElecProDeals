/**
 * Module augmentation pour lucide-react-native v0.542.0
 * Certains exports ne sont pas correctement reconnus par TypeScript 5.9.x
 * en raison de la taille du bloc export { ... } du .d.ts (>1.8 MB).
 */

export {};

declare module 'lucide-react-native' {
  // LucideIcon est déclaré dans le module original — TypeScript merge les déclarations
  const Plus: LucideIcon;
  const Trash2: LucideIcon;
  const CircleCheck: LucideIcon;
}
