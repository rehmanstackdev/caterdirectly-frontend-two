export const formatRelativeTime = (dateString: string): string => {
  // Convert UTC timestamp to local time
  const utcDate = new Date(dateString);
  const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
  const now = new Date();
  
  const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // For older messages, show the actual date in local time
  return localDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: localDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatMessageTime = (dateString: string): string => {
  const utcDate = new Date(dateString);
  const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
  return localDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};