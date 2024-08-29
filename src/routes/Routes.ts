import { Router } from 'express';
import { MeasureController } from "../controllers/MeasureController";
import { GeminiService } from "../services/GeminiService";
import { PersistenceService } from "../services/PersistenceService";
import { MeasureService } from "../services/MeasureService";

const customerRoutes = Router();
const geminiService = new GeminiService(new PersistenceService())
const measureService = new MeasureService()
const measureController = new MeasureController(geminiService,measureService);

customerRoutes.post('/upload', (req, res) => measureController.upload(req, res));
export default customerRoutes;