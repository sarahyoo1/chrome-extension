
const UserChatBubble = ({content} : {content : string | undefined}) => {
  return (
    <div className='chat chat-end'>
      <div className='rounded-3xl px-5 py-2.5 bg-gray-300 whitespace-pre-wrap text-black'>{content}</div>
    </div>
  )
}

export default UserChatBubble