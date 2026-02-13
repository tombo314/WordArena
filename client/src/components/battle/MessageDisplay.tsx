interface MessageDisplayProps {
  messageFriend: string;
  messageEnemy: string;
}

export default function MessageDisplay({ messageFriend, messageEnemy }: MessageDisplayProps) {
  return (
    <div className="wrapper-message">
      <div className="sub-wrapper-message">
        <span>output</span>
        <span className="message-text">{messageFriend}</span>
      </div>
      <div className="margin" />
      <div className="sub-wrapper-message">
        <span>output</span>
        <input className="message-text" type="text" value={messageEnemy} readOnly />
      </div>
    </div>
  );
}
