'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0A0A0F] pointer-events-none">
      {/* Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00F5A0]/10 rounded-full blur-[120px] animate-[pulse_8s_infinite_alternate]" />
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] bg-[#38BDF8]/10 rounded-full blur-[150px] animate-[pulse_12s_infinite_alternate-reverse]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[40%] bg-[#8B5CF6]/10 rounded-full blur-[130px] animate-[pulse_10s_infinite_alternate]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-[#FF6B35]/10 rounded-full blur-[100px] animate-[pulse_7s_infinite_alternate-reverse]" />
      </div>

      {/* Tiny Particles / Noise */}
      <div className="absolute inset-0 opacity-[0.03] contrast-150 brightness-100" style={{ backgroundImage: 'url("/noise.svg")' }} />
      
      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
