import { useMutation } from "@tanstack/react-query";
import { apiClient, apiEndpoints } from "../lib/api";
import { useToast } from "../components/ToastContext";
import { LocalActivityEnum } from "@/app/(drawer)/index";

export interface ActivityExtractionRequest {
  prompt: string;
}

export interface ActivityExtractionResponse {
  activity: string;
  time: number;
  image: LocalActivityEnum;
  imageUrl: string;
}

export interface ImageGenerationRequest {
  prompt: string;
}

export const useActivityExtraction = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: ActivityExtractionRequest): Promise<ActivityExtractionResponse> => {
      const response = await apiClient.post(apiEndpoints.aiActivityExtraction, data);
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
