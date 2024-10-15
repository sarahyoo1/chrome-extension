import { useEffect, useRef, useState } from 'react'
import { FiPaperclip } from 'react-icons/fi'
import { BsArrowUpCircleFill } from "react-icons/bs";
import { get_blob_uri, take_screenshot, url_to_file } from '@src/pages/utils';
import { ChatSession, Content, GenerateContentStreamResult, Part } from '@google/generative-ai';

interface PropsType {
  chat: ChatSession;
  setChatHistory: React.Dispatch<React.SetStateAction<Content[]>>;
  setTypingMessage: React.Dispatch<React.SetStateAction<string>>;
}

const PromptField = ({ chat, setChatHistory, setTypingMessage} : PropsType ) => {
  const [prompt, setPrompt] = useState<string>("");
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
    setShotUrl(url);
    addNewChat("model", [{text: "Scanned screen! What do you want me to do?"}]);
  }

  const submitPrompt = (event : React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addNewChat("user", [{text: prompt}]);
    setPrompt("");
    getAiResponse(prompt);
  }

  const analyze_image = async (image_url:string, prompt:string) => {
    const file = await url_to_file(image_url);
    return new Promise<GenerateContentStreamResult>((resolve, reject) => {
      get_blob_uri(file).then(async (uri) => {
        const result = await chat.sendMessageStream([
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

  const getAiResponse = async (prompt : string) => {
    let result : GenerateContentStreamResult
    if (shotUrl) {
      result = await analyze_image(shotUrl, prompt);
    } else {
      result = await chat.sendMessageStream(prompt);
    }
    for await (const chunk of result.stream) {
      if (!chunk.candidates) continue;
      const text = chunk.candidates[0].content.parts[0].text;
      setTypingMessage(prev => prev + text);
    }
    addNewChat("model", [{text: (await result.response).text()}]);
    setTypingMessage('');
  }

  const addNewChat = (role: string, parts: Part[]) => {
    setChatHistory(prev => [...prev, {role: role, parts: parts}]);
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
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button disabled={!prompt} onClick={submitPrompt}>
          <BsArrowUpCircleFill 
            size={30}
            color={prompt ? 'black' : 'gray'}
          />
        </button>
      </div>
    </div>
  )
}

export default PromptField