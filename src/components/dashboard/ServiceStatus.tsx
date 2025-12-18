import { useDashboardStore } from '@/store/useDashboardStore';
import { Activity, Server, ServerOff, Layers } from 'lucide-react';

export default function ServiceStatus() {
  const { networkStats, lastUpdated, loading } = useDashboardStore();

  const stats = networkStats?.stats || networkStats;
  const totalNodes = stats?.totalNodes || 0;
  const activeNodes = stats?.activeNodes || 0;
  const inactiveNodes = stats?.inactiveNodes || 0;
  const totalTasks = stats?.totalTasks || 0;
  const activePercentage = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0;

  const statCards = [
    {
      label: 'Total Nodes',
      value: totalNodes.toLocaleString(),
      subValue: `${activePercentage}% Active`,
      icon: Server,
      color: 'text-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Active Nodes',
      value: activeNodes.toLocaleString(),
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Inactive Nodes',
      value: inactiveNodes.toLocaleString(),
      icon: ServerOff,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Total Tasks',
      value: totalTasks.toLocaleString(),
      icon: Layers,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Service Status</h2>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground font-mono">
            Last Update: {lastUpdated.toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-16 mb-2" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </div>
                  {stat.subValue && (
                    <div className="text-xs text-primary mt-1">{stat.subValue}</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
