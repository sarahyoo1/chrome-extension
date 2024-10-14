import React from 'react'

const UserChatBubble = ({content} : {content : string}) => {
  return (
    <div className='chat chat-end'>
      <div className='rounded-3xl px-5 py-2.5 bg-gray-300 whitespace-pre-wrap'>{content}</div>
    </div>
  )
}

export default UserChatBubble