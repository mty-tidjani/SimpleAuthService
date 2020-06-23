require('dotenv').config();

const { env } = process;

const config: Config = {
  port: env.APP_PORT
}

type Config = {
  port: any
}
export default config;
