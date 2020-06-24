import fs from 'fs';
import path from 'path';
import { format, createLogger, transports as trans } from 'winston';
import config from '../config';
require('winston-daily-rotate-file');


const { combine, timestamp, printf } = format;

const myFormat = printf((info: any) => `${info.timestamp}  ${info.level}: ${info.message} ${info.stack ? `Stack: ${info.stack}` : ''}`);
const LOG_DIR = config.logDir;
const logDir = path.join(__dirname, LOG_DIR);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const transports: any = trans;

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat,
  ),
  transports: [
    new transports.File({
      filename: '_error.log',
      level: 'error',
      dirname: logDir,
    }),
    new transports.Console({
      debugStdout: true
    }),
    new transports.DailyRotateFile({
      filename: 'app.log',
      dirname: logDir,
      maxsize: 20971520,
      maxFiles: 25,
      datePattern: 'YYYY_MM_DD',
    }),
  ],
});


export default logger;
