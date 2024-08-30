import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const connectDB = async () => {
  const uri = process.env.DB_URI || ''
  try {
    if(uri == ""){
      throw new Error('DB_URI has not been set.')
    }
    
    await mongoose.connect(uri)
    
    console.log('MongoDB connected')
  } catch (err) {
    
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

export default connectDB