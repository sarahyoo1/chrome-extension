import { AiChatBubble, PromptField, UserChatBubble } from '@src/components'
import { useEffect, useState } from 'react';
import { analyze_code, add_problem } from '../apis';
import { take_screenshot } from '../utils';

declare global {
  interface Window {
    ai: any;
  }
}

const checkAI = async () => {
  if ("ai" in window) {
    if ((await window.ai.languageModel.capabilities()).available == "readily") {
      console.log("ai is ready")
      return true;
    }
  }
  return false;
}

export const ChatList = () => {
  const [endMessage, setEndMessage] = useState<null | HTMLDivElement>(null);
  const [session, setSession] = useState({
    prompt: async (inputValue?: string) => {},
    execute: async (inputValue?: string) => {},
  });
  const [isAI, setIsAI] = useState<null | boolean>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([
    {id: -1, role: 'assistant', text: 'Hello! What can I help you?'}
  ]);

  const [isResponsing, setIsResponsing] = useState(false);

  const updateIsAI = async () => {
      const checkAIStatus = await checkAI();

      if (checkAIStatus) {
        const session = await window.ai.languageModel.create({
          initialPrompts: [
            {role: 'assistant', content: 'Hello! What can I help you?'}
          ]
        });
        setSession(session);
      }

      setIsAI(checkAIStatus);
    };

    const onSaveProblem = async () => {
      try {
        const url = await take_screenshot();
        const result = await analyze_code(url);
        await add_problem(result);
        setChatHistory((prev) => [
          ...prev, {
          id: chatHistory.length + 1,
          role: "assistant",
          text: "Successfully saved the problem!",
        }]);
      } catch (e) {
        console.error(e);
      }
    }
    
    useEffect(() => {
      updateIsAI();
    }, []);

    useEffect(() => {
      endMessage?.scrollIntoView({ behavior: "smooth" });
      console.log(chatHistory)
    }, [endMessage]);

  return (
    <>
      <div className='p-2 text-white'>
        {isAI === null && <p>Checking your browser</p>}
        {isAI !== null &&
          (isAI ? (
            <p className='text-sm font-medium leading-none'>
              Your chrome support Built-in AI. All code runs locally on your
              computer. No internet.
            </p>
          ) : (
            <p>
              Your chrome does not support Built-in AI. Please check{" "}
              <a
                href='https://github.com/lightning-joyce/chromeai?tab=readme-ov-file#how-to-set-up-built-in-gemini-nano-in-chrome'
                className='font-medium text-red-500 underline underline-offset-4'
              >
                this steps
              </a>{" "}
              to turn on Built-in AI.
            </p>
          ))}
    </div> 

    <div className='bg-slate-50 w-11/12 rounded-3xl mx-auto flex flex-col'>
      <div className='px-2 pt-2 rounded-3xl h-[400px]'>
          <div className='overflow-y-auto w-full max-h-[400px]'>
              {chatHistory.map((chat) => (chat.role === "user" ? 
                (
                  <UserChatBubble 
                    key={chat.id}
                    content={chat.text}
                  />
                ) : (
                  <div 
                    key={chat.id}
                    ref={(el) => {
                      setEndMessage(el);
                    }}
                  >
                    <AiChatBubble 
                      content={chat.text}
                    />
                  </div>
              )))}
              {isResponsing && <AiChatBubble content={"responsing..."}/>}
          </div>
      </div>
  
      <div className='w-full px-4 pb-4 pt-2 bg-slate-50 rounded-3xl'>
        <PromptField 
          session={session}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          setIsResponsing={setIsResponsing}
        />
        <button onClick={onSaveProblem} className='btn w-full'>Save Problem</button>
      </div>
    </div>
    </>
  )
}
