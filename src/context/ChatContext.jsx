import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ChatContext = createContext(null);

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
};

const LS_PROJECTS = (uid) => `cloudz_projects_${uid}`;
const LS_CHATS    = (uid) => `cloudz_chats_${uid}`;

export const ChatProvider = ({ userId, children }) => {
  const [projects,    setProjects]    = useState([]);
  const [chats,       setChats]       = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loaded,       setLoaded]       = useState(false);

  /* ──────── Bootstrap from localStorage → then Supabase ──────── */
  useEffect(() => {
    if (!userId) return;

    // Fast local load
    try {
      const lp = JSON.parse(localStorage.getItem(LS_PROJECTS(userId)) || '[]');
      const lc = JSON.parse(localStorage.getItem(LS_CHATS(userId))    || '[]');
      if (lp.length) setProjects(lp);
      if (lc.length) {
        setChats(lc);
        setActiveChatId(lc[0]?.id ?? null);
      }
    } catch (_) {}

    // Background Supabase sync
    syncFromSupabase(userId);
  }, [userId]);

  const syncFromSupabase = async (uid) => {
    try {
      const [{ data: pData }, { data: cData }] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('chats').select('*').eq('user_id', uid).order('updated_at', { ascending: false }),
      ]);

      if (pData) {
        setProjects(pData);
        localStorage.setItem(LS_PROJECTS(uid), JSON.stringify(pData));
      }
      if (cData) {
        setChats(cData);
        localStorage.setItem(LS_CHATS(uid), JSON.stringify(cData));
        setActiveChatId(prev => {
          if (prev) return prev;
          return cData[0]?.id ?? null;
        });
      }
    } catch (e) {
      console.warn('Supabase chat sync failed (offline?)', e.message);
    } finally {
      setLoaded(true);
    }
  };

  /* ──────── Helpers ──────── */
  const persist = useCallback((uid, updProjects, updChats) => {
    if (uid) {
      localStorage.setItem(LS_PROJECTS(uid), JSON.stringify(updProjects));
      localStorage.setItem(LS_CHATS(uid), JSON.stringify(updChats));
    }
  }, []);

  /* ──────── Create Project ──────── */
  const createProject = useCallback(async (name) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic = { id: tempId, user_id: userId, name, created_at: new Date().toISOString() };
    const updProjects = [optimistic, ...projects];
    setProjects(updProjects);
    persist(userId, updProjects, chats);

    try {
      const { data } = await supabase.from('projects').insert({ user_id: userId, name }).select().single();
      if (data) {
        setProjects(prev => prev.map(p => p.id === tempId ? data : p));
      }
    } catch (e) { console.warn('createProject DB error', e.message); }
  }, [userId, projects, chats, persist]);

  /* ──────── Create Chat ──────── */
  const createChat = useCallback(async (projectId = null, title = 'New Chat') => {
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic = {
      id: tempId, user_id: userId,
      project_id: projectId,
      title, messages: [],
      created_at: now, updated_at: now
    };
    const updChats = [optimistic, ...chats];
    setChats(updChats);
    setActiveChatId(tempId);
    persist(userId, projects, updChats);

    try {
      const { data } = await supabase.from('chats')
        .insert({ user_id: userId, project_id: projectId, title, messages: [] })
        .select().single();
      if (data) {
        setChats(prev => prev.map(c => c.id === tempId ? data : c));
        setActiveChatId(data.id);
        persist(userId, projects, chats.map(c => c.id === tempId ? data : c));
      }
    } catch (e) { console.warn('createChat DB error', e.message); }

    return tempId;
  }, [userId, projects, chats, persist]);

  /* ──────── Update Chat (save messages + auto-title) ──────── */
  const updateChat = useCallback(async (chatId, messages) => {
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 48) + (firstUserMsg.content.length > 48 ? '…' : '')
      : 'New Chat';

    const now = new Date().toISOString();
    const updChats = chats.map(c =>
      c.id === chatId ? { ...c, messages, title, updated_at: now } : c
    );
    // Put updated chat first
    const sorted = [
      ...updChats.filter(c => c.id === chatId),
      ...updChats.filter(c => c.id !== chatId)
    ];
    setChats(sorted);
    persist(userId, projects, sorted);

    try {
      await supabase.from('chats')
        .update({ messages, title, updated_at: now })
        .eq('id', chatId).eq('user_id', userId);
    } catch (e) { console.warn('updateChat DB error', e.message); }
  }, [userId, projects, chats, persist]);

  /* ──────── Delete Chat ──────── */
  const deleteChat = useCallback(async (chatId) => {
    const updChats = chats.filter(c => c.id !== chatId);
    setChats(updChats);
    if (activeChatId === chatId) setActiveChatId(updChats[0]?.id ?? null);
    persist(userId, projects, updChats);

    try {
      await supabase.from('chats').delete().eq('id', chatId).eq('user_id', userId);
    } catch (e) { console.warn('deleteChat DB error', e.message); }
  }, [userId, projects, chats, activeChatId, persist]);

  /* ──────── Delete Project ──────── */
  const deleteProject = useCallback(async (projectId) => {
    const updProjects = projects.filter(p => p.id !== projectId);
    setProjects(updProjects);
    persist(userId, updProjects, chats);

    try {
      await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
    } catch (e) { console.warn('deleteProject DB error', e.message); }
  }, [userId, projects, chats, persist]);

  const activeChat = chats.find(c => c.id === activeChatId) ?? null;

  return (
    <ChatContext.Provider value={{
      projects, chats, activeChat, activeChatId, setActiveChatId,
      isGenerating, setIsGenerating,
      createProject, createChat, updateChat, deleteChat, deleteProject,
      loaded
    }}>
      {children}
    </ChatContext.Provider>
  );
};
