"use client";

import React, { useState } from 'react';
import { useChatEngine } from '@/lib/hooks/useChatEngine';
import { supabase } from '@/lib/supabase';

export default function DebugChatPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string>('');
  
  const currentUserId = "USR-001"; // Fallback demo ID
  
  const { conversations, activeChat, setActiveChat, messages, handleSendMessage } = useChatEngine(currentUserId);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const testApiSend = async () => {
    if (!activeChat) {
      addLog("ERROR: No active chat selected!");
      return;
    }
    
    addLog(`Testing API Send to conversation ${activeChat}...`);
    try {
      const res = await fetch(`https://oceanexotic.com/api/chat/send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeChat,
          sender_id: currentUserId,
          message_text: "DEBUG: Testing API Send"
        })
      });
      
      const text = await res.text();
      addLog(`API Response Status: ${res.status}`);
      addLog(`API Response Body: ${text}`);
      
      if (res.ok) setTestResult('SUCCESS: API sent the message.');
      else setTestResult('FAILED: API returned an error.');
    } catch (err: any) {
      addLog(`API Exception: ${err.message}`);
      setTestResult('FAILED: Network Exception on API.');
    }
  };

  const testSupabaseDirect = async () => {
    if (!activeChat) {
      addLog("ERROR: No active chat selected!");
      return;
    }

    addLog(`Testing Direct Supabase Insert to conversation ${activeChat}...`);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: activeChat,
          sender_id: currentUserId,
          message_text: "DEBUG: Testing Direct Supabase Insert",
          is_read: 0
        }]);
        
      if (error) {
        addLog(`Supabase Error: ${JSON.stringify(error)}`);
        setTestResult('FAILED: Supabase RLS blocked the insert.');
      } else {
        addLog(`Supabase Insert Success: ${JSON.stringify(data)}`);
        setTestResult('SUCCESS: Supabase inserted the message.');
      }
    } catch (err: any) {
      addLog(`Supabase Exception: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 font-mono bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-blue-400">Chat Debugging Console</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold">1. Select Conversation</h2>
          <select 
            className="w-full bg-slate-900 border border-slate-600 p-2 text-white rounded"
            onChange={(e) => setActiveChat(Number(e.target.value))}
            value={activeChat || ''}
          >
            <option value="">-- Select a Chat --</option>
            {conversations.map(c => (
              <option key={c.id} value={c.id}>ID: {c.id} | {c.other_party_name}</option>
            ))}
          </select>
          <div className="text-sm text-slate-400">
            Active Chat ID: {activeChat || 'None'} <br/>
            Messages Loaded: {messages.length}
          </div>
        </div>

        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold">2. Run Tests</h2>
          <button 
            onClick={testApiSend}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded transition"
          >
            Test API (/api/chat/send_message)
          </button>
          
          <button 
            onClick={testSupabaseDirect}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded transition"
          >
            Test Supabase Direct Insert
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl font-bold ${testResult.includes('SUCCESS') ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}>
          {testResult}
        </div>
      )}

      <div className="bg-black p-4 rounded-xl border border-slate-700 h-96 overflow-y-auto">
        <h3 className="text-sm text-slate-500 mb-4 border-b border-slate-800 pb-2">Console Logs</h3>
        {logs.map((l, i) => (
          <div key={i} className="text-xs text-green-400 mb-1">{l}</div>
        ))}
        {logs.length === 0 && <div className="text-slate-600 italic">No logs yet...</div>}
      </div>
    </div>
  );
}
