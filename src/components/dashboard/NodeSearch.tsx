import { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import NodeDetailsPanel from './NodeDetailsPanel';

interface NodeSearchProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

export default function NodeSearch({ onSearch, initialQuery }: NodeSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [isSearching, setIsSearching] = useState(false);
  const { loadNodeDetails, selectedNode, loading, error } = useDashboardStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    await loadNodeDetails(searchQuery.trim());
    setIsSearching(false);
    
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    useDashboardStore.setState({ selectedNode: null, error: null });
  };

  // If initialQuery changes, trigger search
  const handleQueryFromTable = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    await loadNodeDetails(query);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Search Node</h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Node ID or Wallet Address"
              className="flex-1 input-search font-mono text-sm pr-8"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSearching || loading || !searchQuery.trim()}
            className="btn-primary px-6"
          >
            {isSearching || loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </form>

        <p className="mt-3 text-xs text-muted-foreground">
          Track your node performance and verify mining status in real-time.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Detailed Node Results - only show after explicit search */}
      {selectedNode && searchQuery.trim() && <NodeDetailsPanel />}
    </div>
  );
}

// Export a function to trigger search from outside
export const triggerNodeSearch = (query: string) => {
  const { loadNodeDetails } = useDashboardStore.getState();
  loadNodeDetails(query);
};
