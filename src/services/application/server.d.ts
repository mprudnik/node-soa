import type {
  FastifyInstance,
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  FastifyServerOptions,
} from "fastify";
import type { FastifyCorsOptions } from '@fastify/cors'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

export type Server = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  JsonSchemaToTsProvider
>;

export type InitDeps = {
  infrastructure: Services['infrastructure'],
  application: Omit<Services['application'], 'server'>,
  routes: Router
};
export type TeardownDeps = { server: Server, logger: Services['infrastructure']['logger'] };
export type Options = {
  host: string;
  port: number;
  instance?: FastifyServerOptions;
  cors?: FastifyCorsOptions;
};
export function init(deps: InitDeps, options: Options): Promise<Server>;
export function teardown(deps: TeardownDeps): Promise<void>;