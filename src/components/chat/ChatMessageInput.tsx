
import { KeyboardEvent } from 'react';
import { Send, Paperclip, Image, Smile, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
}

const ChatMessageInput = ({ newMessage, setNewMessage, sendMessage }: ChatMessageInputProps) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-[#FFE4D6]">
      <div className="relative flex items-center">
        <Input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="pr-32 py-6 rounded-full bg-white/80 border-[#FFE4D6] focus:border-[#FF7F50] focus:ring-[#FF7F50]"
        />
        <div className="absolute right-2 flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-[#FFE4D6] hover:text-[#FF7F50]">
            <Smile className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-[#FFE4D6] hover:text-[#FF7F50]">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-[#FFE4D6] hover:text-[#FF7F50]">
            <Image className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-[#FFE4D6] hover:text-[#FF7F50]">
            <Mic className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            className="h-9 w-9 bg-[#FF7F50] hover:bg-[#FF6B3D]"
            onClick={sendMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageInput;
