import express from 'express';
const router = express.Router();

import {  uploadDocument,createDocument} from "./controller.js";



router.post('/document-import', uploadDocument);
router.post('/document-create', createDocument);
  


export default router;
