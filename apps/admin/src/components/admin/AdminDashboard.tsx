'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export function AdminDashboard() {
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/health');
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to PawfectMatch Admin Console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={UsersIcon}
          title="Total Users"
          value={healthData?.health?.metrics?.totalUsers || '0'}
          change="+12%"
        />
        <StatsCard
          icon={ChatBubbleLeftRightIcon}
          title="Active Conversations"
          value="247"
          change="+5%"
        />
        <StatsCard
          icon={CurrencyDollarIcon}
          title="Monthly Revenue"
          value="$24,589"
          change="+18%"
        />
        <StatsCard
          icon={ChartBarIcon}
          title="System Health"
          value={healthData?.health?.database?.status || 'checking...'}
          change="healthy"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-admin-dark-light rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem
            icon="✓"
            action="User updated"
            target="john.doe@example.com"
            time="2 minutes ago"
          />
          <ActivityItem
            icon="💬"
            action="Chat moderated"
            target="Conversation #1247"
            time="15 minutes ago"
          />
          <ActivityItem
            icon="💰"
            action="Payment processed"
            target="Customer #8923"
            time="1 hour ago"
          />
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change: string;
}

function StatsCard({ icon: Icon, title, value, change }: StatsCardProps) {
  return (
    <div className="bg-admin-dark-light rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 text-admin-primary" />
        <span className="text-sm text-green-400">{change}</span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  target: string;
  time: string;
}

function ActivityItem({ icon, action, target, time }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-admin-dark rounded-lg">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{action}</p>
        <p className="text-xs text-gray-400">{target}</p>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}
