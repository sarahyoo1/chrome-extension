import { useEffect, useRef, useState } from 'react'
import { FiPaperclip } from 'react-icons/fi'
import { BsArrowUpCircleFill } from "react-icons/bs";
import { gemini_flash } from '@src/libs/gemini_ai';
import { Chat } from '@src/pages/panel/ChatList';

const PromptField = ({ setChats } : { setChats: React.Dispatch<React.SetStateAction<Chat[]>> } ) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleClickOutside = (event : MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }

  const submitPrompt = (event : React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const newChat : Chat = {
      isUser: true,
      content: prompt,
      timestamp: new Date().getTime()
    };
    setChats(prev => [...prev, newChat]);
    setPrompt("");
    getAiResponse(prompt);
  }

  const getAiResponse = async (prompt : string) => {
    const result = await gemini_flash.generateContent(prompt);
    const newChat : Chat = {
      isUser: false,
      content: result.response.text(),
      timestamp: new Date().getTime()
    };
    setChats(prev => [...prev, newChat]);
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
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
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