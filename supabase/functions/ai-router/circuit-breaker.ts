/**
 * Circuit Breaker — provider health tracking and fast-fail logic.
 * States: CLOSED (healthy) → OPEN (failed 3x, fast-fail) → HALF_OPEN (test one request)
 */

interface CircuitState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailure: number;
  lastSuccess: number;
}

const FAILURE_THRESHOLD = 3;
const RECOVERY_TIMEOUT_MS = 30_000; // 30 seconds

const circuits: Record<string, CircuitState> = {};

function getCircuit(provider: string): CircuitState {
  if (!circuits[provider]) {
    circuits[provider] = { state: 'CLOSED', failures: 0, lastFailure: 0, lastSuccess: Date.now() };
  }
  return circuits[provider];
}

export function isProviderHealthy(provider: string): boolean {
  const circuit = getCircuit(provider);
  if (circuit.state === 'CLOSED') return true;
  if (circuit.state === 'OPEN') {
    if (Date.now() - circuit.lastFailure > RECOVERY_TIMEOUT_MS) {
      circuit.state = 'HALF_OPEN';
      return true; // allow one test request
    }
    return false;
  }
  // HALF_OPEN — allow one request
  return true;
}

export function recordSuccess(provider: string): void {
  const circuit = getCircuit(provider);
  circuit.state = 'CLOSED';
  circuit.failures = 0;
  circuit.lastSuccess = Date.now();
}

export function recordFailure(provider: string): void {
  const circuit = getCircuit(provider);
  circuit.failures++;
  circuit.lastFailure = Date.now();
  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = 'OPEN';
  }
}

export function getHealthStatus(): Record<string, CircuitState> {
  return { ...circuits };
}
