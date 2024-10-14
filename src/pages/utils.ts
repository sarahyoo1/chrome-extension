import { GenerateContentResult } from "@google/generative-ai";
import { InputOption } from "./enums";
import { gemini_flash } from "@src/libs/gemini_ai";

export async function take_screenshot() : Promise<string> {

  return new Promise<string>((resolve, reject) => {
    chrome.tabs.captureVisibleTab({format: "png"}, (screenShotUrl) => {
        const link = document.createElement("a");
        link.href = screenShotUrl;
        link.download = "screenshot.png";
        if (!screenShotUrl) {
          reject("Faild to screenshot");
        }
        resolve(screenShotUrl);
    });
  })
}

export async function analyze_image(image_url:string, prompt:string) : Promise<GenerateContentResult> {
  const file = await url_to_file(image_url);
  return new Promise<GenerateContentResult>((resolve, reject) => {
    get_blob_uri(file).then(async (uri) => {
      const result = await gemini_flash.generateContent([
        prompt,
        {
          inlineData: {
            data: uri,
            mimeType: file.type
          }
        }
      ]);
      if (!result) {
        reject("Failed to analyze content");
      }
      resolve(result);
    });
  });
}

export async function url_to_file(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'screen_shot', {type: blob.type});
    return file;
}

export async function get_blob_uri(file : Blob) : Promise<string> {
  const fr = new FileReader();
  fr.readAsDataURL(file);

  return new Promise<string>((resolve) => {
    fr.onload = () => {
      const res = fr.result;
      if (typeof res == "string") {
        resolve(strip_base64_prefix(res));
      }
    }
  });
}

export function strip_base64_prefix(uri: string) {
  return uri.split(',')[1];
}

export const prompts : Record<InputOption, string> = {
  [InputOption.todolist]: `From the given image, creates a to-do-list using this JSON format:
    TODO = {'task': string, order: number}
    Return: Array<TODO>;

    if you cannot generate any to-do, return null.
  `,
  [InputOption.analysis]: `Analyze the content in this image`,
  [InputOption.type]: "",
  [InputOption.none]: ""
}