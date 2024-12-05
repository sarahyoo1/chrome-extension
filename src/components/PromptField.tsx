import { useEffect, useRef, useState } from 'react'
import { FiPaperclip } from 'react-icons/fi'
import { BsArrowUpCircleFill } from "react-icons/bs";
import { get_blob_uri, take_screenshot, url_to_file } from '@src/pages/utils';
import { GenerateContentResult } from '@google/generative-ai';
import { gemini_flash } from '@src/libs/gemini_ai';

interface PropsType {
  session: any;
  chatHistory: any[],
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
  setIsResponsing: React.Dispatch<React.SetStateAction<boolean>>;
}

const PromptField = ({ session, chatHistory, setChatHistory, setIsResponsing} : PropsType ) => {
  const [inputValue, setInputValue] = useState("");
  const [shotUrl, setShotUrl] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleClickOutside = (event : MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }

  const scanScreen = async () => {
    const url = await take_screenshot();
    setChatHistory((prev) => [
      ...prev, {
      id: chatHistory.length + 1,
      role: "assistant",
      text: "Captured screen! What do you want me to do?",
    }]);
    setShotUrl(url);
  }

  const onSubmitPrompt = async (event : React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setChatHistory((prev) => [
      ...prev, {
      id: chatHistory.length + 1,
      role: "user",
      text: inputValue,
    }]);
    setInputValue('');

    await getAiResponse(inputValue);
  }

  const analyze_image = async (image_url:string, prompt:string) => {
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

  const getAiResponse = async (inputValue : string) => {
    setIsResponsing(true);
    let result : string = "";
    if (shotUrl) {
      result = (await (await analyze_image(shotUrl, inputValue)).response).text(); //todo: prompt selection
    } else {
      result = await session.prompt(inputValue); 
    }
    setIsResponsing(false);
    setChatHistory((prev) => [
      ...prev, {
      id: chatHistory.length + 1,
      role: "assistant",
      text: result,
    }]);
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className='flex items-center gap-1.5'>
      <div className='flex items-center gap-2 rounded-full w-full max-w-2xl bg-gray-200 p-2'>
        <div className='relative'>
          {isOpen && (
            <ul ref={menuRef} className="menu bg-base-200 rounded-box w-56 absolute left-0 bottom-full mb-2">
              <li onClick={scanScreen}><a>Scan screen</a></li>
              <li><a>Upload file</a></li>
              <li><a>Item 3</a></li>
            </ul>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className='tooltip' data-tip="Attach file">
            <FiPaperclip size={20}/>
          </button>
        </div>
        <input 
          type='text' 
          placeholder='Message Ai' 
          className='w-full focus-within:outline-none border-none bg-gray-200' 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button disabled={!inputValue} onClick={onSubmitPrompt}>
          <BsArrowUpCircleFill 
            size={30}
            color={inputValue ? 'black' : 'gray'}
          />
        </button>
      </div>
    </div>
  )
}

export default PromptField