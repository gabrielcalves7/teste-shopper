import { GeminiService } from "../services/GeminiService";
import { Request, Response } from 'express';
import Joi from 'joi'
import multer from 'multer';
import { v4 as uuid } from 'uuid'
import { PersistenceService } from "../services/PersistenceService";
import { MeasureService } from "../services/MeasureService";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

interface IUploadRequestBody {
  image: string;
  customer_code: string;
  measure_datetime: Date; // Depending on how you handle dates (string or Date object)
  measure_type: 'WATER'|'GAS';
}

export class MeasureController {
  constructor(private geminiService: GeminiService,
              private measureService: MeasureService
  ) {
    this.geminiService = geminiService
    this.measureService = measureService
  }
  
  private readonly b64ImageSchema = Joi.string().custom((value, helpers) => {
    const base64Regex = /^([A-Za-z0-9+\/=]{4,}|\s*([A-Za-z0-9+\/=]{4,})\s*)*$/;
    const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    
    let base64String = value;
    if (dataUrlRegex.test(value)) {
      base64String = value.split(',')[1];
    }
    
    if (!base64Regex.test(base64String)) {
      throw new Joi.ValidationError('Invalid base64 image format.', [], { message: 'Invalid base64 image format.' });
    }
    return value;
  }, 'Base64 image validation').required();
  
  private readonly schema = Joi.object({
    image: this.b64ImageSchema,
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().iso().required(),
    measure_type: Joi.string().valid('WATER', 'GAS').required().insensitive(),
  });
  
  validate(data: IUploadRequestBody) {
    return this.schema.validate(data)
  }
  
  async upload(req: Request, res: Response): Promise<Response> {
    const { error } = this.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: "error" });
    }
    
    const { image, customer_code, measure_datetime, measure_type }: IUploadRequestBody = req.body
    
    try {
      this.geminiService = new GeminiService(new PersistenceService());
      const { reading_value, imagePath } = await this.geminiService.execute(image);
      const measure_uuid = uuid();
      const measure = await this.measureService.createMeasure({
        measure_uuid,
        "measure_value": reading_value,
        "measure_datetime": new Date(),
        "measure_type": measure_type.toUpperCase()
      })
      console.log(measure);
      return res.status(200).json({
        "image_url": imagePath,
        "measure_value": reading_value,
        "measure_uuid": uuid()
      });
    } catch (error) {
      console.log("errooo=>", error)
      
      return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error occurred." });
    }
  }
  
  cu(): GeminiService {
    return this.geminiService;
  }
  
  
}