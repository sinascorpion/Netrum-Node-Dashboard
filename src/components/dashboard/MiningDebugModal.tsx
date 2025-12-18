import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Bug, 
  Loader2, 
  Wifi, 
  FileCode2, 
  Wallet, 
  Pickaxe,
  CheckCircle2,
  XCircle,
  Clock,
  Fuel,
  Coins,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { NetrumAPI } from '@/lib/api/netrumApi';
import { toast } from '@/hooks/use-toast';

const COOLDOWN_SECONDS = 30;

interface MiningDebugData {
  success: boolean;
  timestamp: string;
  network: {
    chainId: number;
    networkName: string;
    blockNumber: number;
    gasPrice: string;
    gasPriceGwei: number;
    isConnected: boolean;
  };
  contract: {
    address: string;
    checksumAddress: string;
    isValid: boolean;
    callSuccessful: boolean;
    miningInfo: {
      minedTokens: string;
      minedTokensFormatted: number;
      speedPerSec: string;
      timeRemaining: string;
      timeRemainingHours: number;
      percentComplete: string;
      percentCompleteNumber: number;
      isActive: boolean;
    };
  };
  wallet: {
    inputAddress: string;
    checksumAddress: string;
    balanceWei: string;
    balanceEth: number;
    nonce: number;
    hasMinBalance: boolean;
    minBalanceRequired: string;
    currentBalance: string;
  };
  error?: string;
}

export default function MiningDebugModal() {
  const [open, setOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MiningDebugData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCheck = useCallback(async () => {
    if (!walletAddress.trim()) {
      toast({ title: 'Error', description: 'Please enter a wallet address', variant: 'destructive' });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      toast({ title: 'Error', description: 'Invalid wallet address format', variant: 'destructive' });
      return;
    }

    if (cooldown > 0) {
      toast({ title: 'Cooldown', description: `Please wait ${cooldown}s before checking again` });
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await NetrumAPI.getMiningDebug(walletAddress.trim());
      setData(result);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mining debug info');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, cooldown]);

  const formatGwei = (gwei: number) => {
    if (gwei < 1) return `${(gwei * 1000).toFixed(3)} Mwei`;
    return `${gwei.toFixed(4)} Gwei`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bug className="w-4 h-4" />
          <span className="hidden sm:inline">Mining Debug</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            Mining Status Debug
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input Section */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleCheck} 
              disabled={loading || cooldown > 0}
              className="min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : cooldown > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {cooldown}s
                </span>
              ) : (
                'Check'
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-4 animate-fade-in">
              {/* Network Status */}
              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Wifi className="w-4 h-4 text-info" />
                  </div>
                  <h4 className="font-semibold text-foreground">Network</h4>
                  <Badge variant={data.network.isConnected ? 'default' : 'destructive'} className="ml-auto">
                    {data.network.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Network</p>
                    <p className="font-medium text-sm text-foreground">{data.network.networkName}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Chain ID</p>
                    <p className="font-medium text-sm text-foreground">{data.network.chainId}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Block</p>
                    <p className="font-medium text-sm text-foreground">{data.network.blockNumber.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gas</p>
                      <p className="font-medium text-sm text-foreground">{formatGwei(data.network.gasPriceGwei)}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Mining Status */}
              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Pickaxe className="w-4 h-4 text-warning" />
                  </div>
                  <h4 className="font-semibold text-foreground">Mining Status</h4>
                  <Badge 
                    variant={data.contract.miningInfo.isActive ? 'default' : 'secondary'} 
                    className="ml-auto"
                  >
                    {data.contract.miningInfo.isActive ? (
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      'Inactive'
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Mined Tokens</p>
                    <p className="font-semibold text-primary">{data.contract.miningInfo.minedTokensFormatted.toFixed(4)} NTR</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="font-medium text-sm text-foreground">
                      {(parseFloat(data.contract.miningInfo.speedPerSec) / 1e18).toFixed(8)} /s
                    </p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="font-medium text-sm text-foreground">
                      {(data.contract.miningInfo.percentCompleteNumber / 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 col-span-2 md:col-span-3">
                    <p className="text-xs text-muted-foreground">Time Remaining</p>
                    <p className="font-medium text-sm text-foreground">
                      {data.contract.miningInfo.timeRemainingHours > 0 
                        ? `${data.contract.miningInfo.timeRemainingHours.toFixed(2)} hours`
                        : 'Complete'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                      style={{ width: `${Math.min(100, data.contract.miningInfo.percentCompleteNumber / 100)}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Wallet Status */}
              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Wallet className="w-4 h-4 text-success" />
                  </div>
                  <h4 className="font-semibold text-foreground">Wallet</h4>
                  <Badge 
                    variant={data.wallet.hasMinBalance ? 'default' : 'destructive'} 
                    className="ml-auto"
                  >
                    {data.wallet.hasMinBalance ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sufficient
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Insufficient
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-mono text-xs text-foreground truncate">{data.wallet.checksumAddress}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-semibold text-foreground">{data.wallet.currentBalance}</p>
                    </div>
                  </div>
                </div>

                {!data.wallet.hasMinBalance && (
                  <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    Minimum balance required: {data.wallet.minBalanceRequired}
                  </div>
                )}
              </Card>

              {/* Contract Info */}
              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileCode2 className="w-4 h-4 text-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground">Contract</h4>
                  <Badge variant={data.contract.callSuccessful ? 'default' : 'destructive'} className="ml-auto">
                    {data.contract.callSuccessful ? 'OK' : 'Error'}
                  </Badge>
                </div>

                <div className="p-2 rounded bg-muted/30">
                  <p className="text-xs text-muted-foreground">Contract Address</p>
                  <p className="font-mono text-xs text-foreground break-all">{data.contract.checksumAddress}</p>
                </div>
              </Card>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground text-center">
                Last checked: {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {!data && !error && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Bug className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter a wallet address to check mining status</p>
              <p className="text-xs mt-1">Uses the public debug API to verify mining activity</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
