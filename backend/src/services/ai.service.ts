import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import fs from "fs";

const inputImageBase64 = fs.readFileSync("images/input.jpg", "base64");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ActivityExtraction = z.object({
  activity: z.string(),
  time: z.number(),
  image: z.string(),
});

interface ActivityExtractionResponseType {
  activity?: string;
  time?: number;
  image?: string;
}

interface ActivityExtractionRequestType {
  prompt: string;
  images: string[];
}

export async function getActivityExtraction(request: ActivityExtractionRequestType): Promise<ActivityExtractionResponseType | null> {
  const response = await openai.responses.parse({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
        # Identity
        You are an expert at structured data extraction and image selection. You will be given unstructured text and you will need to extract the activity and the time it will take to complete the activity. The time should be in minutes. You will also need to select an image that best represents the activity.

        # Instructions
        - If the prompt is not relevant to an activity or task, return empty for all fields.
        - Extract the activity and the time it will take to complete the activity.
        - The extracted activity should converted to present tense.
        - The time should be in minutes.
        - Select an image that best represents the activity.
        - The image must be one of the following: ${request.images.join(", ")}.
        - If time is not provided, take a guess at the time it will take to complete the activity.

        # Example
        <user_query>
          reading books for 2 hours
        </user_query>
        <activity_extraction>
          {
            "activity": "read books",
            "time": 120,
            "image": "reading-books"
          }
        </activity_extraction>

        <user_query>
          run
        </user_query>
        <activity_extraction>
          {
            "activity": "run",
            "time": 30,
            "image": "working-out"
          }
        `
      },
      {
        role: "user",
        content: request.prompt
      }
    ],
    text: { format: zodTextFormat(ActivityExtraction, "ActivityExtraction") },
  });
  const result: ActivityExtractionResponseType = response.output_parsed || {};
  const image = result.image || "";
  const verifiedImage = request.images.includes(image) ? image : "";
  if (!result.activity || !result.time || !verifiedImage) {
    return null;
  }
  return {
    activity: result.activity || "",
    time: result.time || 0,
    image: verifiedImage,
  };
}

export async function getTaskImage(prompt: string): Promise<string> {
  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are an expert at image generation. You will be given a photo of a cat and a task from the user to generate a new image of a cat doing the task in Ghibli style and transparent background for a mobile app background."

        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt
            }, 
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${inputImageBase64}`,
              detail: "auto"
            }
          ]
        }
      ],
      tools: [{
        type: "image_generation",
        quality: "auto",
        size: "1024x1536",
        output_format: "png",
        background: "transparent",
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
      fs.writeFileSync(`mymy-${timestamp}.jpeg`, Buffer.from(imageBase64!, "base64"));
      return imageBase64 || "";
    }
  } catch (error) {
    console.error("Error generating image", error);
  }
  return "";
}
