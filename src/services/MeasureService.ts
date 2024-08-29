import MeasureDTO from "../dtos/MeasureDTO";
import MeasureModel from "../models/MeasureModel";

interface IMeasureData {
  measure_uuid: string,
  measure_value: number,
  measure_type: any
  measure_datetime: Date
}
export class MeasureService {

  async createMeasure(data: IMeasureData){
    try{
      const measure = await MeasureModel.create(data);
      return measure;
    }
    catch (err){
      console.error(err)
    }
  }
}
