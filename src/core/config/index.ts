require('dotenv').config();

const { env } = process;

const config: Config = {
  env,
  port: env.APP_PORT,
  routesPrefix: env.ROUTES_PREFIX,
  logDir: env.LOG_DIR,
  jwtSecret: env.JWT_SECRET,
  jwtExpire: env.JWT_EXPIRE
};

export type Config = {
  env: NodeJS.ProcessEnv
  port: any,
  routesPrefix: any,
  logDir: any,
  jwtSecret: any,
  jwtExpire: any
};

export default config;
