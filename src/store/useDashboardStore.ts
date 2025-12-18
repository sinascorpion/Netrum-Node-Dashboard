import { create } from 'zustand';
import { NetrumAPI, ActiveNode, NetworkStats, ServiceStatus, SystemRequirements } from '@/lib/api/netrumApi';

type NodeData = {
  id: string;
  address?: string;
  identity?: ActiveNode | null;
  status: any;
  mining: any;
  cooldown: any;
  claim: any;
  log: any;
};

type DashboardState = {
  // Data
  serviceStatus: ServiceStatus | null;
  networkStats: NetworkStats | null;
  activeNodes: ActiveNode[] | null;
  systemRequirements: SystemRequirements | null;
  selectedNode: NodeData | null;
  registrationStatus: any | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  apiConnectionStatus: 'online' | 'offline' | 'checking';

  // Actions
  checkApiConnection: () => Promise<boolean>;
  loadServiceStatus: () => Promise<void>;
  loadNetworkStats: () => Promise<void>;
  loadActiveNodes: () => Promise<void>;
  loadSystemRequirements: () => Promise<void>;
  loadRegistrationStatus: () => Promise<void>;
  loadNetworkOverview: () => Promise<void>;
  loadNodeDetails: (nodeId: string, nodeAddress?: string) => Promise<void>;
  clearError: () => void;
  getCachedActiveNodes: () => ActiveNode[];
  findNodeById: (nodeId: string) => ActiveNode | null;
  findNodeByAddress: (address: string) => ActiveNode | null;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  serviceStatus: null,
  networkStats: null,
  activeNodes: null,
  systemRequirements: null,
  selectedNode: null,
  registrationStatus: null,
  loading: false,
  error: null,
  lastUpdated: null,
  apiConnectionStatus: 'checking',

  clearError: () => set({ error: null }),

  checkApiConnection: async () => {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        set({ apiConnectionStatus: 'offline' });
        return false;
      }
      
      set({ apiConnectionStatus: 'checking' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds

      try {
        const response = await fetch('https://node.netrumlabs.dev/', {
          signal: controller.signal,
          method: 'GET',
          headers: {
            // NOTE: Avoid Content-Type on GET to prevent unnecessary CORS preflight.
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          set({ apiConnectionStatus: 'online' });
          return true;
        } else {
          // Even if not OK, if we got a response, the API is reachable
          set({ apiConnectionStatus: 'online' });
          return true;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('API connection check failed:', err);
        // Set to online anyway and try to load data - the API might work
        set({ apiConnectionStatus: 'online' });
        return true;
      }
    } catch (err) {
      console.error('Connection check error:', err);
      set({ apiConnectionStatus: 'online' });
      return true;
    }
  },

  loadServiceStatus: async () => {
    try {
      const status = await NetrumAPI.getServiceStatus();
      set({ serviceStatus: status });
    } catch (err) {
      console.error('Failed to load service status:', err);
    }
  },

  loadNetworkStats: async () => {
    try {
      const stats = await NetrumAPI.getNetworkStats();
      set({ networkStats: stats, lastUpdated: new Date() });
    } catch (err) {
      console.error('Failed to load network stats:', err);
    }
  },

  loadActiveNodes: async () => {
    try {
      const response = await NetrumAPI.getActiveNodes();
      const nodes = Array.isArray(response) ? response : 
                   (response?.nodes) ? response.nodes : 
                   (response?.data) ? response.data : [];
      set({ activeNodes: nodes });
    } catch (err) {
      console.error('Failed to load active nodes:', err);
    }
  },

  loadSystemRequirements: async () => {
    try {
      const requirements = await NetrumAPI.getRequirements();
      set({ systemRequirements: requirements });
    } catch (err) {
      console.error('Failed to load system requirements:', err);
    }
  },

  loadRegistrationStatus: async () => {
    try {
      const status = await NetrumAPI.getRegistrationStatus();
      set({ registrationStatus: status });
    } catch (err) {
      console.error('Failed to load registration status:', err);
    }
  },

  loadNetworkOverview: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().loadServiceStatus(),
        get().loadNetworkStats(),
        get().loadActiveNodes(),
        get().loadSystemRequirements(),
        get().loadRegistrationStatus(),
      ]);
      set({ loading: false, lastUpdated: new Date() });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  getCachedActiveNodes: () => {
    return get().activeNodes || [];
  },

  findNodeById: (nodeId: string) => {
    const nodes = get().activeNodes || [];
    return nodes.find((node) =>
      (node.nodeId && node.nodeId.toLowerCase() === nodeId.toLowerCase()) ||
      (node.id && node.id.toLowerCase() === nodeId.toLowerCase())
    ) || null;
  },

  findNodeByAddress: (address: string) => {
    const nodes = get().activeNodes || [];
    return nodes.find((node) =>
      (node.wallet && node.wallet.toLowerCase() === address.toLowerCase()) ||
      (node.address && node.address.toLowerCase() === address.toLowerCase())
    ) || null;
  },

  loadNodeDetails: async (nodeId: string, nodeAddress?: string) => {
    set({ loading: true, error: null, selectedNode: null });

    try {
      let finalNodeId = nodeId;
      let finalAddress = nodeAddress;
      const isAddress = /^0x[a-fA-F0-9]{40}$/.test(nodeId);

      if (isAddress) {
        finalAddress = nodeId;
        finalNodeId = nodeAddress || '';
      }

      // Try to find node info from cache
      let cachedNode: ActiveNode | null = null;
      if (finalNodeId) {
        cachedNode = get().findNodeById(finalNodeId);
        if (cachedNode && !finalAddress) {
          finalAddress = cachedNode.wallet || cachedNode.address;
        }
      }

      if (finalAddress && !finalNodeId) {
        cachedNode = get().findNodeByAddress(finalAddress);
        if (cachedNode) {
          finalNodeId = cachedNode.nodeId || cachedNode.id || '';
        }
      }

      const promises: Array<Promise<any>> = [];

      // Node statistics: /metrics/node-status is currently 500; use polling stats instead.
      if (finalNodeId) {
        promises.push(
          NetrumAPI.getPollingNodeStats(finalNodeId).catch(() => null),
          NetrumAPI.getMiningStatus(finalNodeId).catch(() => null),
          NetrumAPI.getCooldown(finalNodeId).catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null), Promise.resolve(null), Promise.resolve(null));
      }

      if (finalAddress) {
        promises.push(
          NetrumAPI.getClaimStatus(finalAddress).catch(() => null),
          NetrumAPI.getLiveLog(finalAddress).catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null), Promise.resolve(null));
      }

      const [status, mining, cooldown, claim, log] = await Promise.all(promises);

      set({
        selectedNode: {
          id: finalNodeId || '',
          address: finalAddress || '',
          identity: cachedNode,
          status,
          mining,
          cooldown,
          claim,
          log,
        },
        loading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (err: any) {
      set({
        error: 'Failed to load node details',
        loading: false,
        selectedNode: null,
      });
    }
  },
}));
