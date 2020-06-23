import express from 'express';
import { AuthAPI } from '.';
import config from './core/config';

const app = express();

const application = new AuthAPI(config, app);

application.initialise();
