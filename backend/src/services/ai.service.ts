import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TaskTimeExtraction = z.object({
  task: z.string(),
  time: z.number(),
  image: z.string(),
});

interface TaskTimeExtractionType {
  task?: string;
  time?: number;
  image?: string;
}

const Images = [
  "reading-books",
  "watching-tv",
  "playing-video-games",
  "listening-to-music",
  "studying",
  "working-out",
  "doing-housework",
  "cooking",
  "eating",
  "sleeping",
  "taking-shower",
  "meditating",
];

export async function getTaskExtraction(prompt: string): Promise<TaskTimeExtractionType | null> {
  const response = await openai.responses.parse({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
        # Identity
        You are an expert at structured data extraction and image selection. You will be given unstructured text and you will need to extract the task and the time it will take to complete the task. The time should be in minutes. You will also need to select an image that best represents the task.

        # Instructions
        - Extract the task and the time it will take to complete the task.
        - The extracted task should converted to present tense.
        - The time should be in minutes.
        - Select an image that best represents the task.
        - The image must be one of the following: ${Images.join(", ")}.

        # Example
        <user_query>
          reading books for 2 hours
        </user_query>
        <task_extraction>
          {
            "task": "read books",
            "time": 120,
            "image": "reading-books"
          }
        </task_extraction>
        `
      },
      {
        role: "user",
        content: prompt
      }
    ],
    text: { format: zodTextFormat(TaskTimeExtraction, "TaskTimeExtraction") },
  });
  const result: TaskTimeExtractionType = response.output_parsed || {};
  const image = result.image || "";
  const verifiedImage = Images.includes(image) ? image : "";
  if (!result.task || !result.time || !verifiedImage) {
    return null;
  }
  return {
    task: result.task || "",
    time: result.time || 0,
    image: verifiedImage,
  };
}

export async function getTaskImageMapping(prompt: string): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "You are an expert at image selection. You will be given a task and you will need to map the task to an image. The image should be one of the following: " + Images.join(", ") + ". Please only return the image name if you have high confidence in the selection. If you are not confident in the selection, return an empty string."
      },
      {
        role: "user",
        content: prompt
      }
    ],
  });
  return Images.includes(response.output_text) ? response.output_text : "";
}

export async function getTaskImage(prompt: string): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "Generate a Ghibli style mobile app background with the cat doing the task given. The cat should be at the middle of the screen."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    tools: [{
      type: "image_generation",
      quality: "low",
      size: "1024x1536",
      output_format: "jpeg",
    }],
  });
  // TODO: remove saving to file after testing
  const imageData = response.output
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];
    const fs = await import("fs");
    const timestamp = Date.now();
    fs.writeFileSync(`images/mymy-${timestamp}.jpeg`, Buffer.from(imageBase64!, "base64"));
    return imageBase64!;
  }
  return "";
}
