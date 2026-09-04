/**
 * Kept as its own module for the routes that import it directly.
 * The implementation lives with the other cockpit primitives so the meter
 * and the state chip can never drift apart.
 */
export { PowerMeter as default, PowerMeter, StateChip, STATE_META } from "./primitives";
