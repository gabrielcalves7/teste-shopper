import { GeminiService } from "../services/GeminiService"
import { Request, Response } from 'express'
import Joi, { ObjectSchema } from 'joi'
import { v4 as uuid } from 'uuid'
import { PersistenceService } from "../services/PersistenceService"
import { MeasureService } from "../services/MeasureService"
import moment from 'moment'


interface IUploadRequestBody {
  image: string
  customer_code: string
  measure_datetime: Date
  measure_type: 'WATER'|'GAS'
}

interface IConfirmRequestBody {
  measure_uuid: string
  confirmed_value: number
}

export class MeasureController {
  constructor(private gemini_service: GeminiService,
              private measureService: MeasureService
  ) {
    this.gemini_service = gemini_service
    this.measureService = measureService
  }
  
  private readonly b64ImageSchema = Joi.string().custom((value, helpers) => {
    const base64Regex = /^([A-Za-z0-9+\/=]{4,}|\s*([A-Za-z0-9+\/=]{4,})\s*)*$/
    const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif);base64,/
    
    let base64String = value
    if (dataUrlRegex.test(value)) {
      base64String = value.split(',')[1]
    }
    
    if (!base64Regex.test(base64String)) {
      throw new Joi.ValidationError('Invalid base64 image format.', [], { message: 'Invalid base64 image format.' })
    }
    return value
  }, 'Base64 image validation').required()
  
  private readonly uploadSchema = Joi.object({
    image: this.b64ImageSchema,
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().iso().required(),
    measure_type: Joi.string().valid('WATER', 'GAS').required().insensitive(),
  })
  
  private readonly confirmSchema = Joi.object({
    confirmed_value: Joi.number().required(),
    measure_uuid: Joi.string().uuid().required(),
  })
  
  validate(data: IUploadRequestBody, schema: ObjectSchema) {
    return schema.validate(data)
  }
  
  async upload(req: Request, res: Response): Promise<Response> {
    const { error } = this.validate(req.body, this.uploadSchema)
    
    if (error) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: error.details[0].message
      })
    }
    
    const measure_type = req.body.measure_type.toUpperCase()
    const { image, customer_code, measure_datetime }: IUploadRequestBody = req.body
    
    if (await this.measureService.existsReadingForThisMonth(customer_code, moment(measure_datetime, "YYYY-MM-DD"), measure_type)) {
      return res.status(400).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      })
    }
    
    try {
      this.gemini_service = new GeminiService(new PersistenceService())
      
      const { measure_value, image_path } = await this.gemini_service.execute(image)
      const measure_uuid = uuid()
      const image_url = image_path.replace('/tmp/', '/images/')
      const measure_data = {
        measure_uuid,
        customer_code,
        measure_value,
        measure_datetime,
        measure_type,
        image_url
      }
      
      await this.measureService.createMeasure(measure_data)
      
      return res.status(200).json({
        image_url,
        measure_value,
        measure_uuid
      })
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error occurred." })
    }
  }
  
  async confirm(req: Request, res: Response): Promise<Response> {
    const { error } = this.validate(req.body, this.confirmSchema)
    
    if (error) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: error.details[0].message
      })
    }
    
    const { measure_uuid, confirmed_value }: IConfirmRequestBody = req.body
    
    try {
      const result = await this.measureService.updateMeasure({
        measure_uuid,
        measure_value: confirmed_value,
      })
      
      if (result.status_code === 200) {
        return res.status(result.status_code).json({ success: true })
      } else {
        return res.status(result.status_code).json({
          error_code: result.error_code,
          error_description: result.error_description
        })
      }
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error occurred." })
    }
  }
  
  async list(req: Request, res: Response): Promise<Response> {
    const { customer_code } = req.params
    const measure_type = req.query.measure_type as string
    
    if (measure_type) {
      if (measure_type.toLowerCase() !== 'water' && measure_type.toLowerCase() !== 'gas') {
        return res.status(400).json({
          error_code: 'INVALID_TYPE',
          error_description: 'Tipo de medição não permitida:' + measure_type.toLowerCase()
        })
      }
    }
    
    try {
      const readings = await this.measureService.getReadings({
        customer_code,
        measure_type
      })

      if (readings.length === 0) {
        return res.status(404).json({
          error_code: 'NOT_FOUND',
          error_description: 'No records found for the provided customer_code.'
        })
      }
      
      return res.status(200).json({
        customer_code,
        measures: readings
      })
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error occurred." })
    }
  }
}