import { useMutation } from "@tanstack/react-query";
import { apiClient, apiEndpoints } from "../lib/api";
import { useToast } from "../components/ToastContext";
import { LocalTaskEnum } from "@/app/index";

export interface TaskExtractionRequest {
  prompt: string;
}

export interface TaskExtractionResponse {
  task: string;
  time: number;
  image: LocalTaskEnum;
}

export interface ImageGenerationRequest {
  prompt: string;
}

export const useTaskExtraction = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: TaskExtractionRequest): Promise<TaskExtractionResponse> => {
      const response = await apiClient.post(apiEndpoints.aiTaskExtraction, data);
      return response.data;
    },
    onError: (error: any) => {
      // Try to read error from response if it exists
      if (error.response?.data?.error) {
        showToast(error.response.data.error);
      } else {
        showToast("Network error occurred");
      }
    },
    retry: false,
  });
};

export const useImageGeneration = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: ImageGenerationRequest): Promise<string> => {
      const response = await apiClient.post(apiEndpoints.aiImageGeneration, data, { responseType: "text" });
      return response.data;
    },
    onError: (error: any) => {
      if (error.response?.data?.error) {
        showToast(error.response.data.error);
      } else {
        showToast("Image generation failed");
      }
    },
    retry: false,
  });
};
