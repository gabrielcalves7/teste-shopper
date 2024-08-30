import fs from 'fs/promises'
import tmp from 'tmp'
import { getMimeType } from '../utils/Helper'

export interface IPersistenceService {
  saveImage(base64String: string): Promise<{ image_path: string, mimeType: string }>
}

export class PersistenceService implements IPersistenceService {
  
  async saveImage(base64String: string): Promise<{ image_path: string, mimeType: string }> {
    const mimeType = getMimeType(base64String)
    const fileType = mimeType.split('/')[1]
    
    const temporaryFile = tmp.fileSync({ postfix: '.' + fileType })
    const image_path = temporaryFile.name
    
    await fs.writeFile(image_path, base64String, { encoding: 'base64' })

    return { image_path, mimeType }
  }
}
