import {
  Car,
  Film,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  Receipt,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/grocer/i, ShoppingCart],
  [/(dining|restaurant|food|cafe)/i, UtensilsCrossed],
  [/(rent|mortgage|housing)/i, Home],
  [/(fuel|gas|transport|car|uber|taxi)/i, Car],
  [/(movie|entertainment|streaming)/i, Film],
  [/(electric|water|utility|utilities|internet|phone)/i, Zap],
  [/(health|medical|pharmacy|doctor)/i, HeartPulse],
  [/(shopping|retail|clothing)/i, ShoppingBag],
  [/(travel|flight|hotel|vacation)/i, Plane],
  [/(salary|income|payroll)/i, Wallet],
  [/(subscription|membership)/i, Repeat],
  [/(education|school|tuition)/i, GraduationCap],
  [/insurance/i, ShieldCheck],
];

export function getCategoryIcon(categoryName: string | null | undefined): LucideIcon {
  if (!categoryName) return Receipt;
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(categoryName));
  return match ? match[1] : Receipt;
}
