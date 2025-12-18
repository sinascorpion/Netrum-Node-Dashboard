import { useDashboardStore } from '@/store/useDashboardStore';

export default function Footer() {
  const { registrationStatus } = useDashboardStore();

  return (
    <footer className="border-t border-border/50 bg-card/30 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm text-muted-foreground">
            Netrum Labs - Lite Node Monitor Dashboard
          </p>
          
          {registrationStatus?.success && (
            <p className="text-center text-xs text-muted-foreground font-mono">
              Netrum on {registrationStatus.network} • $NPT Contract: {registrationStatus.contractAddress}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
