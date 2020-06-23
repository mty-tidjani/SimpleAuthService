import cors from 'cors';
// import { AppRoutes } from './router/_index';

export class AuthAPI {
  config: any;

  app: any;

  constructor(config: any, app: any) {
    this.config = config;
    this.app = app;
  }

  initialise = () => {
    const { port } = this.config;

    this.app.use(cors());

    // this.app.use('/', new AppRoutes(this.config).initRoutes());

    this.app.listen(port, () => {
      console.log(`The Auth Service is running on port ${port}.`);
    });
  }
}
