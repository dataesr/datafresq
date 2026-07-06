import { createContext, useContext } from 'react';

const ChartContext = createContext<string | undefined>(undefined);

interface ChartContextProviderProps {
  value: string;
  children: React.ReactNode;
}

/**
 * Provides a contextual label (e.g. `"Formation : Licence de biologie"`) that
 * is picked up automatically by every `ChartBox` mounted below, and injected
 * into PNG/PDF exports as subtitle and filename slug.
 *
 * An explicit `context` prop on `ChartBox` always wins over this provider.
 */
export function ChartContextProvider({ value, children }: ChartContextProviderProps) {
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}

export function useChartContext(): string | undefined {
  return useContext(ChartContext);
}
