import { Request, Response, NextFunction } from "express";
import { getTaskExtraction, getTaskImage, getTaskImageMapping } from "@/services/ai.service";

export async function handleTaskExtractionRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    const completion = await getTaskExtraction(prompt);
    return res.json(completion);
  } catch (error) {
    next(error);
    return;
  }
}

export async function handleTaskImageRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    const imageBase64 = await getTaskImage(prompt);
    
    if (!imageBase64) {
      return res.status(500).json({ error: "Failed to generate image" });
    }
    
    // Set content type for JPEG image
    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(imageBase64, "base64"));
  } catch (error) {
    next(error);
  }
  return;
}

export async function handleTaskImageMappingRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const imageName = await getTaskImageMapping(prompt);
    return res.json({ imageName });
  } catch (error) {
    next(error);
  }
  return;
}
