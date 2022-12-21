import type { Server, Options as ServerOptions } from './server';
import type { Auth } from './auth';

export type ApplicationServices = { server: Server, auth: Auth };
export type ApplicationOptions = { server: ServerOptions };

type Deps = { infrastructure: Services['infrastructure'], routes: Router };
export function init(deps: Deps, options: ApplicationOptions): Promise<ApplicationServices>;
export function teardown(deps: Services): Promise<void>;