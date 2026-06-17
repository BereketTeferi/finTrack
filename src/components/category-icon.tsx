"use client";

import {
  Banknote, Landmark, PiggyBank, CreditCard, Smartphone, Wallet,
  Utensils, Car, ShoppingBag, Film, Receipt, GraduationCap, HeartPulse,
  Home, Plane, Briefcase, Laptop, TrendingUp, Gift, MoreHorizontal,
  Tag as TagIcon, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  banknote: Banknote,
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  wallet: Wallet,
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  film: Film,
  receipt: Receipt,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  home: Home,
  plane: Plane,
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  gift: Gift,
  "more-horizontal": MoreHorizontal,
  tag: TagIcon,
};

export function CategoryIcon({
  name,
  className,
  size = 16,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Icon = ICON_MAP[name] || TagIcon;
  return <Icon className={className} size={size} />;
}
