import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import routes from './routes';
import { swaggerSpec } from './config/swagger';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

if (env.nodeEnv !== 'production') {
  app.get('/openapi.json', (_req, res) => {
    res.json(swaggerSpec);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;