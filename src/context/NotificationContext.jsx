import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch System Notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        // Fetch Global News
        const { data: newsItems } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (notifs) setNotifications(notifs);
        if (newsItems) setNews(newsItems);
        
        const unreadNotifs = notifs ? notifs.filter(n => !n.read).length : 0;
        setUnreadCount(unreadNotifs);
      } catch (err) {
        // Fallback demo data
        setNotifications([
          { id: '1', title: 'System Online', message: 'Operational buffers synchronized.', type: 'system', created_at: new Date().toISOString(), read: false }
        ]);
        setNews([
          { 
            id: 'n1', 
            title: 'Neural Update v4.2', 
            description: 'Major optimization to the voice synthesis engine. Latency reduced by 40%.', 
            image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400',
            link_url: '#',
            created_at: new Date().toISOString()
          }
        ]);
        setUnreadCount(1);
      }
    };

    fetchData();

    // Real-time for notifications
    const notifChannel = supabase
      .channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      }).subscribe();

    // Real-time for news
    const newsChannel = supabase
      .channel('news')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, payload => {
        setNews(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      }).subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(newsChannel);
    };
  }, [userId]);

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await supabase.from('notifications').update({ read: true }).eq('id', id); } catch (_) {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await supabase.from('notifications').update({ read: true }).eq('user_id', userId); } catch (_) {}
  };

  return (
    <NotificationContext.Provider value={{ notifications, news, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
