import React from 'react';
import AdminMessagingHub from '@/components/admin/messaging/AdminMessagingHub';
import { useHostChat } from '@/hooks/use-host-chat';

const HostMessagingHub = () => {
  const hostChatHook = useHostChat();
  
  // Pass the host chat hook to the admin messaging component
  return <AdminMessagingHub customHook={hostChatHook} />;
};

export default HostMessagingHub;