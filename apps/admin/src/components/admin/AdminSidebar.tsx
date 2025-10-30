'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FlagIcon,
  HeartIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon },
  { name: 'Billing', href: '/billing', icon: CurrencyDollarIcon },
  { name: 'Events', href: '/events', icon: ChartBarIcon },
  { name: 'Feature Flags', href: '/flags', icon: FlagIcon },
  { name: 'UI Control', href: '/ui-control', icon: PaintBrushIcon },
  { name: 'System Health', href: '/health', icon: HeartIcon },
  { name: 'Audit Logs', href: '/audit', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-admin-dark-light flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">PawfectMatch</h1>
        <p className="text-sm text-gray-400">Admin Console</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-admin-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
