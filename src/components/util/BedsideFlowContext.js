/* component/util · BedsideFlowContext — Wave 12 ambient microstate bag.

   Bridges useBedsideFlow (which lives in BedsideShell) to descendants
   without prop drilling. Components that want to react to phase, deep
   scroll, deep rest, fresh-type, or finding-applied just consume the
   context with `useBedsideFlowCtx()`.

   The default value returns a no-op bag so non-bedside surfaces that
   happen to render shared components (CaseBar in tests, etc.) keep
   working without needing the provider. */
import { createContext, useContext } from "react";

const _noop = () => {};

const DEFAULT = {
  phase: "applied",
  reducedMotion: false,
  deepScroll: false,
  deepRest: false,
  freshType: false,
  findingApplied: 0,
  notifyTyping: _noop,
  notifyApplied: _noop,
  notifyAwaiting: _noop,
  signalFinding: _noop,
};

export const BedsideFlowContext = createContext(DEFAULT);

export function useBedsideFlowCtx() {
  return useContext(BedsideFlowContext);
}

export default BedsideFlowContext;
