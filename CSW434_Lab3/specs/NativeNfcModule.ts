import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Exercise 1: NFC Reader
  isSupported(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  startReading(): Promise<{
    success: boolean;
    payload?: string;
    error?: string;
  }>;
  stopReading(): Promise<boolean>;
  // Exercise 2: Magnetometer Compass
  startCompass(): void;
  stopCompass(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeNfcModule');
