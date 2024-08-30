import MeasureModel from '../models/MeasureModel'
import { Moment } from 'moment'

export interface IMeasureInsertData {
  measure_uuid: string,
  measure_value: number,
  measure_type: any
  measure_datetime: Date,
  image_url: string,
  customer_code: string
}

interface IMeasureUpdateData {
  measure_uuid: string,
  measure_value: number,
}

export class MeasureService {
  
  async createMeasure(data: IMeasureInsertData) {
    await MeasureModel.create(data)
  }
  
  async updateMeasure(data: IMeasureUpdateData) {
    try {
      const { measure_uuid, measure_value } = data
      
      const measure = await MeasureModel.findOne({ measure_uuid })
      
      if (measure === null) {
        return {
          status_code: 404,
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Não foi encontrada nenhuma leitura.'
        }
      }
      
      if (measure.has_confirmed === true) {
        return {
          status_code: 409,
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Leitura do mês já realizada'
        }
      }
      
      const updateData = {
        measure_value,
        has_confirmed: true
      }
      
      measure.set(updateData)
      
      await measure.save()
      
      return {
        status_code: 200,
        success: true
      }
    } catch (err) {
      return {
        status_code: 500,
        error_code: 'UPDATE_ERROR',
        error_description: 'An error occurred while updating the measure.'
      }
    }
  }
  
  async getReadings(data: { customer_code: string, measure_type: string }) {
    const { customer_code, measure_type }: { customer_code: string, measure_type: string } = data
    
    const query: any = { customer_code }
    
    if (measure_type) {
      query.measure_type = new RegExp(`^${measure_type}$`, 'i')
    }
    
    return await MeasureModel.find(query)
      .select('measure_uuid measure_datetime measure_type has_confirmed image_url -_id')
      .exec()
    
  }
  
  async existsReadingForThisMonth(customer_code: string, date: Moment, measure_type: string) {
    const startDate = date.startOf('month').utc().toDate()
    const endDate = date.endOf('month').utc().toDate()
    
    return await MeasureModel.findOne({
        customer_code,
        measure_datetime: { $gte: startDate, $lt: endDate },
        measure_type
      })
      .exec()
  }
}
