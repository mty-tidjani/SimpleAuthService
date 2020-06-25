import { EntityRepository } from 'typeorm';

import { BaseRepository } from './app.repo';
import { Auth } from '../models/auth.model';
// import { User } from '../models/user.model';

@EntityRepository(Auth)
export class AuthRepository extends BaseRepository<Auth> {
  protected model = 'Auth';

  // public findClientByUserId(userId: number): Promise<Client[] | undefined > {
  //   return this.createQueryBuilder('clients')
  //   .innerJoin(query => {
  //     return query.from(User, 'users')
  //     .select(['id', 'client_id']);
  //   },
  //              'users',
  //              'clients.id = users.client_id',
  //   )
  //   .where('users.id = :userId', { userId })
  //   .getMany();
  // }
}
