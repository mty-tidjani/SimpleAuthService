import { Entity, Column, OneToOne } from 'typeorm';
import { User } from './user.model';
import { ModelEntity } from './app.model';

@Entity({ name: 'auth' })
export class Auth extends ModelEntity {

  @OneToOne(type => User, user => user.id, { nullable: false })
  user: User;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'email', nullable: false })
  companyName: string;

  @Column({ name: 'old_password', default: null })
  oldPassword: string;

  @Column({ name: 'password_reset', default: null })
  resetToken: string;

  @Column({ name: 'password_reset_at', default: null })
  tokenRequestedAt: Date;

  @Column({ name: 'activation_token', nullable: false })
  activationToken: string;

}
