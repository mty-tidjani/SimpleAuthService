import { Response, NextFunction, Request } from 'express';

export class MainCtrl {
  static login = (req: Request, res: Response, next: NextFunction) => {
    console.log('r', req.path);
    return res.status(200).json({ data: 'yes' });
  }
}
