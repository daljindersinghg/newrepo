import express from 'express';
import { ReceiptController } from '../../controllers/receipt.controller';
// import { patientAuth } from '../../middleware/auth.middleware'; // Uncomment when auth middleware is available

const receiptRouter = express.Router();

// ============ PROTECTED ROUTES (REQUIRE PATIENT AUTH) ============
// Apply patient authentication to all routes
// receiptRouter.use(patientAuth); // Uncomment when auth middleware is available

// Receipt CRUD operations
receiptRouter.post('/', ReceiptController.createReceipt);
receiptRouter.get('/', ReceiptController.getPatientReceipts);
receiptRouter.get('/stats', ReceiptController.getReceiptStats);
receiptRouter.get('/recent', ReceiptController.getRecentReceipts);
receiptRouter.get('/search', ReceiptController.searchReceipts);
receiptRouter.get('/type/:type', ReceiptController.getReceiptsByType);
receiptRouter.get('/:receiptId', ReceiptController.getReceiptById);
receiptRouter.put('/:receiptId', ReceiptController.updateReceipt);
receiptRouter.delete('/:receiptId', ReceiptController.deleteReceipt);

export default receiptRouter;