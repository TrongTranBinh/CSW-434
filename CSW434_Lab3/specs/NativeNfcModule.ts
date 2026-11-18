import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  isSupported(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  startReading(): Promise<{
    success: boolean;
    payload?: string;
    error?: string;
  }>;
  stopReading(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeNfcModule');
