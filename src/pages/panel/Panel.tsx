import '@pages/panel/Panel.css';
import { ChatList } from './ChatList';
import { useState } from 'react';
import { User } from "firebase/auth";
import { auth } from '../../libs/firebase';
import { signIn } from '../background';
import { add_problem, analyze_code } from '../apis';
import { take_screenshot } from '../utils';

export default function Panel(): JSX.Element {
const [user, setUser] = useState<User | null>();
const [successful, setSuccessful] = useState(false);

  const logIn = async () => {
    const user = await signIn();
    setUser(user);
  }

  const signOut = () => {
    auth.signOut().then(() => {
      setUser(null);
    })
  }

 const onClickCode = async () => {
  try {
    const url = await take_screenshot();
    const result = await analyze_code(url);
    await add_problem(result);
    setSuccessful(true);
  } catch (e) {
    console.error(e);
  }
 }

  return (
    <div className="flex flex-col h-full">
      <ChatList />
      <button onClick={onClickCode} className='btn'>Save Problem</button>
      {successful&&(
        <span className='text-white font-semibold'>Succeeded to add problem</span>
      )}
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

