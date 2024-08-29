import fs from 'fs/promises'
import tmp from 'tmp'
import { getMimeType } from "../utils/Helper";

export interface IPersistenceService {
  saveImage(base64String: string): Promise<{ imagePath: string, mimeType: string }>;
}


export class PersistenceService implements IPersistenceService {
  
  async saveImage(base64String: string): Promise<{ imagePath: string, mimeType: string }> {
    const mimeType = getMimeType(base64String)
    const fileType = mimeType.split('/')[1]
    
    const temporaryFile = tmp.fileSync({ postfix: '.' + fileType })
    const imagePath = temporaryFile.name
    
    await fs.writeFile(imagePath, base64String, { encoding: 'base64' });
    // setTimeout(async () => {
    //   try {
    //     await fs.unlink(imageFullPath);
    //     console.log('Temporary file deleted:', imageFullPath);
    //   } catch (error) {
    //     console.error('Error deleting temporary file:', error);
    //   }
    // }, 120000);
    return { imagePath, mimeType }
  }
  
}
