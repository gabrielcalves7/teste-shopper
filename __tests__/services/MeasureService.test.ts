import { MeasureService } from '../../src/services/MeasureService'
import { IMeasureInsertData } from '../../src/services/MeasureService'
import MeasureModel from '../../src/models/MeasureModel'
import { v4 as uuid } from 'uuid'
jest.mock('../../src/models/MeasureModel')

const mockMeasure = {
  ...{
    customer_code: "test",
    measure_uuid: 'some-uuid',
    measure_value: 123,
    measure_datetime: new Date(),
    has_confirmed: false
  },
  save: jest.fn().mockResolvedValue(this),
  set: jest.fn()
}

describe('MeasureService', () => {
  let measureService: MeasureService
  
  beforeEach(() => {
    measureService = new MeasureService()
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  const _uuid = uuid()
  const customer_code = "test"
  
  const newReading: IMeasureInsertData = {
    measure_uuid: _uuid,
    measure_value: 123,
    measure_datetime: new Date(),
    measure_type: 'WATER',
    image_url: 'http://urltotheimage.com',
    customer_code,
  }
  
  it('should create a new measure', async () => {
    (MeasureModel.create as jest.Mock).mockResolvedValue({})
    await measureService.createMeasure(newReading)
    expect(MeasureModel.create).toHaveBeenCalledWith(newReading)
  })
  
  it('should update an existing measure', async () => {
    (MeasureModel.findOne as jest.Mock).mockResolvedValue(mockMeasure)
    
    const result = await measureService.updateMeasure({
      measure_uuid: mockMeasure.measure_uuid,
      measure_value: 456,
    })
    
    expect(result.status_code).toBe(200)
    expect(MeasureModel.findOne).toHaveBeenCalledWith({ measure_uuid: mockMeasure.measure_uuid })
    expect(mockMeasure.set).toHaveBeenCalledWith({
      measure_value: 456,
      has_confirmed: true,
    })
    
    expect(mockMeasure.save).toHaveBeenCalled()
  })
  
  it('should not update a confirmed measure', async () => {
    (MeasureModel.findOne as jest.Mock).mockResolvedValue({ ...mockMeasure, has_confirmed: true })
    
    const result = await measureService.updateMeasure({
      measure_uuid: _uuid,
      measure_value: 456,
    })
    
    expect(result.status_code).toBe(409)
    expect(MeasureModel.findOne).toHaveBeenCalledWith({ measure_uuid: _uuid })
    expect(mockMeasure.set).not.toHaveBeenCalled()
    expect(mockMeasure.save).not.toHaveBeenCalled()
  })
  
  it('should return 404 if measure not found', async () => {
    (MeasureModel.findOne as jest.Mock).mockResolvedValue(null)
    
    const result = await measureService.updateMeasure({
      measure_uuid: _uuid,
      measure_value: 456,
    })
    
    expect(result.status_code).toBe(404)
    expect(MeasureModel.findOne).toHaveBeenCalledWith({ measure_uuid: _uuid })
  })
})