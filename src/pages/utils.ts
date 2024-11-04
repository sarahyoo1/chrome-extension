import { InputOption } from "./types";

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
  [InputOption.code_analysis]:`
    From the given image, create a problem analysis and return the result using this JSON format:
    *When writing topics names, use space. Don't use any symbols like dash.
    *When writing title, do not include the problem's number.

    result= {
      'title': string 
      'description': string, 
      'link': string,
      'user_solution': string,
      'difficulty': number, 
      'space_complexity': string,
      'time_complexity': string,
      'topics': string[] 
    }
    Return result;
  `,
  [InputOption.analysis]: `Analyze the content in this image`,
  [InputOption.type]: "",
  [InputOption.none]: ""
}