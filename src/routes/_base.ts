import express, { Router } from 'express';
import { Config } from '../core/config';
export class BaseRouter {
  config: Config;

  router: Router;

  constructor(config: any) {
    this.config = config;
    this.router = express.Router();
  }
}
