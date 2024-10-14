import { useEffect, useState } from 'react';
import { gemini_flash } from '@src/libs/gemini_ai';
import { RotatingLines } from 'react-loader-spinner';
import { get_blob_uri, prompts, url_to_file } from '../utils'
import { InputOption } from '../enums';
import { open_as_side_panel } from '../background';

export default function Popup(): JSX.Element {
  //Screen Capture
  const [loading, setLoading] = useState<boolean>(false);
  const [shotUrl, setShotUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [inputOption, setInputOption] = useState<InputOption>(InputOption.none);

  useEffect(()=>{}, [result, shotUrl, prompt, inputOption]);

  function take_screenshot() {
    chrome.tabs.captureVisibleTab({format: "png"}, (screenShotUrl) => {
        const link = document.createElement("a");
        link.href = screenShotUrl;
        link.download = "screenshot.png";
        setShotUrl(screenShotUrl);
    });
}

  async function analyze_image() {
    setLoading(true);
    const file = await url_to_file(shotUrl);
    const user_prompt = inputOption == InputOption.type ? prompt : prompts[inputOption];
    get_blob_uri(file).then(async (uri) => {
      const result = await gemini_flash.generateContent([
        user_prompt,
        {
          inlineData: {
            data: uri,
            mimeType: file.type
          }
        }
      ]);
      const result_text = result.response.text();
      setResult(result_text);
      setPrompt("");
      setLoading(false);
    });
  }

  const get_response = async () => {
    setLoading(true);
    const result = await gemini_flash.generateContent(prompt);
    setResult(result.response.text());
    setLoading(false);
  }

  return (
    <div className="h-full text-center p-3 bg-gray-800 text-white font-mono">
      <h1 className='text-[22px] font-bold'>Quick Note AI</h1>

      <div className='p-4 flex flex-col gap-3'>
        <button onClick={() => open_as_side_panel()} className='btn'>Open As Side Panel</button>
          <button onClick={take_screenshot} className='btn bg-green-500'>Scan Screen</button>
          <div className="divider">OR</div>
          <input type='file'className="file-input w-full max-w-xs"/>

          {shotUrl && (
            <div className='flex flex-col gap-3'>
              <img alt='img' src={shotUrl}/>
              <select className='select text-gray-500' onChange={(e) => setInputOption(e.target.value as InputOption)}>
                <option disabled selected value={InputOption.none}>What do you want to do?</option>
                <option value={InputOption.todolist}>Create To-do-list</option>
                <option value={InputOption.analysis}>Analyze Image</option>
                <option value={InputOption.type}>I want to type myself</option>
              </select> 
              { inputOption === InputOption.type && (
                <textarea 
                  value={prompt}
                  onChange={(e)=>setPrompt(e.target.value)} 
                  placeholder='Enter your prompt'
                  className='p-1 text-black rounded-md w-full'
                />
              )}
              { inputOption != InputOption.none && (
                <button onClick={analyze_image} className='btn w-full bg-cyan-400'>Submit</button>
              )}
            </div>
          )}

          <div className='divider pt-2 divider-neutral'></div>

          <h1 className='font-bold'>Ask Gemini!</h1>
          <div className='flex gap-2'>
            <textarea 
              value={prompt}
              onChange={(e)=>setPrompt(e.target.value)} 
              placeholder='type here'
              className='p-1 text-black rounded-md'
            />
            <button onClick={get_response} className='bg-cyan-500 font-semibold p-2 rounded-md hover:bg-green-500'>submit</button>
          </div>

          <h1>AI response:</h1>
          {loading ? 
            ( 
              <div className='mx-auto'>
                <RotatingLines strokeColor='green' width='40'/>
              </div>
              ):(
              <p className='bg-white font-sans text-black p-2 rounded-md text-left'>{result}</p>
            )}
        </div>
    </div>
  );
}
