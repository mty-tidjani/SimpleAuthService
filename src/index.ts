import cors from 'cors';
import {json, urlencoded} from 'body-parser';
import { AppRoutes } from './routes/app.routes';
import { dbConnection } from './core/db/connect';

export class AuthAPI {
  config: any;

  app: any;

  constructor(config: any, app: any) {
    this.config = config;
    this.app = app;
  }

  initialise = async () => {
    const { port } = this.config;

    await dbConnection();

    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
    
		// app.use(cookieParser());
		// app.use(helmet());

    this.app.use(cors());
    
    this.app.use('/', new AppRoutes(this.config).init());

    this.app.listen(port, () => {
      console.log(`The Auth Service is running on port ${port}.`);
    });
  }
}
