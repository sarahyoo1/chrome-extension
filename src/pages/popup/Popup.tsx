import { useEffect, useState } from 'react';
import { gemini_flash } from '@src/libs/gemini_ai';
import { RotatingLines } from 'react-loader-spinner';
import { get_blob_uri, url_to_file } from '../utils'

export default function Popup(): JSX.Element {
  //Screen Capture
  const [loading, setLoading] = useState<boolean>(false);
  const [shotUrl, setShotUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  useEffect(()=>{}, [result, shotUrl]);

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
  get_blob_uri(file).then(async (uri) => {
    const result = await gemini_flash.generateContent([
      "Tell me about this image.",
      {
        inlineData: {
          data: uri,
          mimeType: file.type
        }
      }
    ]);
    const result_text = result.response.text();
    setResult(result_text);
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
          <button onClick={take_screenshot} className='bg-green-600 p-2 rounded-md w-fit'>Capture</button>
          {shotUrl && (
            <div>
              <img alt='img' src={shotUrl}/>
              <button onClick={analyze_image} className='bg-cyan-500 p-2 rounded-md w-fit'>Analyze</button>
            </div>
          )}

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
            ) 
            :
            (
              <p className='bg-white font-sans text-black p-2 rounded-md text-left'>{result}</p>
            )}
        </div>
    </div>
  );
}
