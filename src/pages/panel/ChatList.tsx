import { AiChatBubble, PromptField, UserChatBubble } from '@src/components'
import { useState } from 'react';

export type Chat = {
  isUser: boolean;
  content: string;
  timestamp: number;
}

export const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);

  return (
    <div className='bg-slate-50 w-11/12 rounded-3xl mx-auto flex flex-col'>
      <div className='px-2 pt-2 rounded-3xl h-[400px]'>
          <div className='overflow-y-auto w-full max-h-[400px]'>
              {chats.map((chat, index) => (chat.isUser ? 
                (<UserChatBubble 
                  key={index} 
                  content={chat.content}
                />) : (
                <AiChatBubble 
                  key={index} 
                  content={chat.content} 
                />)
              ))}
          </div>
      </div>
  
      <div className='w-full px-4 pb-4 pt-2 bg-slate-50 rounded-3xl'>
        <PromptField setChats={setChats}/>
      </div>
    </div>
  )
}
