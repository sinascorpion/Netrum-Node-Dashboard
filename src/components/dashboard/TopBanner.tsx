import { Twitter } from 'lucide-react';

export default function TopBanner() {
  return (
    <div className="w-full py-2 bg-primary/10 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">made by:</span>
        <a 
          href="https://x.com/sina_133" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Twitter className="w-4 h-4" />
          @sina_133
        </a>
      </div>
    </div>
  );
}
