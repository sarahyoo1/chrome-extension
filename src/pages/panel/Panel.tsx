import '@pages/panel/Panel.css';
import { ChatList } from './ChatList';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from '../../libs/firebase';

export default function Panel(): JSX.Element {
const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

  return unsubscribe;
  }, []);


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
