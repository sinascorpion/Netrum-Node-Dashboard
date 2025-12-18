import { useDashboardStore } from '@/store/useDashboardStore';
import { Cpu, HardDrive, MemoryStick, Wifi, Zap } from 'lucide-react';

export default function SystemRequirements() {
  const { systemRequirements, apiConnectionStatus, networkStats } = useDashboardStore();

  const reqs = (systemRequirements as any)?.requirements || systemRequirements;

  const requirements = [
    {
      label: 'Minimum RAM',
      value: reqs?.RAM ? `${reqs.RAM} GB` : reqs?.minRam ? `${reqs.minRam} GB` : '4 GB',
      icon: MemoryStick,
    },
    {
      label: 'Minimum CPU',
      value: reqs?.CORES ? `${reqs.CORES} Cores` : reqs?.minCpu ? `${reqs.minCpu} Cores` : '2 Cores',
      icon: Cpu,
    },
    {
      label: 'Storage',
      value: reqs?.STORAGE ? `${reqs.STORAGE} GB` : reqs?.minStorage ? `${reqs.minStorage} GB` : '50 GB',
      icon: HardDrive,
    },
    {
      label: 'Network Speed',
      value: reqs?.DOWNLOAD_SPEED ? `${reqs.DOWNLOAD_SPEED} Mbps` : reqs?.minBandwidth ? `${reqs.minBandwidth} Mbps` : '5 Mbps',
      icon: Wifi,
    },
  ];

  // Use networkStats.stats.activeNodes for accurate count
  const stats = networkStats?.stats || networkStats;
  const nodeCount = stats?.activeNodes || 0;

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-muted">
          <Cpu className="w-5 h-5 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">System Requirements</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {requirements.map((req, index) => {
          const Icon = req.icon;
          return (
            <div 
              key={req.label}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{req.label}</span>
              </div>
              <span className="text-sm font-mono font-semibold text-foreground">{req.value}</span>
            </div>
          );
        })}
      </div>

      {/* Network Stability Indicator */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Network Stability</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {apiConnectionStatus === 'online' && nodeCount > 0
            ? `The network is currently operating at peak efficiency with ${nodeCount} active nodes verified in real-time.`
            : apiConnectionStatus === 'online'
            ? 'Network is online. Loading node statistics...'
            : 'Network status unavailable. Please check your connection.'
          }
        </p>
      </div>
    </div>
  );
}
