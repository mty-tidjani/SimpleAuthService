import { Entity, Column, OneToOne } from 'typeorm';
import { Auth } from './auth.model';
import { ModelEntity } from './app.model';

@Entity({ name: 'users' })
export class User extends ModelEntity {

  @OneToOne(type => Auth, auth => auth.user, { nullable: true })
  auth: Auth;

  @Column({ name: 'username', nullable: false })
  username: string;

  @Column({ name: 'public_name', nullable: false })
  publicName: string;

  @Column({ name: 'email', default: null })
  email: string;

  @Column({ name: 'api_token', nullable: false })
  apiToken: string;

  @Column({ name: 'verified', default: false })
  verified: boolean;

  @Column({ nullable: true })
  phone: string;

}
