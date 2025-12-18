import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import MiningDebugModal from './MiningDebugModal';

interface HeaderProps {
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  countdown: number;
}

export default function Header({ autoRefresh, setAutoRefresh, countdown }: HeaderProps) {
  const { apiConnectionStatus, checkApiConnection, loadNetworkOverview } = useDashboardStore();

  const handleRefresh = async () => {
    await checkApiConnection();
    await loadNetworkOverview();
  };

  const getStatusConfig = () => {
    switch (apiConnectionStatus) {
      case 'online':
        return {
          icon: CheckCircle2,
          text: 'Online',
          className: 'status-online',
          dotClass: 'bg-success'
        };
      case 'offline':
        return {
          icon: XCircle,
          text: 'Offline',
          className: 'status-offline',
          dotClass: 'bg-destructive'
        };
      default:
        return {
          icon: RefreshCw,
          text: 'Checking...',
          className: 'status-checking',
          dotClass: 'bg-warning animate-pulse'
        };
    }
  };

  const status = getStatusConfig();

  // Format countdown to show minutes and seconds
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Netrum Logo" 
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Netrum</h1>
                  <p className="text-xs text-muted-foreground">Node Dashboard</p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                    status.className
                  )}
                  onClick={handleRefresh}
                  title={apiConnectionStatus === 'online'
                    ? 'Network and API server connection normal'
                    : apiConnectionStatus === 'offline'
                    ? 'Network connection interrupted'
                    : 'Checking network connection status...'
                  }
                >
                  <div className={cn("w-2 h-2 rounded-full", status.dotClass)} />
                  <span>{status.text}</span>
                </div>
              </div>
            </a>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <MiningDebugModal />
            
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-muted accent-primary"
              />
              <span className="hidden sm:inline">Auto Refresh</span>
              <span className="text-xs text-primary font-mono">({countdownDisplay})</span>
            </label>
            
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
