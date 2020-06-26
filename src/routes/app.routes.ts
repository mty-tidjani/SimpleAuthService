import express, { Response, NextFunction, Request, Router } from 'express';
import { BaseRouter } from './_base';
import { AuthController } from '../controllers/auth.controller';


export class AppRoutes extends BaseRouter {

  init(): Router {
    const prefix = this.config.routesPrefix;

    this.router.post(`${prefix}/register`, AuthController.create);

    this.router.post(`${prefix}/login`, AuthController.login);

    this.router.get(`${prefix}/activate`, AuthController.tokenConfirmation);

    this.router.post(`${prefix}/confirm/account`, AuthController.codeConfirmation);

    this.router.post(`${prefix}/request/password/reset`, AuthController.requestPasswordReset);

    this.router.post(`${prefix}/reset/password`, AuthController.resetPassword);

    this.router.post(`${prefix}/refresh/token`, AuthController.login);

    this.router.post(`${prefix}/forgot/password`, AuthController.login);

    this.router.get('/**', (req: Request, res: Response<any>, next: NextFunction) => {
      res.send('<h1 style="text-align: center;padding-top: 10%"> Usefulreturn Auth API <br /> Version: 1.0.0 </h1>');
    });

    this.router.use('/', (req: Request, res: Response<any>, next: NextFunction) => {
      res.status(404).send(`<h1 style="text-align: center;padding-top: 10%">
      Usefulreturn Auth Service <br /> Error 404: Ressource not found Here! </h1>`);
    });

    return this.router;
  }
}
