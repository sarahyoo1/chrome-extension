import { useEffect, useState } from 'react';
import logo from '@assets/img/logo.svg';
import { model } from '@src/libs/gemini_ai';
import { RotatingLines } from 'react-loader-spinner';

export default function Popup(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  useEffect(()=>{}, [result]);
  
  const get_response = async () => {
    setLoading(true);
    const result = await model.generateContent(prompt);
    setResult(result.response.text());
    setLoading(false);
  }

  return (
    <div className="h-full text-center p-3 bg-gray-800 text-white font-mono">
      <header className="flex flex-col items-center justify-center">
        <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />
      </header>
      <div className='p-4 flex flex-col gap-3'>
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
