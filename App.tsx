import React, { useState, useEffect } from 'react';
import { Shield, Activity, Zap, Server, AlertTriangle, RotateCcw, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttackType, SimulationState } from './types';
import { IOSCard, IOSToggle, IOSSlider, IOSSegmentedControl } from './components/IOSDesign';
import { NetworkVisualizer } from './components/NetworkCanvas';

// Translations / Traducciones
const TEXTS = {
  en: {
    title: "DDoS EduSim",
    subtitle: "Educational Traffic Simulator",
    attackConfig: "Attack Configuration",
    attackVector: "Attack Vector",
    intensity: "Traffic Intensity",
    defenses: "Active Defense Modules",
    firewall: "WAF Shield",
    firewallDesc: "Filters malicious packets at edge.",
    rateLimit: "Rate Limiter",
    rateLimitDesc: "Throttles high-velocity request bursts.",
    loadBalance: "Cluster Load Balancer",
    loadBalanceDesc: "Distributes traffic across nodes.",
    traffic: "Traffic",
    mitigation: "Mitigation",
    cpu: "CPU Load",
    status: "Status",
    serverNormal: "Normal",
    serverStress: "Under Stress",
    serverCritical: "Critical",
    systemFailure: "SYSTEM FAILURE",
    rebooting: "Core services unresponsive...",
    error502: "CRITICAL ERROR: 502",
    educationalNote: {
      http: "Layer 7 attack targeting application resources.",
      syn: "Layer 4 attack exhausting TCP connection slots.",
      udp: "Volumetric attack flooding bandwidth.",
      mix: "Complex multi-vector attack pattern."
    }
  },
  es: {
    title: "Simulador DDoS",
    subtitle: "Simulador de Tráfico Educativo",
    attackConfig: "Configuración de Ataque",
    attackVector: "Vector de Ataque",
    intensity: "Intensidad de Tráfico",
    defenses: "Módulos de Defensa Activa",
    firewall: "Escudo WAF",
    firewallDesc: "Filtra paquetes maliciosos en el perímetro.",
    rateLimit: "Limitador de Tasa",
    rateLimitDesc: "Estrangula ráfagas de alta velocidad.",
    loadBalance: "Balanceador de Carga",
    loadBalanceDesc: "Distribuye tráfico entre múltiples nodos.",
    traffic: "Tráfico",
    mitigation: "Mitigación",
    cpu: "Carga CPU",
    status: "Estado",
    serverNormal: "Normal",
    serverStress: "Bajo Estrés",
    serverCritical: "Crítico",
    systemFailure: "FALLO DEL SISTEMA",
    rebooting: "Servicios principales no responden...",
    error502: "ERROR CRÍTICO: 502",
    educationalNote: {
      http: "Ataque de Capa 7 agotando recursos de la app.",
      syn: "Ataque de Capa 4 agotando conexiones TCP.",
      udp: "Ataque volumétrico saturando el ancho de banda.",
      mix: "Patrón complejo de múltiples vectores."
    }
  }
};

const NoiseOverlay = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.15] z-0 mix-blend-overlay"
    style={{ 
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      backgroundSize: '150px 150px'
    }}
  />
);

const DefenseItem = ({ 
  label, 
  description, 
  isOn, 
  onToggle, 
  icon, 
  colorClass 
}: { 
  label: string, 
  description: string, 
  isOn: boolean, 
  onToggle: () => void, 
  icon: React.ReactNode,
  colorClass: string
}) => (
  <div className="py-3 flex items-center justify-between">
    <div className="flex items-start gap-3 flex-1">
      <div className={`mt-1 p-2 rounded-xl transition-colors duration-300 ${isOn ? colorClass : 'bg-slate-100 text-slate-400'}`}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-800 text-[15px]">{label}</div>
        <div className="text-xs text-slate-500 leading-tight mt-0.5">{description}</div>
      </div>
    </div>
    <div 
        className={`ml-4 w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 ease-in-out cursor-pointer shrink-0 ${isOn ? 'bg-[#34C759]' : 'bg-[#E9E9EA]'}`}
        onClick={onToggle}
      >
        <motion.div
          className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)] border-[0.5px] border-black/5"
          animate={{ x: isOn ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </div>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const t = TEXTS[lang];

  const [simState, setSimState] = useState<SimulationState>({
    isRunning: true,
    intensity: 1,
    attackType: AttackType.HTTP,
    defenses: {
      firewall: false,
      rateLimiting: false,
      loadBalancer: false,
    },
    stats: {
      pps: 0,
      blockedPercent: 0,
      serverLoad: 0,
      requestsHandled: 0,
    }
  });

  const [isCrashed, setIsCrashed] = useState(false);

  useEffect(() => {
    if (simState.stats.serverLoad >= 99 && !isCrashed) {
      setIsCrashed(true);
    } else if (simState.stats.serverLoad < 80 && isCrashed) {
      setIsCrashed(false);
    }
  }, [simState.stats.serverLoad, isCrashed]);

  const updateDefenses = (key: keyof SimulationState['defenses']) => {
    setSimState(prev => ({
      ...prev,
      defenses: {
        ...prev.defenses,
        [key]: !prev.defenses[key]
      }
    }));
  };

  const updateStats = (newStats: Partial<SimulationState['stats']>) => {
    setSimState(prev => {
      const actualLoad = newStats.serverLoad ?? prev.stats.serverLoad;
      const displayLoad = isCrashed ? 100 : actualLoad;
      return {
        ...prev,
        stats: { ...prev.stats, ...newStats, serverLoad: displayLoad }
      };
    });
  };

  const getStatusColor = (load: number) => {
    if (load < 50) return "text-green-500";
    if (load < 85) return "text-yellow-500";
    return "text-red-600";
  };

  const getStatusText = (load: number) => {
    if (load < 50) return t.serverNormal;
    if (load < 85) return t.serverStress;
    return t.serverCritical;
  };

  const getNote = () => {
    switch(simState.attackType) {
      case AttackType.HTTP: return t.educationalNote.http;
      case AttackType.SYN: return t.educationalNote.syn;
      case AttackType.UDP: return t.educationalNote.udp;
      case AttackType.MIX: return t.educationalNote.mix;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 gap-4 bg-[#F2F2F7] font-sans overflow-hidden transition-colors duration-500">
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setLang(l => l === 'en' ? 'es' : 'en')}
          className="bg-white/80 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200 hover:bg-white hover:scale-105 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Globe size={12} />
          {lang.toUpperCase()}
        </button>
      </div>

      {/* Left Column: Controls */}
      <div className="w-full md:w-[400px] flex flex-col gap-4 shrink-0 z-10 h-full overflow-y-auto pb-20 md:pb-0">
        <div className="px-2 pt-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.title}</h1>
          <p className="text-slate-500 text-sm font-medium">{t.subtitle}</p>
        </div>

        {/* Attack Configuration */}
        <IOSCard title={t.attackConfig}>
          <div className="space-y-6 transition-all duration-500">
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">{t.attackVector}</label>
              <IOSSegmentedControl 
                selected={simState.attackType}
                onChange={(val) => setSimState(prev => ({ ...prev, attackType: val as AttackType }))}
                options={[
                  { value: AttackType.HTTP, label: 'HTTP' },
                  { value: AttackType.SYN, label: 'SYN' },
                  { value: AttackType.UDP, label: 'UDP' },
                  { value: AttackType.MIX, label: 'MIX' },
                ]}
              />
            </div>

            <IOSSlider 
              label={t.intensity}
              value={simState.intensity}
              min={1}
              max={10}
              onChange={(val) => setSimState(prev => ({ ...prev, intensity: val }))}
            />

            <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-3 border border-blue-100/50">
               <div className="mt-0.5 text-blue-500"><Zap size={18} /></div>
               <p className="text-xs text-blue-700 leading-relaxed font-medium">
                 {getNote()}
               </p>
            </div>
          </div>
        </IOSCard>

        {/* Defenses */}
        <IOSCard title={t.defenses}>
           <div className="divide-y divide-slate-100 transition-all duration-500">
            <DefenseItem 
              label={t.firewall}
              description={t.firewallDesc}
              isOn={simState.defenses.firewall}
              onToggle={() => updateDefenses('firewall')}
              icon={<Shield size={20} />}
              colorClass="bg-blue-100 text-blue-600"
            />
            <DefenseItem 
              label={t.rateLimit}
              description={t.rateLimitDesc}
              isOn={simState.defenses.rateLimiting}
              onToggle={() => updateDefenses('rateLimiting')}
              icon={<Activity size={20} />}
              colorClass="bg-amber-100 text-amber-600"
            />
            <DefenseItem 
              label={t.loadBalance}
              description={t.loadBalanceDesc}
              isOn={simState.defenses.loadBalancer}
              onToggle={() => updateDefenses('loadBalancer')}
              icon={<Server size={20} />}
              colorClass="bg-purple-100 text-purple-600"
            />
          </div>
        </IOSCard>
      </div>

      {/* Right Column: Visualization & Stats */}
      <div className="flex-1 flex flex-col gap-4 h-[calc(100vh-2rem)] min-h-[600px]">
        
        {/* Visualization Area */}
        <motion.div 
          className={`flex-1 rounded-[32px] relative overflow-hidden shadow-inner border transition-all duration-200 ${isCrashed ? 'bg-slate-950 border-red-600/50' : 'bg-slate-900/5 border-slate-200/50'}`}
          animate={isCrashed ? { 
            x: [0, -8, 8, -5, 5, 0],
            y: [0, 6, -6, 4, -4, 0],
            filter: ["contrast(1)", "contrast(1.4) hue-rotate(10deg)", "contrast(1)"]
          } : {}}
          transition={{ duration: 0.15, repeat: isCrashed ? Infinity : 0 }}
        >
          {isCrashed && <NoiseOverlay />}
          
          <div className="absolute inset-0 z-10">
            <NetworkVisualizer state={simState} updateStats={updateStats} />
          </div>
          
          {/* Floating Server Status Label */}
          <AnimatePresence>
            {!isCrashed && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/50 flex items-center gap-2 transition-all duration-300 z-20"
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${simState.stats.serverLoad > 85 ? 'animate-ping bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-xs font-semibold text-slate-700 transition-all">Server: {getStatusText(simState.stats.serverLoad)}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CRASH OVERLAY - SYSTEM FAILURE */}
          <AnimatePresence>
            {isCrashed && (
              <motion.div 
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 pointer-events-none"
              >
                <motion.div
                   animate={{ 
                     scale: [0.98, 1.02, 0.98],
                     borderColor: ['rgba(239,68,68,0.4)', 'rgba(239,68,68,0.9)', 'rgba(239,68,68,0.4)']
                   }}
                   transition={{ repeat: Infinity, duration: 0.5 }}
                   className="bg-black/90 border-2 border-red-500/60 p-8 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center max-w-md mx-6 relative overflow-hidden w-full"
                 >
                    {/* Scanlines effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.7)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-10"></div>
                    
                    <div className="relative z-20 flex flex-col items-center">
                      <motion.div 
                        animate={{ rotate: [0, 10, -10, 0], opacity: [1, 0.7, 1] }}
                        transition={{ repeat: Infinity, duration: 0.15, repeatDelay: Math.random() }}
                        className="text-red-500 mb-6"
                      >
                        <AlertTriangle size={72} strokeWidth={2} />
                      </motion.div>
                      
                      <motion.h2 
                        animate={{ 
                          x: [0, -2, 2, 0],
                          textShadow: [
                            "2px 0px 0px rgba(255,0,0,0.8), -2px 0px 0px rgba(0,0,255,0.8)",
                            "-2px 0px 0px rgba(255,0,0,0.8), 2px 0px 0px rgba(0,0,255,0.8)",
                            "0px 0px 0px rgba(255,0,0,0.8), 0px 0px 0px rgba(0,0,255,0.8)"
                          ]
                        }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                        className="text-4xl font-black text-white mb-3 tracking-tighter font-mono text-red-500"
                      >
                        {t.systemFailure}
                      </motion.h2>
                      
                      <div className="bg-red-600/20 border border-red-500/40 rounded px-4 py-1.5 mb-8 inline-block animate-pulse">
                         <p className="text-red-400 font-mono text-sm font-bold tracking-widest uppercase">
                           {t.error502}
                         </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3 text-slate-400 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <RotateCcw size={14} className="animate-spin" />
                        <span className="font-medium font-mono text-xs">{t.rebooting}</span>
                      </div>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 h-auto md:h-32">
          <IOSCard className="flex flex-col justify-center items-center h-28 md:h-full">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t.traffic}</span>
            <div className="text-2xl font-bold text-slate-800 tabular-nums">{simState.stats.pps} <span className="text-sm font-normal text-slate-400">PPS</span></div>
          </IOSCard>
          
          <IOSCard className="flex flex-col justify-center items-center h-28 md:h-full">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t.mitigation}</span>
            <div className="text-2xl font-bold text-blue-600 tabular-nums">{simState.stats.blockedPercent}%</div>
          </IOSCard>
          
          <IOSCard className="flex flex-col justify-center items-center h-28 md:h-full relative overflow-hidden">
             <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t.cpu}</span>
             <div className={`text-3xl font-black tabular-nums transition-colors duration-300 z-10 ${getStatusColor(simState.stats.serverLoad)}`}>
               {Math.round(simState.stats.serverLoad)}%
             </div>
             {/* CPU Bar */}
             <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden z-10">
                <motion.div 
                  className={`h-full ${simState.stats.serverLoad > 90 ? 'bg-red-600' : 'bg-blue-500'}`}
                  animate={{ width: `${simState.stats.serverLoad}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
             </div>
             {simState.stats.serverLoad > 90 && (
               <motion.div 
                 className="absolute inset-0 bg-red-500/10"
                 animate={{ opacity: [0, 0.5, 0] }}
                 transition={{ repeat: Infinity, duration: 0.5 }}
               />
             )}
          </IOSCard>

          <IOSCard className="flex flex-col justify-center items-center relative overflow-hidden h-28 md:h-full">
             <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t.status}</span>
             <AnimatePresence mode="wait">
               {isCrashed ? (
                 <motion.div
                   key="crash-icon"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1.2, rotate: [0, 15, -15, 0] }}
                   exit={{ scale: 0 }}
                   transition={{ type: "spring", stiffness: 300, damping: 15 }}
                 >
                   <AlertTriangle className="text-red-600 mt-1 drop-shadow-lg" size={32} />
                 </motion.div>
               ) : (
                 <motion.div
                   key="safe-icon"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                 >
                   {simState.stats.serverLoad > 85 ? (
                      <Activity className="text-yellow-500 mt-1" size={32} />
                   ) : (
                      <Shield className="text-green-500 mt-1" size={32} />
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </IOSCard>
        </div>
      </div>
    </div>
  );
};

export default App;
