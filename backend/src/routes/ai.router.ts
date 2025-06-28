import express from "express";
import { 
    handleTaskExtractionRequest, 
    handleTaskImageRequest, 
    handleTaskImageMappingRequest 
} from "@/controllers/ai.controller";
import { validatePrompt } from "@/middlewares/validation.middleware";

const router = express.Router();

router.post("/task-extraction", validatePrompt, handleTaskExtractionRequest);
router.post("/task-image", validatePrompt, handleTaskImageRequest);
router.post("/task-image-mapping", validatePrompt, handleTaskImageMappingRequest);

export default router; 
