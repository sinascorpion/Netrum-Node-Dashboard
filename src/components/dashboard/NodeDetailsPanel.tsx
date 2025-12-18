import { useDashboardStore } from '@/store/useDashboardStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Activity, 
  Pickaxe, 
  Gift, 
  Timer, 
  FileText,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function NodeDetailsPanel() {
  const { selectedNode } = useDashboardStore();

  if (!selectedNode) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return 'N/A';
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatTimestamp = (timestamp: string | number | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return String(timestamp);
    }
  };

  const formatDurationSeconds = (seconds: number | undefined) => {
    if (!seconds || seconds <= 0) return '0s';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatElapsedTime = (seconds: number | undefined) => {
    if (!seconds || seconds <= 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTokens = (tokens: string | number | undefined) => {
    if (!tokens) return '0';
    const num = typeof tokens === 'string' ? parseFloat(tokens) : tokens;
    if (num > 1e18) return (num / 1e18).toFixed(10);
    return num.toFixed(10);
  };

  const formatSpeed = (speed: number | string | undefined) => {
    if (!speed) return 'N/A';
    const num = typeof speed === 'string' ? parseFloat(speed) : speed;
    return `${num.toFixed(2)} Mbps`;
  };

  const { status, mining, cooldown, claim, log, identity } = selectedNode;

  // Status comes from /polling/node-stats
  const nodeStats = status || {};
  const nodeStatus = nodeStats?.nodeStatus || identity?.nodeStatus || 'Unknown';
  const isActive = nodeStatus === 'Active' || nodeStatus === 'active';

  // System metrics from nodeStats or identity
  const nodeMetrics = nodeStats?.nodeMetrics || identity?.nodeMetrics || {};

  // Mining status from /mining/status
  const miningData = mining || {};
  const miningStatus = miningData?.miningStatus || {};
  const contractDetails = miningData?.contractDetails || {};
  const miningInfo = contractDetails?.miningInfo || {};
  const requirements = miningData?.requirements || {};

  // Claim status from /claim/status
  const claimData = claim || {};
  const miningSession = claimData?.miningSession || {};

  // Cooldown from /mining/cooldown
  const cooldownData = cooldown || {};

  // Log status from /live-log/status
  const logData = log || {};

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Identity Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Identity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Node ID</span>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-foreground truncate">{selectedNode.id || identity?.nodeId || 'N/A'}</p>
              {(selectedNode.id || identity?.nodeId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard((selectedNode.id || identity?.nodeId)!, 'Node ID')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Wallet Address</span>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-foreground">{formatAddress(selectedNode.address || identity?.wallet || identity?.address)}</p>
              {(selectedNode.address || identity?.wallet || identity?.address) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      copyToClipboard((selectedNode.address || identity?.wallet || identity?.address)!, 'Wallet Address')
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <a
                    href={`https://basescan.org/address/${selectedNode.address || identity?.wallet || identity?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Requirements</p>
          <p className="text-sm text-foreground">
            Mining Duration: {requirements?.cooldownPeriod || '24 hours'} | 
            Minimum Tokens: {requirements?.minimumTokens || '> 0'}
          </p>
        </div>
      </Card>

      {/* System Metrics Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Gauge className="w-4 h-4 text-secondary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">System Metrics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">CPU</p>
            <p className="font-semibold text-foreground">{nodeMetrics?.cpu || nodeStats?.cpu || 'N/A'} cores</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">RAM</p>
            <p className="font-semibold text-foreground">{nodeMetrics?.ram || nodeStats?.ram || 'N/A'} MB</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Disk</p>
            <p className="font-semibold text-foreground">{nodeMetrics?.disk || nodeStats?.disk || 'N/A'} GB</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Speed</p>
            <p className="font-semibold text-foreground">
              {formatSpeed(nodeMetrics?.speed || nodeStats?.speed)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Upload</p>
            <p className="font-semibold text-foreground">
              {formatSpeed(nodeMetrics?.upload || nodeStats?.uploadSpeed)}
            </p>
          </div>
        </div>
      </Card>

      {/* Node Statistics Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-info/10">
            <Activity className="w-4 h-4 text-info" />
          </div>
          <h3 className="font-semibold text-foreground">Node Statistics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Node Status</p>
            <div className="flex items-center gap-1">
              {isActive ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="font-semibold text-foreground">{nodeStatus}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="font-semibold text-success">{nodeStats?.uptime || (isActive ? '100.0%' : 'N/A')}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Task Count</p>
            <p className="font-semibold text-foreground">{nodeStats?.taskCount?.toLocaleString() || '0'}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">TTS Power Status</p>
            <p className="font-semibold text-foreground">{nodeStats?.ttsPowerStatus || 'N/A'}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 md:col-span-2">
            <p className="text-xs text-muted-foreground">Current Task</p>
            <p className="font-mono font-semibold text-foreground text-xs truncate">{nodeStats?.currentTask || 'None'}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Task Type</p>
            <p className="font-semibold text-foreground">{nodeStats?.currentTaskType || 'N/A'}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Has Mining Token</p>
            <div className="flex items-center gap-1">
              {nodeStats?.hasMiningToken ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">Yes</p>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-muted-foreground">No</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Task Assigned</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(nodeStats?.lastTaskAssigned)}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Task Completed</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(nodeStats?.lastTaskCompleted)}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Polled</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(nodeStats?.lastPolledAt)}</p>
          </div>
        </div>
      </Card>

      {/* Mining Status Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-warning/10">
            <Pickaxe className="w-4 h-4 text-warning" />
          </div>
          <h3 className="font-semibold text-foreground">Mining Status</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Mining</p>
            <div className="flex items-center gap-1">
              {contractDetails?.isActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">Active</p>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-muted-foreground">Inactive</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Contract</p>
            <div className="flex items-center gap-1">
              {miningStatus?.contractStatus === 'active' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">Active</p>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-muted-foreground">{miningStatus?.contractStatus || 'Inactive'}</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">NPT Balance</p>
            <p className="font-semibold text-success">
              {claimData?.nptBalance 
                ? `${claimData.nptBalance} NPT` 
                : miningData?.nptBalance 
                  ? `${miningData.nptBalance} NPT`
                  : 'N/A'}
            </p>
          </div>


          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Mining Speed</p>
            <p className="font-semibold text-foreground">
              {miningInfo?.speedPerSec 
                ? `${(parseFloat(miningInfo.speedPerSec) / 1e18).toFixed(12)} NPT/s` 
                : claimData?.miningSpeed 
                  ? claimData.miningSpeed 
                  : 'N/A'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Mining</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(miningStatus?.lastMiningStart || identity?.lastMiningStart)}</p>
          </div>
        </div>
      </Card>

      {/* Claim Status Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <Gift className="w-4 h-4 text-success" />
          </div>
          <h3 className="font-semibold text-foreground">Claim Status</h3>
          {claimData && (
            <Badge variant={claimData.canClaim ? 'default' : 'secondary'} className="ml-auto">
              {claimData.canClaim ? '✅ Available' : 'Not ready'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Tokens</p>
            <p className="font-semibold text-success">
              {claimData?.minedTokensFormatted ? `${claimData.minedTokensFormatted} NPT` : '0 NPT'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Fee</p>
            <p className="font-semibold text-foreground">{claimData?.claimFeeETH || '0.00002'} ETH</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Claim</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(claimData?.lastClaimTime)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Next Claim</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(claimData?.nextClaimTime)}</p>
          </div>
        </div>

        {/* Mining Session */}
        {miningSession && (
          <div className="mt-3 p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Mining Session</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className="text-foreground">
                  {miningSession.isComplete ? '✅ Complete' : '⏳ In Progress'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Start: </span>
                <span className="text-foreground text-xs">{formatTimestamp(miningSession.startTime ? miningSession.startTime * 1000 : null)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Elapsed: </span>
                <span className="text-foreground">{formatElapsedTime(miningSession.elapsedTime)}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Cooldown Status Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-info/10">
            <Timer className="w-4 h-4 text-info" />
          </div>
          <h3 className="font-semibold text-foreground">Cooldown Status</h3>
          {cooldownData && (
            <Badge variant={cooldownData.cooldownActive ? 'secondary' : 'default'} className="ml-auto">
              {cooldownData.cooldownActive ? '⏳ On Cooldown' : '✅ Ready'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="flex items-center gap-1">
              {cooldownData?.canStartMining ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">Ready</p>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-warning" />
                  <p className="font-semibold text-warning">Cooling</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Mining</p>
            <div className="flex items-center gap-1">
              {contractDetails?.isActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">Active</p>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-muted-foreground">Inactive</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Mining</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(cooldownData?.lastMiningStart)}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Cooldown Ends</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(cooldownData?.cooldownEndedAt)}</p>
          </div>
        </div>

        {cooldownData?.message && (
          <div className="mt-3 p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="text-sm text-foreground">{cooldownData.message}</p>
          </div>
        )}
      </Card>

      {/* Log Status Section */}
      <Card className="p-4 bg-card border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-muted">
            <FileText className="w-4 h-4 text-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Log Status</h3>
          {logData && (
            <Badge variant={logData.canCheck ? 'default' : 'secondary'} className="ml-auto">
              {logData.canCheck ? '✅ Available' : '⏳ Cooldown'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Logs</p>
            <div className="flex items-center gap-1">
              {logData?.canCheck ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">Available</p>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-warning" />
                  <p className="font-semibold text-warning">Cooldown</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Cooldown</p>
            <p className="font-semibold text-foreground">
              {formatDurationSeconds(logData?.remainingCooldownSeconds)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Last Check</p>
            <p className="font-semibold text-foreground text-xs">{formatTimestamp(logData?.lastCheckTime)}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Cooldown Duration</p>
            <p className="font-semibold text-foreground">
              {logData?.cooldownDuration ? `${Math.floor(logData.cooldownDuration / 60000)} min` : '5 min'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
