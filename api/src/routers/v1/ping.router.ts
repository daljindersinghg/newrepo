
import express from 'express';
import { pingHandler } from '../../controllers/ping.controller';


const pingRouter = express.Router();

// For GET requests, we don't need body validation
pingRouter.get('/', pingHandler);

// If you want body validation for POST requests, use this instead:
// pingRouter.post('/', validateRequestBody(pingSchema), pingHandler);

pingRouter.get('/health', (req, res) => {
    res.status(200).send('OK');
});

export default pingRouter;