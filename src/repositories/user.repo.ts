import { EntityRepository } from 'typeorm';

import { BaseRepository } from './app.repo';
import { User } from '../models/user.model';
// import { User } from '../models/user.model';

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {
  protected model = 'User';

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
