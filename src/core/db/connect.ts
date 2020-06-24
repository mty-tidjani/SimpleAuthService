import { Connection, createConnection } from 'typeorm';

import logger from '../logger';
import { DB_CONNECT_SUCCESS } from '../../utils/constants';

/**
 * Create the connection to the database
 * @async
 *
 * @return Promise<void>
 */
export const dbConnection = async (): Promise<void> => {
  try {
    const connection: Connection = await createConnection();

    if (connection) {
      logger.info(DB_CONNECT_SUCCESS);
    }
  } catch (err) {
    logger.error(err.stack ? err.stack : err);
  }
};
