import mongoose, { Document, Schema } from 'mongoose'

interface IMeasure extends Document {
  customer_code: string
  measure_datetime: Date
  measure_type: 'WATER' | 'GAS'
  image_url: string
  measure_value: number
  measure_uuid: string
  has_confirmed: boolean
}

const measureSchema: Schema = new Schema({
  measure_uuid: {
    type: String,
    required: true,
    unique: true,
  },
  measure_datetime: {
    type: Date,
    required: true,
  },
  measure_type: {
    type: String,
    enum: ['WATER', 'GAS'],
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  customer_code: {
    type: String,
    required: true,
  },
  measure_value: {
    type: Number,
    required: true,
  },
  has_confirmed: {
    type: Boolean,
    required: false,
    default: false
  },
})

const MeasureModel = mongoose.model<IMeasure>('Measure', measureSchema)

export default MeasureModel
