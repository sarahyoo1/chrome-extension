import { AiChatBubble, PromptField, UserChatBubble } from '@src/components'
import { useEffect, useState } from 'react';
import { gemini_flash } from '@src/libs/gemini_ai';
import { Content } from '@google/generative-ai';

export const ChatList = () => {
  const [chatHistory, setChatHistory] = useState<Content[]>([{role: "user", parts: [{text: "Hello! What can I help you?"}]}]);
  const chat = gemini_flash.startChat({history: chatHistory});
  const [typingMessage, setTypingMessage] = useState<string>('');

  useEffect(() => {
    const getHistory = async () => {
      const history = await chat.getHistory();
      setChatHistory(history);
    }
    getHistory();
  }, []);

  return (
    <div className='bg-slate-50 w-11/12 rounded-3xl mx-auto flex flex-col'>
      <div className='px-2 pt-2 rounded-3xl h-[400px]'>
          <div className='overflow-y-auto w-full max-h-[400px]'>
              {chatHistory.map((chat, index1) => (chat.role === "user" ? 
                (
                  chat.parts.map((message, index2) => (
                    <UserChatBubble 
                      key={`user_${index1}_${index2}`}
                      content={message.text}
                    />
                  ))
                ) : (
                  chat.parts.map((message, index2) => (
                    <AiChatBubble 
                      key={`ai_${index1}_${index2}`}
                      content={message.text}
                    />
                  )))
              ))}
              {typingMessage && <AiChatBubble content={typingMessage}/>}
          </div>
      </div>
  
      <div className='w-full px-4 pb-4 pt-2 bg-slate-50 rounded-3xl'>
        <PromptField 
          chat={chat} 
          setChatHistory={setChatHistory}
          setTypingMessage={setTypingMessage}
        />
      </div>
    </div>
  )
}
