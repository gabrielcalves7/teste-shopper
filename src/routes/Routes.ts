import { Router } from 'express'
import { MeasureController } from "../controllers/MeasureController"
import { GeminiService } from "../services/GeminiService"
import { PersistenceService } from "../services/PersistenceService"
import { MeasureService } from "../services/MeasureService"

const routes = Router()
const gemini_service = new GeminiService(new PersistenceService())
const measureService = new MeasureService()
const measureController = new MeasureController(gemini_service,measureService)

routes.post('/upload', (req, res) => measureController.upload(req, res))
routes.patch('/confirm', (req, res) => measureController.confirm(req, res))
routes.get('/:customer_code/list', (req, res) => measureController.list(req, res))
export default routes