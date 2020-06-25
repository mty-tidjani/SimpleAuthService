require('dotenv').config();

const { env } = process;

const config: Config = {
  env,
  port: env.APP_PORT,
  routesPrefix: env.ROUTES_PREFIX,
  logDir: env.LOG_DIR,
  jwtoken: env.JWT_TOKEN,
  jwtExpire: env.JWT_EXPIRE
};

export type Config = {
  env: NodeJS.ProcessEnv
  port: any,
  routesPrefix: any,
  logDir: any,
  jwtoken: any,
  jwtExpire: any
};

export default config;
