import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';

import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
// import { posthog } from './posthog';
import { initDB } from './config/db';
import cors from 'cors';


const app = express();

// Allow all CORS
app.use(cors());

// Initialize database connection


app.use(express.json());


/**
 * Registering all the routers and their corresponding routes with out app server object.
 */
app.use((req, res, next) => {
const userId = Array.isArray(req.headers['x-user-id'])
  ? req.headers['x-user-id'][0]
  : req.headers['x-user-id'];

if (userId) {
  // posthog.identify({ distinctId: userId });
}
    next();
  });


app.get('/test-posthog',async(req, res) => {
  // Use a static test distinctId or generate one
  const testDistinctId = 'test-user-1ww23';
  
  // Send a sample event
  // await posthog.capture({
  //   distinctId: testDistinctId,
  //   event: 'test_event',
  //   properties: {
  //     sampleProperty: 'testing',
  //     timestamp: new Date().toISOString(),
  //   },
  // });

  res.json({ message: 'Test event sent to PostHog', distinctId: testDistinctId });
});

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);



/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    initDB();
    logger.info(`Press Ctrl+C to stop the server.`);
});
