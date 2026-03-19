/**
 * Circuit Breaker — provider health tracking and fast-fail logic.
 * States: CLOSED (healthy) → OPEN (failed 3x, fast-fail) → HALF_OPEN (test one request)
 */

interface CircuitState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailure: number;
  lastSuccess: number;
  probeInFlight: boolean;
}

const FAILURE_THRESHOLD = 3;
const RECOVERY_TIMEOUT_MS = 30_000; // 30 seconds

const circuits: Record<string, CircuitState> = {};

function getCircuit(provider: string): CircuitState {
  if (!circuits[provider]) {
    circuits[provider] = { state: 'CLOSED', failures: 0, lastFailure: 0, lastSuccess: Date.now(), probeInFlight: false };
  }
  return circuits[provider];
}

export function isProviderHealthy(provider: string): boolean {
  const circuit = getCircuit(provider);
  if (circuit.state === 'CLOSED') return true;
  if (circuit.state === 'OPEN') {
    if (Date.now() - circuit.lastFailure > RECOVERY_TIMEOUT_MS) {
      circuit.state = 'HALF_OPEN';
      circuit.probeInFlight = true;
      return true; // allow one test request
    }
    return false;
  }
  // HALF_OPEN — allow only one probe at a time
  if (circuit.probeInFlight) return false;
  circuit.probeInFlight = true;
  return true;
}

export function recordSuccess(provider: string): void {
  const circuit = getCircuit(provider);
  circuit.state = 'CLOSED';
  circuit.failures = 0;
  circuit.probeInFlight = false;
  circuit.lastSuccess = Date.now();
}

export function recordFailure(provider: string): void {
  const circuit = getCircuit(provider);
  circuit.failures++;
  circuit.lastFailure = Date.now();
  circuit.probeInFlight = false;
  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = 'OPEN';
  }
}

export function getHealthStatus(): Record<string, CircuitState> {
  return { ...circuits };
}
