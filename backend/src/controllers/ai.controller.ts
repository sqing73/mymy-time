import { Request, Response, NextFunction } from "express";
import { getTaskExtraction, getTaskImage, getTaskImageMapping } from "@/services/ai.service";

export async function handleTaskExtractionRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    const completion = await getTaskExtraction(prompt);
    if (!completion) {
      return res.status(400).json({ error: "Prompt is not valid, please try again!" });
    }
    return res.json(completion);
  } catch (error) {
    next(error);
    return;
  }
}

export async function handleTaskImageRequest(req: Request, res: Response, next: NextFunction) {
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
