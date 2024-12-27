// src/app/types/types.ts
export enum UserSelection {
  AI,
  Compile,
  Deploy,
  Settings,
  Analysis  // Add this new option
}
export interface LogMessage {
  type: 'error' | 'success' | 'info';
  message: string;
  timestamp: Date;
}

export interface ConsolePanelProps {
  logs: LogMessage[];
  onClear: () => void;
}
export type AssistantType = "Neo" | "Solidity";