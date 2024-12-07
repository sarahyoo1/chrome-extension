import '@pages/panel/Panel.css';
import { ChatList } from './ChatList';
import { useState } from 'react';
import { User } from "firebase/auth";
import { auth } from '../../libs/firebase';
import { signIn } from '../background';

export default function Panel(): JSX.Element {
const [user, setUser] = useState<User | null>();

  const logIn = async () => {
    const user = await signIn();
    setUser(user);
  }

  const signOut = () => {
    auth.signOut().then(() => {
      setUser(null);
    })
  }

  return (
    <div className="flex flex-col h-full">
      <ChatList />
      {user ? (
        <>
          <p className='text-white'>{user.email}</p>
          <button onClick={signOut} className='btn'>Log Out</button>
        </>
      ) : (
        <button onClick={logIn} className='btn'>Sign In</button>
      )}
    </div>
  );
}

