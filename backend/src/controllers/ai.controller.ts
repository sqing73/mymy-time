import { Request, Response, NextFunction } from "express";
import { getActivityExtraction, getTaskImage } from "@/services/ai.service";

export async function handleActivityExtractionRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt, images } = req.body;
    const completion = await getActivityExtraction({prompt, images});
    if (!completion) {
      return res.status(400).json({ error: "Prompt is not valid, please try again!" });
    }
    return res.json(completion);
  } catch (error) {
    console.log(error);
    next(error);
    return;
  }
}

export async function handleActivityImageGenerationRequest(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Content-Type", "text/plain");
    
    const { prompt } = req.body;
    const imageBinary = await getTaskImage(prompt);
    
    if (!imageBinary) {
      return res.status(500).json({ error: "Failed to generate image" });
    }
    
    res.send(imageBinary);
  } catch (error) {
    next(error);
  }
  return;
}
