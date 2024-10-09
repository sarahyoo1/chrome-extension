import { InputOption } from "./enums";

export async function url_to_file(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'screen_shot', {type: blob.type});
    return file;
}

export function get_blob_uri(file : Blob) {
  const fr = new FileReader();
  fr.readAsDataURL(file);

  return new Promise<string>((resolve) => {
    fr.onload = () => {
      const res = fr.result;
      if (typeof res == "string") {
        resolve(res.split(',')[1]);
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