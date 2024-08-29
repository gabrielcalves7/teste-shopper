import * as dotenv from 'dotenv'
import { PersistenceService } from "./PersistenceService";

import { FileState, GoogleAIFileManager } from "@google/generative-ai/server"
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config()

export class GeminiService {
  private apiKey: string
  private fileManager: GoogleAIFileManager
  
  constructor(private persistenceService: PersistenceService) {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    this.fileManager = new GoogleAIFileManager(this.apiKey)
    this.persistenceService = persistenceService;
  }
  
  async execute(base64String: string) {
    const { imagePath, mimeType } = await this.persistenceService.saveImage(base64String);
    
    const displayName = `Measure-${ Date.now() }`
    
    const uploadResponse = await this.fileManager.uploadFile(imagePath, {
      mimeType,
      displayName: displayName,
    })
    
    console.log(uploadResponse)
    
    const fileManager = new GoogleAIFileManager(this.apiKey);
    
    const name = uploadResponse.file.name;
    
    let file = await fileManager.getFile(name);
    
    while (file.state === FileState.PROCESSING) {
      process.stdout.write(".")
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name)
    }
    
    if (file.state === FileState.FAILED) {
      throw new Error("Image processing failed.");
    }
    
    const LLMResponse = await this.sendPromptToLLM(uploadResponse);
    if (LLMResponse.response != "success") {
      throw new Error(LLMResponse.message)
    }
    
    return { reading_value: parseInt(LLMResponse.reading_value), imagePath };
  }
  
  async sendPromptToLLM(uploadResponse: any) {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
        }
      },
      { text: "I am sending you a image for reading, it is gas or water. Return the reading data in JSON synthax. For example, if it is gas you will tell me like this: response: \"success\", reading_value: \"119\", if it's not an gas/water image, 'response: \"error\", message: \"tell the reason to the user\"' (always in JSON synthax)." },
    ]);
    
    const response = result.response.text().replaceAll("`", "").replaceAll("json", "");
    console.log(response);
    return JSON.parse(response);
  }
  
}
