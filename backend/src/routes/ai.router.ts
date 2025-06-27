import express from "express";
import { handleOpenAIRequest } from "../controllers/ai.controller";

const router = express.Router();

router.post("/", handleOpenAIRequest);

export default router; 
