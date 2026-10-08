import React from 'react';
import {
  Store,
  Cake,
  Bike,
  MessageCircle,
  Sparkles,
  Briefcase,
  DollarSign,
  Utensils,
  Package,
  Zap,
  Truck,
  Megaphone,
  Wrench,
  CreditCard,
  Users,
  Home,
  Receipt,
  MoreHorizontal,
  Tag,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  store: Store,
  cake: Cake,
  bike: Bike,
  'message-circle': MessageCircle,
  sparkles: Sparkles,
  briefcase: Briefcase,
  'dollar-sign': DollarSign,
  utensils: Utensils,
  package: Package,
  zap: Zap,
  truck: Truck,
  megaphone: Megaphone,
  wrench: Wrench,
  'credit-card': CreditCard,
  users: Users,
  home: Home,
  receipt: Receipt,
  'more-horizontal': MoreHorizontal,
};

interface CategoryIconProps {
  name?: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'tag',
  color = '#8E8E93',
  size = 20,
  className = '',
}) => {
  const normalizedKey = name.toLowerCase().replace(/_/g, '-');
  const IconComponent = iconMap[normalizedKey] || Tag;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl p-2 transition-transform ${className}`}
      style={{
        backgroundColor: `${color}18`, // 10% opacity background
        color: color,
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};

