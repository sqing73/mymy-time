import { Request, Response, NextFunction } from "express";

export const validatePrompt = (req: Request, res: Response, next: NextFunction) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Valid prompt string is required" });
  }
  
  return next();
}; 
