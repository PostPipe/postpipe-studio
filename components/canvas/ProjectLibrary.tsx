'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Search, Clock, Trash2, Layout, Plus, Check, Loader2, Trash } from 'lucide-react';
import { getCanvases, saveCanvas, deleteCanvas } from '@/app/actions/canvas';

interface ProjectLibraryProps {
  userId: string;
  onLoad: (nodes: any[], edges: any[], name: string, id: string) => void;
  currentNodes: any[];
  currentEdges: any[];
  dragControls: any;
  refreshKey?: number;
  onNewProject: () => void;
}

export function ProjectLibrary({ userId, onLoad, currentNodes, currentEdges, dragControls, refreshKey, onNewProject }: ProjectLibraryProps) {
  const [canvases, setCanvases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCanvases = async () => {
    console.log('[ProjectLibrary] Fetching for:', userId);
    setLoading(true);
    // Add a small delay to ensure DB write is ready
    setTimeout(async () => {
      const res = await getCanvases(userId);
      console.log('[ProjectLibrary] Fetch result:', res);
      if (res.success) setCanvases(res.canvases);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (userId) fetchCanvases();
  }, [userId, refreshKey]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    const res = await saveCanvas(userId, saveName, currentNodes, currentEdges);
    if (res.success) {
      setSaveName('');
      setShowSaveInput(false);
      fetchCanvases();
    }
    setSaving(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    const res = await deleteCanvas(id);
    if (res.success) {
      fetchCanvases();
    }
  };

  const filtered = canvases.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-80 h-full flex flex-col bg-[#0a0a0b] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
      
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="px-6 pt-6 pb-2 relative z-10 cursor-grab active:cursor-grabbing flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 pointer-events-none">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <FolderOpen className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight uppercase tracking-widest text-xs opacity-80">Projects</h2>
        </div>
        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={onNewProject}
          className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 pb-4 relative z-10">
        <div className="relative group/search mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-700"
          />
        </div>

        <AnimatePresence>
          {showSaveInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2 mb-4"
            >
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Canvas name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleSave}
                disabled={saving || !saveName.trim()}
                className="w-full py-2 bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                <span>{saving ? 'Saving...' : 'Save Workspace'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 custom-scrollbar" data-lenis-prevent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-20" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Library</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-6 border border-dashed border-white/5 rounded-3xl">
            <Layout className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">No projects found. Build something and save it to your library.</p>
          </div>
        ) : (
          filtered.map((c) => (
            <motion.div
              key={c._id}
              onClick={() => onLoad(c.nodes, c.edges, c.name, c._id)}
              className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 cursor-pointer transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <button
                      onClick={(e) => handleDelete(e, c._id)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-400">{c.nodes?.length || 0}</span>
                    <span>nodes</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
