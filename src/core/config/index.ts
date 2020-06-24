require('dotenv').config();

const { env } = process;

const config: Config = {
  env,
  port: env.APP_PORT,
  routesPrefix: env.ROUTES_PREFIX
}

export type Config = {
  env: NodeJS.ProcessEnv
  port: any,
  routesPrefix: any
}
export default config;
