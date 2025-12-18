const BASE_URL = 'https://node.netrumlabs.dev';

const cache: Record<string, { data: any; timestamp: number }> = {};
const lastCallTime: Record<string, number> = {};
const RATE_LIMIT_MS = 5_000;
const CACHE_DURATION = 30_000;

export async function fetchWithRateLimit(endpoint: string): Promise<any> {
  const now = Date.now();

  const cached = cache[endpoint];
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (lastCallTime[endpoint] && now - lastCallTime[endpoint] < RATE_LIMIT_MS) {
    if (cached) {
      return cached.data;
    }
    throw new Error(`Rate limit: Please wait ${Math.ceil((RATE_LIMIT_MS - (now - lastCallTime[endpoint])) / 1000)}s`);
  }

  try {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const timeoutDuration = isMobile ? 120_000 : 90_000; // Increased timeouts for slow API

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        // NOTE: Do NOT set Content-Type on GET requests; it triggers a CORS preflight on many servers.
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();

    cache[endpoint] = { data, timestamp: now };
    lastCallTime[endpoint] = now;

    return data;
  } catch (err: any) {
    if (cached) {
      return cached.data;
    }

    if (err.name === 'AbortError') {
      throw new Error('Request timeout: Server took too long to respond');
    }

    throw err;
  }
}

export const NetrumAPI = {
  getServiceStatus: () => fetchWithRateLimit('/'),
  getNetworkStats: () => fetchWithRateLimit('/lite/nodes/stats'),
  getNodeById: (id: string) => fetchWithRateLimit(`/lite/nodes/id/${id}`),
  getActiveNodes: () => fetchWithRateLimit('/lite/nodes/active'),
  getRegistrationStatus: () => fetchWithRateLimit('/register/status'),
  getPollingNodeStats: (id: string) => fetchWithRateLimit(`/polling/node-stats/${id}`),
  getRequirements: () => fetchWithRateLimit('/metrics/requirements'),
  getCheckCooldown: (id: string) => fetchWithRateLimit(`/metrics/check-cooldown/${id}`),
  getNodeStatus: (id: string) => fetchWithRateLimit(`/metrics/node-status/${id}`),
  getMiningStatus: (id: string) => fetchWithRateLimit(`/mining/status/${id}`),
  getMiningDebug: (wallet: string) => fetchWithRateLimit(`/mining/debug/contract/${wallet}`),
  getCooldown: (id: string) => fetchWithRateLimit(`/mining/cooldown/${id}`),
  getLiveLog: (addr: string) => fetchWithRateLimit(`/live-log/status/${addr}`),
  getClaimStatus: (addr: string) => fetchWithRateLimit(`/claim/status/${addr}`),
  getClaimHistory: (addr: string) => fetchWithRateLimit(`/claim/history/${addr}`),
  getSystemInfo: () => fetchWithRateLimit('/system/info'),
  getVersionInfo: () => fetchWithRateLimit('/version'),
};

export type ServiceStatus = {
  success: boolean;
  message: string;
  status?: string;
};

export type NetworkStats = {
  success: boolean;
  message?: string;
  totalNodes?: number;
  activeNodes?: number;
  inactiveNodes?: number;
  totalTasks?: number;
  stats?: {
    totalNodes: number;
    activeNodes: number;
    inactiveNodes: number;
    totalTasks: number;
  };
};

export type ActiveNode = {
  id?: string;
  nodeId?: string;
  address?: string;
  wallet?: string;
  walletAddress?: string;
  status?: string;
  nodeStatus?: any;
  taskCount?: number;
  cpu?: string | number;
  ram?: string | number;
  disk?: string | number;
  speed?: string | number;
  downloadSpeed?: string | number;
  uploadSpeed?: string | number;
  lastPolledAt?: string;
  lastUpdated?: string;
  type?: string;
  createdAt?: string;
  lastMiningStart?: string;
  lastClaimTime?: string;
  nodeMetrics?: {
    cpu?: number;
    ram?: number;
    disk?: number;
    speed?: number;
    lastSeen?: number;
  } | boolean;
  txHash?: string;
  signature?: string;
  timestamp?: number;
};

export type ActiveNodesResponse = {
  success: boolean;
  message?: string;
  nodes?: ActiveNode[];
  data?: ActiveNode[];
  sample?: ActiveNode[];
  count?: number;
};

export type SystemRequirements = {
  success: boolean;
  requirements?: {
    minRam?: number | string;
    minCpu?: number | string;
    minStorage?: number | string;
    minBandwidth?: number | string;
  };
  minRam?: number | string;
  minCpu?: number | string;
  minStorage?: number | string;
  minBandwidth?: number | string;
};
