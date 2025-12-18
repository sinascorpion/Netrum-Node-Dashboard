import { useState, useMemo, useCallback, useRef } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { ActiveNode } from '@/lib/api/netrumApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveNodesTableProps {
  onNodeClick?: (nodeId: string, walletAddress?: string) => void;
}

export default function ActiveNodesTable({ onNodeClick }: ActiveNodesTableProps) {
  const { activeNodes, loading } = useDashboardStore();
  const [currentPage, setCurrentPage] = useState(1);
  const nodesPerPage = 10;

  const [hoveredNode, setHoveredNode] = useState<ActiveNode | null>(null);
  const hoveringCardRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  const nodes = activeNodes || [];
  const totalPages = Math.ceil(nodes.length / nodesPerPage);

  const currentNodes = useMemo(() => {
    const startIndex = (currentPage - 1) * nodesPerPage;
    return nodes.slice(startIndex, startIndex + nodesPerPage);
  }, [nodes, currentPage]);

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return value.toFixed(0);
    return String(value);
  };

  const truncateAddress = (addr: string | undefined): string => {
    if (!addr) return 'N/A';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const truncateNodeId = (nodeId: string | undefined): string => {
    if (!nodeId) return 'N/A';
    if (nodeId.length <= 30) return nodeId;
    // Extract the middle part (name)
    const parts = nodeId.split('.');
    if (parts.length >= 3) {
      const name = parts[2]; // e.g., "shashisshashis" from "netrum.lite.shashisshashis.base.eth"
      return `netrum...${name.slice(0, 10)}...`;
    }
    return `${nodeId.slice(0, 15)}...${nodeId.slice(-10)}`;
  };

  const getStatusBadge = (node: ActiveNode) => {
    const status = node.nodeStatus || node.status;
    const isActive = status === 'Active' || status === 'active' || status === 'online';
    
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/10 text-success border border-success/20">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border/50">
        <XCircle className="w-3 h-3" />
        Idle
      </span>
    );
  };

  const getMetrics = (node: ActiveNode) => {
    const metrics = typeof node.nodeMetrics === 'object' && node.nodeMetrics !== null 
      ? node.nodeMetrics 
      : null;
    return metrics;
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

  const handleExport = (format: 'csv' | 'json') => {
    if (!nodes.length) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(nodes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netrum-nodes-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      const headers = ['Node ID', 'Wallet', 'Type', 'Status', 'Created', 'Last Updated'];
      const csvContent = [
        headers.join(','),
        ...nodes.map(node => [
          node.nodeId || node.id || '',
          node.wallet || node.address || '',
          node.type || 'Lite',
          node.nodeStatus || node.status || 'unknown',
          node.createdAt || '',
          node.lastUpdated || ''
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netrum-nodes-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const NodeTooltipContent = ({ node }: { node: ActiveNode }) => {
    const metrics = getMetrics(node);
    const isActive = node.nodeStatus === 'Active' || node.status === 'active';

    return (
      <div className="p-3 space-y-3 min-w-[280px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Node Details</span>
          {isActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
              <XCircle className="w-3 h-3" />
              Idle
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Node ID:</span>
            <span className="font-mono text-foreground">{truncateAddress(node.nodeId || node.id)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallet:</span>
            <span className="font-mono text-foreground">{truncateAddress(node.wallet || node.address)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="text-foreground">{node.type || 'Lite'}</span>
          </div>
        </div>

        {metrics && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-foreground mb-2">Metrics</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">CPU:</span>
                <span className="text-foreground">{metrics.cpu || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MemoryStick className="w-3 h-3 text-success" />
                <span className="text-muted-foreground">RAM:</span>
                <span className="text-foreground">{metrics.ram ? `${Math.round(metrics.ram / 1024)} GB` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-warning" />
                <span className="text-muted-foreground">Disk:</span>
                <span className="text-foreground">{metrics.disk ? `${metrics.disk} GB` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-info" />
                <span className="text-muted-foreground">Speed:</span>
                <span className="text-foreground">{metrics.speed || 'N/A'} Mbps</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border/50 space-y-1 text-xs">
          {node.lastMiningStart && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last Mining:
              </span>
              <span className="text-foreground">{formatTimestamp(node.lastMiningStart)}</span>
            </div>
          )}
          {node.lastClaimTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Claim:</span>
              <span className="text-foreground">{formatTimestamp(node.lastClaimTime)}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground italic pt-1">
          Click for full details
        </p>
      </div>
    );
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10">
            <Users className="w-5 h-5 text-info" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Network Participants</h2>
            <p className="text-xs text-muted-foreground">Live node activity and performance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('csv')}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('json')}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-4">
        {nodes.length > 0 ? `${nodes.length} nodes active` : 'No active nodes'}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active nodes found</p>
        </div>
      ) : (
        <>
            <div className="rounded-lg border border-border/50 overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Node ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Wallet</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentNodes.map((node, index) => (
                    <TableRow
                      key={node.nodeId || node.id || index}
                      className={cn(
                        "table-row cursor-pointer hover:bg-muted/50 transition-colors",
                        "animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onMouseEnter={() => {
                        if (closeTimerRef.current) {
                          window.clearTimeout(closeTimerRef.current);
                          closeTimerRef.current = null;
                        }
                        setHoveredNode(node);
                      }}
                      onMouseLeave={() => {
                        closeTimerRef.current = window.setTimeout(() => {
                          if (!hoveringCardRef.current) setHoveredNode(null);
                        }, 150);
                      }}
                      onClick={() => {
                        const nodeId = node.nodeId || node.id || '';
                        const walletAddr = node.wallet || node.address;
                        if ((nodeId || walletAddr) && onNodeClick) {
                          onNodeClick(nodeId, walletAddr);
                        }
                      }}
                    >
                      <TableCell className="font-mono text-xs text-foreground">
                        {truncateNodeId(node.nodeId || node.id)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {truncateAddress(node.wallet || node.address)}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        <span className="text-foreground">{node.type || 'Lite'}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(node)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hoveredNode && (
              <div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[min(420px,calc(100vw-2rem))] max-h-[min(70vh,520px)] overflow-auto rounded-md border border-border bg-popover shadow-lg"
                onMouseEnter={() => {
                  hoveringCardRef.current = true;
                  if (closeTimerRef.current) {
                    window.clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  hoveringCardRef.current = false;
                  setHoveredNode(null);
                }}
              >
                <NodeTooltipContent node={hoveredNode} />
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
      )}
    </div>
  );
}