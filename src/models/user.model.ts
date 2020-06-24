import { Entity, Column, OneToOne } from 'typeorm';
import { Auth } from './auth.model';
import { ModelEntity } from './app.model';

@Entity({ name: 'clients' })
export class User extends ModelEntity {

  // @OneToOne(type => Auth, auth => auth.id, { nullable: true })
  // auth: Auth;

  @Column({ name: 'username', nullable: false })
  username: string;

  @Column({ name: 'public_name', nullable: false })
  publicName: string;

  @Column({ name: 'api_token', nullable: false })
  apiToken: string;

  // @Column({ name: '', default: null })
  // sensitivity: string;

  @Column({ nullable: true })
  phoneNumber: string;

}
