import fs from 'fs';
import path from 'path';
import pino from 'pino';
import config from '../config/config.js';

const logsDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      level: config.logLevel,
      options: { destination: path.join(logsDir, 'app.log') }
    },
    {
      target: 'pino/file',
      level: 'error',
      options: { destination: path.join(logsDir, 'error.log') }
    },
    {
      target: 'pino/file',
      level: config.logLevel,
      options: { destination: 1 }
    }
  ]
});

const logger = pino({
  level: config.logLevel,
  base: { env: config.nodeEnv }
}, transport);

export default logger;
