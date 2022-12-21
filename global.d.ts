import type {
  ApplicationOptions,
  ApplicationServices,
} from './src/services/application';
import type {
  InfrastructureOptions,
  InfrastructureServices,
} from './src/services/infrastructure'

declare global {
  type Config = {
    application: ApplicationOptions;
    infrastructure: InfrastructureOptions;
  };
  type Services = {
    application: ApplicationServices;
    infrastructure: InfrastructureServices;
  }
  type Router = (deps: Services) => Promise<void>;
}