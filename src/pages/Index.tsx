import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDashboardStore } from '@/store/useDashboardStore';
import TopBanner from '@/components/dashboard/TopBanner';
import Header from '@/components/dashboard/Header';
import HeroSection from '@/components/dashboard/HeroSection';
import NodeSearch from '@/components/dashboard/NodeSearch';
import ServiceStatus from '@/components/dashboard/ServiceStatus';
import SystemRequirements from '@/components/dashboard/SystemRequirements';
import ActiveNodesTable from '@/components/dashboard/ActiveNodesTable';
import Footer from '@/components/dashboard/Footer';

const AUTO_REFRESH_INTERVAL = 300; // 5 minutes in seconds

const Index = () => {
  const { nodeQuery } = useParams();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL);
  const [selectedNodeQuery, setSelectedNodeQuery] = useState<string>('');
  const searchRef = useRef<HTMLDivElement>(null);

  const { loadNetworkOverview, checkApiConnection, apiConnectionStatus, loadNodeDetails } = useDashboardStore();

  // Initial load - always try to load data
  useEffect(() => {
    const initLoad = async () => {
      await checkApiConnection();
      // Always try to load data regardless of connection check result
      loadNetworkOverview();
    };

    initLoad();

    // Setup online/offline listeners
    const handleOnline = () => {
      checkApiConnection();
      loadNetworkOverview();
    };

    const handleOffline = () => {
      checkApiConnection();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Deep-link support: /:nodeQuery - only set query, don't auto-load
  useEffect(() => {
    if (nodeQuery) {
      setSelectedNodeQuery(decodeURIComponent(nodeQuery));
    }
  }, [nodeQuery]);

  // Auto refresh logic - 5 minutes
  useEffect(() => {
    if (!autoRefresh || apiConnectionStatus !== 'online') {
      setCountdown(AUTO_REFRESH_INTERVAL);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadNetworkOverview();
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, apiConnectionStatus, loadNetworkOverview]);

  const handleNodeClick = useCallback(
    async (nodeId: string, walletAddress?: string) => {
      // Scroll to search section
      if (searchRef.current) {
        searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Set the query and load node details
      const query = nodeId || walletAddress || '';
      setSelectedNodeQuery(query);

      // Load the node details
      if (query) {
        await loadNodeDetails(query, walletAddress);
      }
    },
    [loadNodeDetails]
  );

  // Remove handleNodePreview - we don't want to auto-load on hover
  // Only load details when user explicitly clicks

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBanner />
      
      <Header 
        autoRefresh={autoRefresh} 
        setAutoRefresh={setAutoRefresh} 
        countdown={countdown}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <HeroSection />
          
          <div className="space-y-8">
            {/* Search Section */}
            <section id="search-section" ref={searchRef}>
              <NodeSearch key={selectedNodeQuery} initialQuery={selectedNodeQuery} />
            </section>

            {/* Service Status */}
            <section>
              <ServiceStatus />
            </section>

            {/* System Requirements */}
            <section>
              <SystemRequirements />
            </section>

            {/* Active Nodes Table */}
            <section className="overflow-x-auto">
              <ActiveNodesTable onNodeClick={handleNodeClick} />
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
