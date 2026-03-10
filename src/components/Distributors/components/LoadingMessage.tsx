import React from "react";
import "./LoadingMessage.css";

interface LoadingMessageProps {
  message: string;
  submessage?: string;
  icon?: string;
}

/**
 * Expressive loading message component that communicates what's being processed.
 * Makes the loading experience more informative and engaging.
 */
const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message,
  submessage,
  icon = "⏳",
}) => {
  // Extract icon from message if it starts with an emoji, otherwise use prop
  const messageIcon = message.match(/^[\p{Emoji}]/u)?.[0] || icon;
  const messageText = message.replace(/^[\p{Emoji}]\s*/u, "").trim();
  
  return (
    <div className="loading-message" role="status" aria-live="polite">
      <div className="loading-message__icon">{messageIcon}</div>
      <div className="loading-message__content">
        <div className="loading-message__text">{messageText}</div>
        {submessage && (
          <div className="loading-message__subtext">{submessage}</div>
        )}
      </div>
    </div>
  );
};

export default LoadingMessage;

