'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Plus, MessageSquare, PanelLeftClose, PanelLeft, Send, Sparkles, X, GripHorizontal, Loader2, ChevronDown, Square, Trash2, Copy, Check, Zap, User, Layout } from "lucide-react";
import { PikoLogo } from "@/components/ui/piko-logo";
import { sendPikoMessage, getPikoHistory, getPikoConversation, deletePikoConversation } from "@/app/actions/piko";

interface Message {
  role: 'user' | 'piko';
  content: string;
  reasoning?: string;
  actionTaken?: any;
  result?: any;
}

interface Snippet {
  id: string;
  name: string;
  html: string;
  react: string;
  type: 'form' | 'auth';
}


interface PikoChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  dragConstraints?: React.RefObject<any>;
  dragMomentum?: boolean;
  initialPrompt?: string;
  onPromptConsumed?: () => void;
  onTaskComplete?: () => void;
}

const WELCOME_MSG: Message = {
  role: 'piko',
  content: "Hi! I'm Piko. Describe the architecture, database schema, or backend logic you want to build, and I'll generate it directly on the canvas for you."
};


export function PikoChatWindow({ isOpen, onClose, dragConstraints, dragMomentum = false, initialPrompt, onPromptConsumed, onTaskComplete }: PikoChatWindowProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [message, setMessage] = useState("");
  const [pendingOptions, setPendingOptions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [isLoading, setIsLoading] = useState(false);
  const [allSnippets, setAllSnippets] = useState<Snippet[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Trigger initial prompt if passed
  useEffect(() => {
    if (initialPrompt && isOpen && !isLoading) {
      handleSendMessage(initialPrompt);
      onPromptConsumed?.();
    }
  }, [initialPrompt, isOpen]);

  const dragControls = useDragControls();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`; // 192px = 12rem = max-h-48
    }
  }, [message]);

  // --- Helpers ---

  const extractOptions = (result: any, actionType: string): {label: string, id: string}[] => {
    if (!result) return [];
    if (result.error) return []; // Don't extract from error results
    
    if (actionType === "get_connectors") {
      if (typeof result === 'object' && !Array.isArray(result)) {
        return Object.entries(result)
          .filter(([k]) => k !== 'error')
          .map(([k, v]) => ({ label: k, id: String(v) }));
      }
    }
    
    if (actionType === "get_databases") {
      if (result.databases && typeof result.databases === 'object') {
        return Object.entries(result.databases).map(([k, v]) => {
          const actualId = (typeof v === 'object' && v !== null) ? ((v as any).id || (v as any).$oid || JSON.stringify(v)) : String(v);
          return { label: k, id: actualId };
        });
      }
    }
    
    return [];
  };

  const renderMessageContent = (content: string, isPiko: boolean = false) => {
    const trimmed = content.trim();

    // Only intercept JSON parsing for Piko's system actions
    if (isPiko) {
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          const data = JSON.parse(match[0]);
          if (data.action) {
            if (data.action === "ask_clarification") return <p>{data.params?.question || ""}</p>;
            if (data.action === "task_complete") {
              return (
                <div className="space-y-4">
                  <p className="font-bold text-emerald-400 flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{data.params?.message || "All systems deployed successfully."}</span>
                  </p>
                  {allSnippets.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Generated Assets</p>
                      {allSnippets.map(s => <SnippetAccordion key={s.id} snippet={s} />)}
                    </div>
                  )}
                </div>
              );
            }
            return null; // Hide other internal actions
          }
        }
      } catch (e) { }

      // Hide partial streaming actions
      if (trimmed.startsWith('{"action"')) return null;
    }

    // Strip markdown fences
    const cleanContent = content.replace(/```\w*\n?/g, '').replace(/```/g, '');
    return <p className="whitespace-pre-wrap mb-2 last:mb-0">{cleanContent}</p>;
  };

  const isThinkingMessage = (content: string, reasoning?: string): boolean => {
    // Show accordion if it has reasoning OR if it's a JSON action
    if (reasoning && reasoning.length > 0) return true;
    const trimmed = content.trim();
    return trimmed.includes('"action":') || trimmed.startsWith('{');
  };

  // --- Effects ---

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("piko_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("piko_api_key", apiKey);
    }
  }, [apiKey]);

  // Generate session ID on mount + fetch history
  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
    fetchHistory();
  }, [sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Data Fetching ---

  const fetchHistory = async () => {
    const data = await getPikoHistory();
    if (data && Array.isArray(data)) setHistory(data);
  };

  const loadConversation = async (sid: string) => {
    setIsLoading(true);
    setPendingOptions([]);
    const data = await getPikoConversation(sid);
    if (data) {
      setSessionId(data.sessionId);
      if (data.apiKey) setApiKey(data.apiKey);
      const mappedMessages: Message[] = (data.displayMessages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'piko' as const : m.role as 'user',
        content: m.content,
        actionTaken: m.actionTaken,
        result: m.result
      }));
      setMessages(mappedMessages.length > 0 ? mappedMessages : [WELCOME_MSG]);
    }
    setIsLoading(false);
  };

  const startNewChat = () => {
    setSessionId(crypto.randomUUID());
    setMessages([WELCOME_MSG]);
    setPendingOptions([]);
    setAllSnippets([]);
    setMessage("");
  };

  // --- Handlers ---

  const deleteConversation = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePikoConversation(sid);
    if (sid === sessionId) startNewChat();
    fetchHistory();
  };

  const handleInteraction = (type: string, label: string, id: string) => {
    handleSendMessage(`I select the ${type} "${label}" (ID: ${id}). Please proceed.`);
  };

  const handleSendMessage = async (customMsg?: string, isAutoLoop: boolean = false) => {
    const msgToSend = customMsg !== undefined ? customMsg : message.trim();
    if (!isAutoLoop && !msgToSend && !isLoading) return;

    if (!isAutoLoop) {
      setMessage("");
      setPendingOptions([]);
      setMessages(prev => [...prev, { role: 'user', content: msgToSend }]);
    }

    setIsLoading(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    // Add an empty streaming message placeholder with reasoning
    const streamingId = Date.now();
    setMessages(prev => [...prev, { role: 'piko', content: '', reasoning: '', _streamingId: streamingId } as any]);

    const PIKO_API = process.env.NEXT_PUBLIC_PIKO_API_URL || 'http://localhost:8000/api';

    try {
      const response = await fetch(`${PIKO_API}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgToSend, sessionId, apiKey }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) throw new Error(`API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'token') {
              // Append token to the streaming placeholder
              setMessages(prev => prev.map(m =>
                (m as any)._streamingId === streamingId
                  ? { ...m, content: m.content + event.content }
                  : m
              ));
            } else if (event.type === 'reasoning') {
              // Append reasoning token
              setMessages(prev => prev.map(m =>
                (m as any)._streamingId === streamingId
                  ? { ...m, reasoning: (m.reasoning || '') + event.content }
                  : m
              ));
            } else if (event.type === 'preview_update') {
              // Trigger canvas refresh IMMEDIATELY while streaming is still active
              // onTaskComplete?.();
            } else if (event.type === 'done') {
              // Handle snippet aggregation
              if (event.actionTaken && (event.actionTaken.action === 'get_form_snippets' || event.actionTaken.action === 'get_auth_snippets')) {
                const res = event.result;
                if (res && !res.error) {
                  const snippetsObj = res.snippets || {};
                  const newSnippet: Snippet = {
                    id: res.id || res.formId || res.presetId || Date.now().toString(),
                    name: res.name || res.formName || res.presetName || (event.actionTaken.action === 'get_auth_snippets' ? 'Auth Preset' : 'Form'),
                    html: snippetsObj.html || res.html || '',
                    react: snippetsObj.react || res.react || res.code || '',
                    type: event.actionTaken.action === 'get_form_snippets' ? 'form' : 'auth'
                  };
                  setAllSnippets(prev => {
                    const exists = prev.findIndex(s => s.id === newSnippet.id);
                    if (exists !== -1) {
                      const updated = [...prev];
                      updated[exists] = newSnippet;
                      return updated;
                    }
                    return [...prev, newSnippet];
                  });
                }
              }

              // Replace placeholder with final structured message
              setMessages(prev => prev.map(m =>
                (m as any)._streamingId === streamingId
                  ? { role: 'piko', content: event.response, reasoning: m.reasoning, actionTaken: event.actionTaken, result: event.result }
                  : m
              ));

              fetchHistory();
              // Trigger canvas refresh if it's an action that likely created/updated something
              if (event.actionTaken && ['create_form', 'create_auth_preset', 'update_form', 'update_auth_preset', 'task_complete', 'get_form_snippets', 'get_auth_snippets'].includes(event.actionTaken.action)) {
                // onTaskComplete?.();
              }
              if (event.result && event.actionTaken) {
                const opts = extractOptions(event.result, event.actionTaken.action);
                if (opts.length > 0 && opts.length <= 10) {
                  setPendingOptions(opts);
                } else if (!['ask_clarification', 'task_complete', 'get_connectors', 'get_databases'].includes(event.actionTaken.action)) {
                  // Auto-loop for architectural tasks
                  setTimeout(() => handleSendMessage('', true), 100);
                }
              }
            } else if (event.type === 'error') {
              setMessages(prev => prev.map(m =>
                (m as any)._streamingId === streamingId
                  ? { role: 'piko', content: `Error: ${event.content}` }
                  : m
              ));
            }
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          (m as any)._streamingId === streamingId
            ? { ...m, content: m.content + '\n\n_[Stopped]_' }
            : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          (m as any)._streamingId === streamingId
            ? { role: 'piko', content: 'Something went wrong. Is the Piko backend running at http://localhost:8000?' }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsLoading(false);
    setPendingOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render ---

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={dragMomentum}
          dragConstraints={dragConstraints}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
          transition={{ duration: 0.3, ease: "circOut" }}
          className="absolute left-32 top-24 z-50 w-[700px] h-[650px] max-w-[calc(100vw-4rem)] max-h-[calc(100vh-8rem)] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex border border-white/5 rounded-3xl"
        >
          {/* Enhanced Glass background for better readability */}
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl z-0" />

          {/* Subtle gradient overlay to give it a premium feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none z-0" />

          <div
            className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />

          {/* Main Content */}
          <div className="relative z-10 flex w-full h-full">

            {/* ========== SIDEBAR ========== */}
            <motion.div
              initial={false}
              animate={{ width: isSidebarOpen ? 220 : 0, opacity: isSidebarOpen ? 1 : 0 }}
              className="flex flex-col bg-black/20 border-r border-white/5 overflow-hidden shrink-0"
            >
              {/* New Chat Button */}
              <div className="p-4 min-w-[220px]">
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center justify-start space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 min-w-[220px] pb-4 custom-scrollbar" data-lenis-prevent>
                {/* API Key */}
                <div className="px-3 mb-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">API Key</h4>
                  <input
                    type="password"
                    placeholder="pp_piko_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  {apiKey && (
                    <div className="mt-1 text-[10px] text-emerald-500/70">  Key saved locally</div>
                  )}
                </div>

                {/* Chat History */}
                <div className="space-y-1">
                  <h4 className="px-3 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recent</h4>
                  {history.map((conv) => (
                    <div
                      key={conv.sessionId}
                      className={`group w-full flex items-center rounded-lg transition-colors text-sm ${conv.sessionId === sessionId ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-300 hover:text-white'}`}
                    >
                      <button
                        onClick={() => loadConversation(conv.sessionId)}
                        className="flex-1 flex items-center space-x-3 px-3 py-2.5 text-left min-w-0"
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${conv.sessionId === sessionId ? 'text-cyan-400' : 'text-zinc-500'}`} />
                        <span className="truncate">{conv.title || "New Chat"}</span>
                      </button>
                      <button
                        onClick={(e) => deleteConversation(conv.sessionId, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 mr-1 text-zinc-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="px-3 text-xs text-zinc-600 italic">No recent chats</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ========== CHAT AREA ========== */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent">

              {/* Header */}
              <div
                className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-transparent cursor-grab active:cursor-grabbing select-none shrink-0"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="flex items-center space-x-3 pointer-events-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center space-x-2">
                    <PikoLogo selected={false} className="w-4 h-4" />
                    <span className="font-bold text-xs text-white/90 tracking-tight">Piko AI</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors pointer-events-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar"
                data-lenis-prevent
              >
                {messages.map((msg, index) => {
                  const isConsecutivePiko = index > 0 && messages[index - 1].role === 'piko' && msg.role === 'piko';
                  const showAvatar = msg.role === 'user' || !isConsecutivePiko;
                  const isLastMessage = index === messages.length - 1;

                  return (
                    <div key={index} className={`flex items-start max-w-2xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''} ${isConsecutivePiko ? 'pt-1' : 'pt-6'}`}>
                      {/* Avatar */}
                      {showAvatar ? (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'ml-4' : 'mr-4'} ${msg.role === 'piko' ? 'bg-white/5 border border-white/5' : 'bg-zinc-800 border border-white/10'}`}>
                          {msg.role === 'piko' ? (
                            <PikoLogo selected={false} className="w-5 h-5" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                      ) : (
                        <div className={`w-8 shrink-0 ${msg.role === 'user' ? 'ml-4' : 'mr-4'}`} />
                      )}

                      {/* Bubble */}
                      <div className={`flex-1 space-y-2 ${msg.role === 'user' ? 'text-right' : ''} overflow-hidden min-w-0`}>
                      <div className={`inline-block text-sm leading-relaxed p-3.5 rounded-2xl max-w-full break-words ${msg.role === 'piko'
                        ? 'text-zinc-300 bg-white/5 border border-white/5'
                        : 'bg-zinc-800 text-white border border-white/10'
                        }`}>
                          {msg.role === 'piko' ? (
                            <>
                              {/* Thinking accordion: open if it's the latest message so user sees it in real-time */}
                              {isThinkingMessage(msg.content, msg.reasoning) ? (
                                <>
                                  <details open={isLastMessage} className="group">
                                    <summary className="text-[11px] text-blue-400/70 cursor-pointer hover:text-blue-300 font-mono list-none flex items-center space-x-1.5 select-none">
                                      <ChevronDown className="w-3 h-3 group-open:rotate-0 -rotate-90 transition-transform" />
                                      <span>Piko&apos;s reasoning</span>
                                    </summary>
                                    <div className="mt-2 p-2.5 bg-black/30 rounded-lg border border-white/5 text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-40 overflow-y-auto">
                                      {msg.reasoning && (
                                        <div className="text-blue-300/80 mb-2 whitespace-pre-wrap leading-relaxed border-b border-white/5 pb-2">
                                          {msg.reasoning}
                                        </div>
                                      )}
                                      {msg.content && msg.content.includes('{') && (
                                        <div className="text-zinc-500 whitespace-pre-wrap">{msg.content}</div>
                                      )}
                                    </div>
                                  </details>
                                  {/* Clean parsed output */}
                                  <div className="mt-2 text-sm">
                                    {renderMessageContent(msg.content, true)}
                                  </div>
                                </>
                              ) : (
                                <div>{renderMessageContent(msg.content, true)}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-left">{renderMessageContent(msg.content, false)}</div>
                          )}

                          {/* Rich Results */}
                          {msg.result && typeof msg.result === 'object' && (() => {
                            const r = msg.result;
                            const action = msg.actionTaken?.action;

                            // --- Connector Table ---
                            if (action === 'get_connectors' && !r.error && typeof r === 'object' && !Array.isArray(r)) {
                              const rows = Object.entries(r).filter(([k]) => k !== 'error');
                              return (
                                <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-white/5 text-left">
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">Connector Name</th>
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.map(([name, id], i) => {
                                        const actualId = (typeof id === 'object' && id !== null) ? ((id as any).id || (id as any).$oid || JSON.stringify(id)) : String(id);
                                        return (
                                          <tr 
                                            key={i} 
                                            onClick={() => handleInteraction('connector', name, actualId)}
                                            className={`border-t border-white/5 cursor-pointer hover:bg-white/10 transition-colors ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}
                                          >
                                            <td className="px-4 py-2.5 text-white font-medium">{name}</td>
                                            <td className="px-4 py-2.5 text-zinc-500 font-mono">
                                              {actualId}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }
 
                            // --- Database Table ---
                            if (action === 'get_databases' && r.databases && typeof r.databases === 'object') {
                              const rows = Object.entries(r.databases);
                              
                              if (rows.length === 0) {
                                return (
                                  <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                                    <strong>No databases found for this connector.</strong>
                                    <p className="mt-1 opacity-80">You can manually type the target database (e.g. "mongodb-uri") in the chat bar below to proceed.</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-white/5 text-left">
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">Database Name</th>
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.map(([name, id], i) => {
                                        const actualId = (typeof id === 'object' && id !== null) ? ((id as any).id || (id as any).$oid || JSON.stringify(id)) : String(id);
                                        return (
                                          <tr 
                                            key={i} 
                                            onClick={() => handleInteraction('database', name, actualId)}
                                            className={`border-t border-white/5 cursor-pointer hover:bg-white/10 transition-colors ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}
                                          >
                                            <td className="px-4 py-2.5 text-white font-medium">{name}</td>
                                            <td className="px-4 py-2.5 text-zinc-500 font-mono">
                                              {actualId}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }

                            // --- Forms Table ---
                            if (action === 'list_forms' && Array.isArray(r)) {
                              return (
                                <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-white/5 text-left">
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">Form Name</th>
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">Fields</th>
                                        <th className="px-4 py-2.5 text-zinc-400 font-bold uppercase tracking-wider">ID</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {r.map((form: any, i: number) => (
                                        <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-black/20' : 'bg-black/10'}`}>
                                          <td className="px-4 py-2.5 text-white font-medium">{form.name || 'Unnamed'}</td>
                                          <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${form.status === 'Live' ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                              {form.status || 'Draft'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-zinc-300 font-mono">{form.fieldCount || 0}</td>
                                          <td className="px-4 py-2.5 text-zinc-500 font-mono">{form.id}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }


                            // --- Snippet View (New & Improved) ---
                            if ((action === 'get_form_snippets' || action === 'get_auth_snippets') && r && !r.error) {
                              const snippetsObj = r.snippets || {};
                              const snippet: Snippet = {
                                id: r.id || r.formId || r.presetId || 'single',
                                name: r.name || r.formName || r.presetName || (action === 'get_auth_snippets' ? 'Auth Preset' : 'Form'),
                                html: snippetsObj.html || r.html || '',
                                react: snippetsObj.react || r.react || r.code || '',
                                type: action === 'get_form_snippets' ? 'form' : 'auth'
                              };
                              return <SnippetAccordion snippet={snippet} />;
                            }

                            // --- Generic JSON fallback ---
                            return (
                              <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/10 text-xs overflow-x-auto">
                                <pre className="text-zinc-300 whitespace-pre-wrap"><code>{JSON.stringify(r, null, 2)}</code></pre>
                              </div>
                            );
                          })()}

                          {/* Action tag */}
                          {msg.actionTaken && (
                            <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono">
                              <Zap className="w-3 h-3 text-cyan-400" />
                              <span>{msg.actionTaken.action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start space-x-4 max-w-2xl mx-auto">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <PikoLogo selected={false} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex items-center space-x-2 text-blue-400/70 text-sm italic">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Piko is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Select Options */}
              <AnimatePresence>
                {pendingOptions.length > 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-6 pb-2 shrink-0"
                  >
                    <div className="flex flex-wrap gap-2">
                      {pendingOptions.map((opt: any, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (opt.id) {
                              const type = (opt.label.toLowerCase().includes('db') || opt.label.toLowerCase().includes('database') || opt.label.toLowerCase().includes('mongo') || opt.label.toLowerCase().includes('postgres') || opt.label.toLowerCase().includes('mysql') || (opt.label.toLowerCase().includes('vercel') && !opt.label.toLowerCase().includes('conn'))) ? 'database' : 'connector';
                              handleInteraction(type, opt.label, opt.id);
                            } else {
                              handleSendMessage(opt.label || opt);
                            }
                          }}
                          className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-sm transition-colors"
                        >
                          {opt.label || opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-4 bg-transparent max-w-3xl w-full mx-auto pb-6 shrink-0">
                <div className="relative flex items-center bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-1.5 shadow-2xl focus-within:border-cyan-500/30 transition-all">
                  <button className="p-2 text-zinc-500 hover:text-white transition-colors shrink-0 rounded-xl hover:bg-white/5">
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Piko to build..."
                    className="w-full max-h-48 bg-transparent text-white placeholder:text-zinc-500 text-sm resize-none focus:outline-none py-2 px-2 leading-relaxed"
                    rows={1}
                  />
                  <button
                    onClick={isLoading ? handleStop : () => handleSendMessage()}
                    className={`p-2.5 transition-colors shrink-0 rounded-xl ml-2 ${isLoading
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                      : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500'
                      }`}
                    disabled={!isLoading && !message.trim()}
                  >
                    {isLoading ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
                <div className="text-center mt-3">
                  <span className="text-[10px] font-medium text-zinc-500">Piko can make mistakes. Verify the generated architecture.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function SnippetAccordion({ snippet }: { snippet: Snippet }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'react'>('react');
  const [copied, setCopied] = useState(false);

  const cleanCode = (code: string) => {
    if (!code) return "";
    // Handle escaped characters and newlines
    let cleaned = code;
    try {
      // If it's a stringified JSON string, parse it first? 
      // Usually the backend sends a raw string with literal \n
      cleaned = cleaned.replace(/\\n/g, '\n')
                      .replace(/\\"/g, '"')
                      .replace(/\\t/g, '  ')
                      .replace(/\\\\/g, '\\');
    } catch (e) {
      console.error("Error cleaning code:", e);
    }
    return cleaned.trim();
  };

  const handleCopy = () => {
    const codeToCopy = activeTab === 'html' ? snippet.html : snippet.react;
    navigator.clipboard.writeText(cleanCode(codeToCopy));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const htmlCode = cleanCode(snippet.html);
  const reactCode = cleanCode(snippet.react);

  return (
    <div className="mt-4 border border-white/10 rounded-2xl overflow-hidden bg-black/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${snippet.type === 'auth' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
            {snippet.type === 'auth' ? <Zap className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
          </div>
          <span className="font-bold text-sm text-white tracking-tight">{snippet.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-3">
              {/* Tabs */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex p-0.5 bg-white/5 rounded-lg border border-white/5">
                  <button
                    onClick={() => setActiveTab('react')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'react' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    React Component
                  </button>
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'html' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Vanilla HTML
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy {activeTab.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Area */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
                <div className="max-h-[400px] overflow-auto custom-scrollbar bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre">
                  <code>{activeTab === 'html' ? htmlCode : reactCode}</code>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
