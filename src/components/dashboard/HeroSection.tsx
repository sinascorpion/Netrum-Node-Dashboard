import { Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative text-center py-12 md:py-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-foreground">Netrum Lite </span>
          <span className="gradient-text">Node Monitor</span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join the decentralized future. Monitor network performance, track active participants, 
          and verify your node status.
        </p>
      </div>
    </div>
  );
}
