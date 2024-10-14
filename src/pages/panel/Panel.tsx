import '@pages/panel/Panel.css';
import { ChatList } from './ChatList';

export default function Panel(): JSX.Element {

  return (
    <div className="flex flex-col h-full">
      <ChatList />
    </div>
  );
}
