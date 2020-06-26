import { getCustomRepository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { User } from '../models/user.model';

import { UserRepository } from '../repositories/user.repo';
import { validate } from 'class-validator';
import { AuthRepository } from '../repositories/auth.repo';
import { Auth } from '../models/auth.model';
import { strRandom, numRandom } from '../utils/helpers';
import config from '../core/config';

class AuthController {

  public static userRepository(): UserRepository {
    return getCustomRepository(UserRepository);
  }

  public static authRepository(): AuthRepository {
    return getCustomRepository(AuthRepository);
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { email, password, username }: any = req.body;

    // Temporary validations
    console.log({ email, password, username });

    if (!email || !password || !username) {
      return res.status(400).send('Bad request');
    }

    // Init user
    const user: User = new User();
    user.email = email;
    user.username = username;
    user.publicName = username?.toLowerCase().split(' ').join('').split('-').join('');
    user.apiToken = `${(new Date()).getFullYear()}_UR_${strRandom()}`;

    // Init user credentials (auth)
    const auth: Auth = new Auth();
    auth.password = bcrypt.hashSync(password);
    auth.email = email;
    auth.activationToken = `UR_${strRandom()}`;
    auth.activationCode = numRandom();

    try {

      // Validade if the parameters are ok
      const errors: any = await validate(user);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const us = await AuthController.userRepository().save(user);

      auth.user = us;

      const ot = await AuthController.authRepository().save(auth);

      const token = jwt.sign(
        { ...us }, config.jwtSecret,
        { expiresIn: config.jwtExpire },
      );

      res.status(201).send({ user, token });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err, body: req.body });
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    // Check if email and password are set
    const { email, password }: any = req.body;

    if (!email || !password) {
      res.status(400).send('Bad Request');
    }
    // Get user from database
    let user: User = new User();
    let auth: Auth = new Auth();

    try {
      auth = await AuthController.authRepository().findOneOrFail({ where: { email }, relations: ['user'] });
      user = auth.user;
    } catch (error) {
      return res.status(401).send('Utilisateur inexistant');
    }

    // Check if encrypted password matchtry {
    console.log({ user, auth });
    if (!bcrypt.compareSync(password, auth.password)) {
      return res.status(401).send('Mot de passe invalide');
    }

    console.log(config.jwtSecret, config.jwtExpire);

    const token = jwt.sign(
      { ...user }, config.jwtSecret,
      { expiresIn: config.jwtExpire },
    );

    res.status(200).send({ user, token });
  }

  public static async tokenConfirmation(req: Request, res: Response): Promise<any> {
    // Get the ID from the url
    const activationToken: any = req.query.token;

    try {

      const auth: Auth | undefined = await AuthController.authRepository().findOne({ where: { activationToken }, relations: ['user'] });

      if (!auth)  return res.status(403).send('Token invalide');

      console.log(auth);

      try {
        const { user } = auth;
        if (user?.verified) return res.status(202).send('Account already activated');

        try {
          user.verified = true;
          await AuthController.userRepository().update(user.id, { verified: true });

          /**
           * TODO SEND EMAIL HERE
           */
          // const subject: any = 'Votre compte a été activé avec succès';

          // const message: any = 'Votre compte a été activé avec succès';

          // const data = {
          //   template: 'account-activated',
          //   userFirstName: user.firstName,
          //   link: '',
          //   recipientEmail: user.email,
          //   senderEmail: user.email
          // };

         // AuthController.sendEmail(data);

          return res.status(200).send(`${user.username}'s account has been verified`);
        } catch (error) {
          return res.status(403).send(error);
        }

      } catch (error) {
        // If not found, send a 404 response
        return res.status(404).send('User not found');
      }
    } catch (error) {
      console.log(error);

      return res.status(403).send(error);
    }
  }

  public static async codeConfirmation(req: Request, res: Response): Promise<any> {
    // Get the ID from the url
    const activationCode: any = req.body.code;

    try {

      const auth: Auth | undefined = await AuthController.authRepository().findOne({ where: { activationCode }, relations: ['user'] });

      if (!auth)  return res.status(403).send('Token invalide');

      console.log(auth);

      try {
        const { user } = auth;
        if (user?.verified) return res.status(202).json({ msg: 'Account already activated' });

        try {
          user.verified = true;
          await AuthController.userRepository().update(user.id, { verified: true });

          /**
           * TODO SEND EMAIL HERE
           */
          // const subject: any = 'Votre compte a été activé avec succès';

          // const message: any = 'Votre compte a été activé avec succès';

          // const data = {
          //   template: 'account-activated',
          //   userFirstName: user.firstName,
          //   link: '',
          //   recipientEmail: user.email,
          //   senderEmail: user.email
          // };

         // AuthController.sendEmail(data);
          const token = jwt.sign(
            { ...user }, config.jwtSecret,
            { expiresIn: config.jwtExpire },
          );

          res.status(201).json({ user, token });
        } catch (error) {
          return res.status(403).send(error);
        }

      } catch (error) {
        return res.status(404).json({ msg: 'User not found' });
      }
    } catch (error) {
      return res.status(403).json(error);
    }
  }

  public static async requestPasswordReset(req: Request, res: Response): Promise<any> {
    // Check if username and password are set
    const email: any = req.body.email;

    if (!email) {
      res.status(400).send('Bad Request');
    }
    let auth: Auth;

    try {
      auth = await AuthController.authRepository().findOneOrFail({ where: { email } });

      if (!auth) return res.status(401).json({ msg: 'Invalid email' });

      await AuthController.authRepository().update(auth.id, { activationCode: numRandom(5)});

      /**
       * Todo send mail here
       */
      return res.status(200).json({ msg: 'Reset code sent by email' });
    } catch (error) {
      res.status(401).send();
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<any> {
    // Check if username and password are set
    const activationCode: any = req.body.code;
    const password: any = req.body.password;

    if (!activationCode || !password) res.status(400).send('Bad Request');

    let auth: Auth | undefined;

    try {
      auth = await AuthController.authRepository().findOne({ where: { activationCode }, relations: ['user'] });

      if (!auth) return res.status(401).json({ msg: 'Incorect code' });

      const encoded = bcrypt.hashSync(password);

      await AuthController.authRepository().update(auth.id, { password: encoded });

      /**
       * Todo send mail here
       */
      const { user } = auth;
      const token = jwt.sign(
        { ...user }, config.jwtSecret,
        { expiresIn: config.jwtExpire },
      );

      res.status(201).json({ user, token });
      return res.status(200).json({ msg: 'Reset code sent by email' });
    } catch (error) {
      res.status(401).send();
    }
  }

  public static async forgottenPassword(req: Request, res: Response): Promise<any> {
    // Get the ID from the url
    return AuthController.requestPasswordReset(req, res);
  }

  public static async refreshToken(req: Request, res: Response): Promise<any> {
    const token = req.body.token;
    if (!token) return res.status(400).json({ msg: 'Token not sent' });

    try {
      const tokan : any = jwt.verify(token, config.jwtSecret, {
        ignoreExpiration: true
      });

      const user: User | undefined = await AuthController.userRepository().findOne(tokan.id);

      if (!user) return res.status(400).json({ msg: 'Invalid token' });

      const tokn = jwt.sign(
        { ...user }, config.jwtSecret,
        { expiresIn: config.jwtExpire },
      );

      res.status(201).send({ token: tokn });
    } catch (err) {
      return res.status(401).json({ err, msg: 'Not authorized' });
    }

    // Get the ID from the url
    return res.status(200).json({ msg: "Lolololololololo" });
  }

  // static sendEmail(data: any) {
  //   axios.default({
  //     method: 'post',
  //     url: MESSAGES_SERVICE_URL + '/v1/mail/send',
  //     data
  //   }).then(res => {
  //     // console.log(res);
  //     console.log('email send succes!!!');
  //   },      err => {
  //     // console.log(err);
  //     console.log('email failed !!!');
  //   });
  // }

}

export { AuthController };
