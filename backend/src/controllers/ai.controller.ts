import { Request, Response, NextFunction } from "express";
import { getOpenAICompletion } from "../services/openai.service";

export async function handleOpenAIRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const completion = await getOpenAICompletion(prompt);
    return res.json({ completion });
  } catch (error) {
    next(error);
    return;
  }
}
