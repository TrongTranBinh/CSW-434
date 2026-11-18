import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  startListening(): void;
  stopListening(): void;
  hasMagnetometer(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeCompassModule');
