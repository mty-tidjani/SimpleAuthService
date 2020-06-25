import { getCustomRepository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const cryptoRandomString = require('crypto-random-string');

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
        { ...us }, config.jwtoken,
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
    let auth: any = new Auth();

    try {
      user = await AuthController.userRepository().findOneOrFail({ where: { email } });
      auth = await AuthController.authRepository().findOneOrFail({ where: { email } });
    } catch (error) {
      return res.status(401).send('Utilisateur inexistant');
    }

    // Check if encrypted password matchtry {
    console.log({ user, auth });
    if (!bcrypt.compareSync(password, auth.password)) {
      return res.status(401).send('Mot de passe invalide');
    }

    console.log(config.jwtoken, config.jwtExpire);

    const token = jwt.sign(
      { ...user }, config.jwtoken,
      { expiresIn: config.jwtExpire },
    );

    res.status(200).send({ user, token });
  }

  // public static async tokenConfirmation(req: Request, res: Response): Promise<any> {
  //   // Get the ID from the url
  //   const email: any = req.query.email;
  //   const token: any = req.query.token;

  //   try {

  //     const tVerif: any = await AuthController.tokenVerificationRepository().find({ where: { token, isExpired: false } });

  //     if (tVerif === []) {
  //       return res.status(403).send('Token invalide');
  //     }

  //     const tk: any = tVerif[0];

  //     console.log(tk);
  //     if (tk.isExpired) {
  //       return res.status(403).send('Token expiré');
  //     }

  //     const userV: any = await AuthController.userRepository().find({ where: { id: tk.userId } });

  //     if (email !== userV[0].email) {
  //       console.log(email);
  //       console.log(userV[0]);
  //       return res.status(403).send('Verification failed');
  //     }

  //     try {
  //       const userList: User[] = await AuthController.userRepository().find({ where: { email } });

  //       if (userList === []) {
  //         res.status(404).send('User not found');
  //       }

  //       const user: any = userList[0];

  //       if (user.isVerified) {
  //         return res.status(202).send('Email Already Verified');
  //       }
  //       try {
  //         user.isVerified = true;
  //         await AuthController.userRepository().update(user.id, { isVerified: true });
  //         console.log(user);
  //         // tk.isExpired = true;
  //         await AuthController.tokenVerificationRepository().update(tk.id, { isExpired: true });

  //         const subject: any = 'Votre compte a été activé avec succès';

  //         const message: any = 'Votre compte a été activé avec succès';

  //         const data = {
  //           template: 'account-activated',
  //           userFirstName: user.firstName,
  //           link: '',
  //           recipientEmail: user.email,
  //           senderEmail: user.email
  //         };

  //         AuthController.sendEmail(data);
  //         // AuthController.sendEmail('account-activated', user.email, user.firstName, '');
  //         // emailNature: any, recipient: any, fname: any, link: any

  //         return res.status(200).send(`User with ${user.email} has been verified`);
  //       } catch (error) {
  //         console.log('tges');

  //         // return res.status(403).send('Verification failed');
  //         return res.status(403).send(error);
  //       }

  //     } catch (error) {
  //       // If not found, send a 404 response
  //       return res.status(404).send('User not found');
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     return res.status(403).send(error);
  //   }
  // }

  // public static async sendResetPasswordEmail(req: Request, res: Response): Promise<any> {
  //   // Check if username and password are set
  //   const email: any = req.body.email;

  //   if (!email) {
  //     res.status(400).send();
  //   }
  //   let user: User;

  //   try {
  //     user = await AuthController.userRepository().findOneOrFail({ where: { email } });
  //     const vToken: any = new TokenVerification();
  //     const token: any = cryptoRandomString({ length: 16 });

  //     console.log(token);
  //     vToken.token = token;
  //     vToken.user = user;
  //     vToken.isExpired = false;
  //     try {
  //       await AuthController.tokenVerificationRepository().save(vToken);
  //     } catch (e) {
  //       return res.status(409).send('token already in use');
  //     }

  //     const hostUrl: any = WEB_APP_URL + '/new-password';
  //     const to: any = user.email;

  //     const link: any = `${hostUrl}/security?token=${token}&email=${to}`;

  //     const subject: any = 'Confirmez la reinitialisation de votre mot de passe';

  //     // sendVerificationEmail
  //     const data = {
  //       template: 'reset-password',
  //       userFirstName: user.firstName,
  //       link: link,
  //       recipientEmail: user.email,
  //       senderEmail: user.email
  //     };
  //     AuthController.sendEmail(data);

  //     return res.status(200).send();
  //   } catch (error) {
  //     res.status(401).send();
  //   }
  // }

  // public static async forgottenPassword(req: Request, res: Response): Promise<any> {
  //   // Get the ID from the url
  //   const email: any = req.body.email;
  //   const token: any = req.body.token;
  //   const newPassword: any = req.body.newPassword;

  //   try {
  //     const tVerif: any = await AuthController.tokenVerificationRepository().find({ where: { token } });

  //     if (tVerif === []) {
  //       return res.status(403).send('Token invalide');
  //     }
  //     const tk: any = tVerif[0];

  //     console.log(tk);
  //     if ((tk.isExpired) ||
  //       ((new Date()).getTime() - tk.createdAt.getTime() > 1800000)) {
  //       return res.status(403).send('Token expiré');
  //     }
  //     const userV: any = await AuthController.userRepository().findOneOrFail(tk.userId);

  //     if (email !== userV.email) {
  //       return res.status(403).send('Verification failed');
  //     }
  //     try {
  //       const userList: User[] = await AuthController.userRepository().find({ where: { email } });

  //       if (userList === []) {
  //         res.status(404).send('User not found');
  //       }
  //       let user: User = new User();

  //       user = userList[0];
  //       try {
  //         // Validate de model (password lenght)
  //         user.password = newPassword;
  //         const errors: any = await validate(user);

  //         if (errors.length > 0) {
  //           return res.status(400).send(errors);
  //         }
  //         // Hash the new password and save
  //         user.hashPassword();
  //         user.isVerified = true;
  //         AuthController.userRepository().save(user);

  //         tk.isExpired = true;
  //         await AuthController.tokenVerificationRepository().save(tk);

  //         const data = {
  //           template: 'user-password-reset',
  //           userFirstName: user.firstName,
  //           link: '',
  //           recipientEmail: user.email,
  //           senderEmail: user.email
  //         };
  //         AuthController.sendEmail(data);
  //         // emailNature: any, recipient: any, fname: any, link: any


  //         return res.status(200).send('password reset successfull');
  //       } catch (error) {
  //         return res.status(403).send('Verification failed');
  //       }
  //     } catch (error) {
  //       // If not found, send a 404 response
  //       return res.status(404).send('User not found');
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     return res.status(403).send(error);
  //   }
  // }

  // public static async changePassword(req: Request, res: Response): Promise<any> {
  //   // Get ID from JWT

  //   // Get parameters from the body
  //   // tslint:disable-next-line:typedef
  //   const { userId, oldPassword, newPassword }: any = req.body;

  //   if (!(oldPassword && newPassword)) {
  //     res.status(400).send();
  //   }

  //   // Get user from the database
  //   let user: User = new User();

  //   try {
  //     user = await AuthController.userRepository().findOneOrFail(userId);
  //   } catch (id) {
  //     res.status(401).send('utilisateur introuvable');
  //   }

  //   // Check if old password matchs
  //   if (!bcrypt.compareSync(oldPassword, user.password)) {
  //     return res.status(401).send();
  //   }

  //   // Validate de model (password lenght)
  //   user.password = newPassword;
  //   const errors: any = await validate(user);

  //   if (errors.length > 0) {
  //     return res.status(400).send(errors);
  //   }
  //   // Hash the new password and save
  //   user.hashPassword();
  //   AuthController.userRepository().save(user);

  //   const newToken: any = jwt.sign({
  //     userId: user.id,
  //     email: user.email,
  //     discriminator: user.discriminator,
  //   },                             JWT_REFRESH_SECRET, {
  //       expiresIn: JWT_REFRESH_EXPIRE,
  //   });

  //   const data = {
  //     template: 'change-password',
  //     userFirstName: user.firstName,
  //     link: '',
  //     recipientEmail: user.email,
  //     senderEmail: user.email
  //   };

  //   AuthController.sendEmail(data);

  //   res.status(200).send(newToken);
  // }

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
