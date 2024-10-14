import React from 'react'

const AiChatBubble = ({content} : {content : string}) => {
  return (
    <div className='chat chat-start'>
        <div className='chat-image avatar'>
            <div className='w-8 rounded-full'>
                <img 
                    alt="ai profile"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" 
                />
            </div>
        </div>
        <div className='chat-header'>Ai</div>
        <div className='rounded-3xl py-2.5 px-5 bg-slate-800 text-white whitespace-pre-wrap'>{content}</div>
    </div>
  )
}

export default AiChatBubble