export enum AttackType {
  HTTP = 'HTTP',
  SYN = 'SYN',
  UDP = 'UDP',
  MIX = 'MIX'
}

export interface SimulationState {
  isRunning: boolean;
  intensity: number; // 1-10
  attackType: AttackType;
  defenses: {
    firewall: boolean;
    rateLimiting: boolean;
    loadBalancer: boolean;
  };
  stats: {
    pps: number;
    blockedPercent: number;
    serverLoad: number; // 0-100
    requestsHandled: number;
  };
}

export const COLORS = {
  HTTP: '#007AFF', // iOS Blue
  SYN: '#AF52DE', // iOS Purple
  UDP: '#FF3B30', // iOS Red
  SAFE: '#34C759', // iOS Green
  BG: '#F2F2F7',
  CARD: 'rgba(255, 255, 255, 0.8)',
};