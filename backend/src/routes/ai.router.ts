import express from "express";
import { 
    handleActivityExtractionRequest, 
    handleActivityImageGenerationRequest, 
} from "@/controllers/ai.controller";
import { validatePrompt } from "@/middlewares/validation.middleware";

const router = express.Router();

router.post("/activity-extraction", validatePrompt, handleActivityExtractionRequest);
router.post("/activity-image-generation", validatePrompt, handleActivityImageGenerationRequest);

export default router; 
