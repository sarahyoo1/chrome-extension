import { useEffect, useRef, useState } from 'react'
import { FiPaperclip } from 'react-icons/fi'
import { BsArrowUpCircleFill } from "react-icons/bs";
import { gemini_flash } from '@src/libs/gemini_ai';
import { Chat } from '@src/pages/panel/ChatList';
import { analyze_image, take_screenshot } from '@src/pages/utils';

const PromptField = ({ setChats } : { setChats: React.Dispatch<React.SetStateAction<Chat[]>> } ) => {
  const [prompt, setPrompt] = useState<string>("");
  const [shotUrl, setShotUrl] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLUListElement>(null);

  const addNewChat = (isUser:boolean, content:string) => {
    const newChat : Chat = {
      isUser: isUser,
      content: content,
      timestamp: new Date().getTime()
    };
    setChats(prev => [...prev, newChat]);
  }

  const handleClickOutside = (event : MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }

  const scanScreen = async () => {
    const url = await take_screenshot();
    setShotUrl(url);
    addNewChat(false, "Scanned screen! What do you want me to do?");
  }

  const submitPrompt = (event : React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addNewChat(true, prompt);
    setPrompt("");
    getAiResponse(prompt);
  }

  const getAiResponse = async (prompt : string) => {
    let response : string;
    if (shotUrl) {
      const result = await analyze_image(shotUrl, prompt);
      response = result.response.text();
    } else {
      const result = await gemini_flash.generateContent(prompt);
      response = result.response.text();
    }
    addNewChat(false, response);
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