'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  FileText, Shield, Database, Globe, Plus, Trash2, X, ChevronDown, 
  StickyNote, Settings2, Link2, RefreshCw, CheckCircle, Loader2,
  Type, Mail, Hash, List, Calendar, Key, User as UserIcon, Lock, Layout
} from 'lucide-react';
import { FIELD_TYPES } from './ComponentLibrary';

const baseHandle = 'w-3 h-3 border-2 border-[#030304] rounded-full transition-all hover:scale-125 hover:border-white shadow-lg z-50';

// ── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomDropdown({ value, options, onChange, className = "" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`} onMouseDown={e => e.stopPropagation()}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-2 py-1 cursor-pointer hover:bg-black/60 transition-all"
      >
        <span className="text-[9px] text-zinc-300 font-medium truncate pr-1">{selected?.label || value}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 z-[101] w-64 bg-[#0d0d0e] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-1 duration-200 max-h-48 overflow-y-auto">
            {options.map((opt: any) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-1.5 text-[9px] cursor-pointer transition-colors ${value === opt.value ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Node Wrapper ─────────────────────────────────────────────────────────────
const NodeWrapper = ({ children, selected, color }: { children: React.ReactNode, selected: boolean, color: string }) => (
  <div className={`min-w-[320px] rounded-[1.25rem] border transition-all duration-300 relative group overflow-hidden ${selected
    ? `border-${color}-500/50 shadow-[0_0_30px_rgba(34,211,238,0.15)] ring-1 ring-${color}-500/20`
    : 'border-white/10 hover:border-white/20 shadow-2xl'
    } bg-[#0a0a0b]/80 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]`}>
    {selected && <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent pointer-events-none rounded-[1.25rem]`} />}
    {children}
  </div>
);

// ── Form Node ─────────────────────────────────────────────────────────────────
export function FormNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as any;
  const [expanded, setExpanded] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const fields: any[] = data.fields as any[] || [];

  const addField = () => {
    data.onUpdate?.({ ...data, fields: [...fields, { name: 'new_field', type: 'text', required: false, isRelational: false }] });
  };

  const removeField = (i: number) => {
    data.onUpdate?.({ ...data, fields: fields.filter((_: any, idx: number) => idx !== i) });
  };

  const updateField = (i: number, key: string, val: any) => {
    const next = [...fields];
    next[i] = { ...next[i], [key]: val };
    data.onUpdate?.({ ...data, fields: next });
  };

  return (
    <NodeWrapper selected={selected} color="cyan">
      <Handle type="target" position={Position.Left} className={`${baseHandle} bg-blue-500`} />

      {/* Header */}
      <div className="flex items-center space-x-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
          <FileText className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            className="w-full bg-transparent text-white text-[13px] font-bold focus:outline-none placeholder:text-zinc-600 truncate"
            value={String(data.label ?? 'Form')}
            onChange={e => data.onUpdate?.({ ...data, label: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
          />
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Schema Definition</div>
        </div>

        {data.sourceDatabase && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <Database className="w-2.5 h-2.5 text-cyan-400" />
            <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider whitespace-nowrap">{data.sourceDatabase}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
            className={`p-1.5 rounded-lg transition-all ${data.notes ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Custom Instructions"
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
            title="Delete Component"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${data.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-white/5'}`}>
            {String(data.status ?? 'Draft')}
          </span>
          <button onClick={() => setExpanded(v => !v)} className="text-zinc-500 hover:text-white transition-colors p-1">
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? '' : '-rotate-90'}`} />
          </button>
        </div>
      </div>

      {/* Source DB Selection */}
      <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center justify-between">
        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Source DB</div>
        <CustomDropdown
          value={data.sourceDatabase}
          options={(data.availableDatabases || []).map((db: string) => ({ label: db, value: db }))}
          onChange={(val: string) => data.onUpdate?.({ ...data, sourceDatabase: val })}
          className="min-w-[120px]"
        />
      </div>

      {/* Notes Area */}
      {showNotes && (
        <div className="p-3 bg-amber-500/5 border-b border-white/5">
          <textarea
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-[11px] text-amber-200 focus:outline-none min-h-[60px] placeholder:text-zinc-700"
            placeholder="Custom instructions for Piko..."
            value={data.notes || ''}
            onChange={e => data.onUpdate?.({ ...data, notes: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Fields */}
      {expanded && (
        <div className="p-3 pb-10 space-y-3">
          {/* Stats Badge */}
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center space-x-2">
               <span>Fields ({fields.length})</span>
               {data.relationCount > 0 && (
                 <span className="text-purple-400">/ {data.relationCount} Relations</span>
               )}
            </div>
            <div className="flex items-center space-x-2">
              {data.referencedByCount > 0 && (
                <div className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[8px] font-black uppercase tracking-tighter">
                  Referenced by {data.referencedByCount}
                </div>
              )}
              {fields.some(f => f.type === 'relational' || f.type === 'reference' || f.reference) && (
                <div className="flex items-center space-x-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 text-[8px] font-black uppercase tracking-tighter">
                  <Link2 className="w-2.5 h-2.5" />
                  <span>Relational Source</span>
                </div>
              )}
            </div>
          </div>

          {fields.map((f: any, i: number) => {
            const getIcon = (type: string) => {
               switch(type) {
                 case 'text': return <Type className="w-3 h-3" />;
                 case 'email': return <Mail className="w-3 h-3" />;
                 case 'number': return <Hash className="w-3 h-3" />;
                 case 'dropdown': return <List className="w-3 h-3" />;
                 case 'relational': return <Link2 className="w-3 h-3" />;
                 case 'reference': return <Link2 className="w-3 h-3" />;
                 default: return <FileText className="w-3 h-3" />;
               }
            };

            return (
              <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-3 space-y-2 group/field relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover/field:text-cyan-400 transition-colors">
                      {getIcon(f.type)}
                    </div>
                    <input
                      className="flex-1 bg-transparent text-[11px] text-white focus:outline-none min-w-0 font-medium"
                      value={f.name}
                      onChange={e => updateField(i, 'name', e.target.value)}
                      onMouseDown={e => e.stopPropagation()}
                    />
                    {f.required && (
                      <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-md border border-cyan-500/20 font-black uppercase">REQ</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <CustomDropdown
                      value={f.type}
                      options={FIELD_TYPES}
                      onChange={(val: any) => updateField(i, 'type', val)}
                      className="min-w-[80px]"
                    />
                    <button onClick={() => removeField(i)} className="text-zinc-600 hover:text-red-400 transition-all p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Relational Options */}
                {(f.type === 'relational' || f.type === 'reference') && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center space-x-2">
                      <Link2 className="w-3 h-3 text-purple-400" />
                      <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider italic opacity-80 flex items-center space-x-1">
                        <span>Relation</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black border ${f.isMissingTarget ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                          {f.reference?.collection || f.targetFormId || 'AUTO'}
                        </span>
                        {f.isMissingTarget && (
                           <X className="w-2.5 h-2.5 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer group/toggle" onMouseDown={e => e.stopPropagation()}>
                    <div
                      onClick={() => updateField(i, 'required', !f.required)}
                      className={`w-7 h-4 rounded-full transition-all relative ${f.required ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${f.required ? 'left-3.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[10px] text-zinc-400 group-hover/toggle:text-zinc-200 transition-colors font-medium">Required</span>
                  </label>
                </div>
              </div>
            );
          })}
          <button
            onClick={addField}
            onMouseDown={e => e.stopPropagation()}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl border border-dashed border-white/10 text-zinc-500 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-[11px] font-bold"
          >
            <Plus className="w-3.5 h-3.5" /><span>Add Field</span>
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className={`${baseHandle} bg-cyan-400`} />
    </NodeWrapper>
  );
}

// ── Auth Node ─────────────────────────────────────────────────────────────────
export function AuthNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as any;
  const [showNotes, setShowNotes] = useState(false);
  const providers: Record<string, boolean> = (data.providers as any) || {};

  const toggleProvider = (p: string) => {
    data.onUpdate?.({ ...data, providers: { ...providers, [p]: !providers[p] } });
  };
  return (
    <NodeWrapper selected={selected} color="purple">
      <Handle type="target" position={Position.Left} className={`${baseHandle} bg-blue-500`} />

      <div className="flex items-center space-x-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
          <Shield className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            className="w-full bg-transparent text-white text-[13px] font-bold focus:outline-none"
            value={String(data.label ?? 'Auth')}
            onChange={e => data.onUpdate?.({ ...data, label: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
          />
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Access Control</div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
            className={`p-1.5 rounded-lg transition-all ${data.notes ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Custom Instructions"
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
            title="Delete Component"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notes Area */}
      {showNotes && (
        <div className="p-3 bg-amber-500/5 border-b border-white/5">
          <textarea
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-[11px] text-amber-200 focus:outline-none min-h-[60px] placeholder:text-zinc-700"
            placeholder="Custom instructions for Piko..."
            value={data.notes || ''}
            onChange={e => data.onUpdate?.({ ...data, notes: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Source DB Selection */}
      <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center justify-between">
        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Source DB</div>
        <CustomDropdown
          value={data.sourceDatabase}
          options={(data.availableDatabases || []).map((db: string) => ({ label: db, value: db }))}
          onChange={(val: string) => data.onUpdate?.({ ...data, sourceDatabase: val })}
          className="min-w-[120px]"
        />
      </div>

      <div className="p-4 pb-20 space-y-4">
        {/* Providers */}
        <div className="space-y-2">
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Authentication Providers</span>
            <div className="flex items-center space-x-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 text-[8px] font-black uppercase tracking-tighter">
              {Object.values(providers).filter(Boolean).length} Active
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'email', label: 'Email / Password', icon: <Mail className="w-2.5 h-2.5" /> },
              { id: 'google', label: 'Google OAuth', icon: <Globe className="w-2.5 h-2.5" /> },
              { id: 'github', label: 'GitHub OAuth', icon: <X className="w-2.5 h-2.5" /> }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => toggleProvider(p.id)}
                onMouseDown={e => e.stopPropagation()}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-medium transition-all flex items-center space-x-2 ${providers[p.id]
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                  : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10'
                  }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="space-y-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Security & Verification</div>
          <label className="flex items-center space-x-3 cursor-pointer group/auth" onMouseDown={e => e.stopPropagation()}>
            <div
              onClick={() => data.onUpdate?.({ ...data, requireEmailVerification: !data.requireEmailVerification })}
              className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${data.requireEmailVerification ? 'bg-purple-500 border-purple-500' : 'bg-zinc-800 border-white/10'}`}
            >
              {data.requireEmailVerification && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-zinc-300 group-hover/auth:text-white transition-colors font-medium">Require Email Verification</div>
            </div>
          </label>
        </div>

        {/* Config Mode */}
        <div className="space-y-2">
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Settings2 className="w-3 h-3" />
            <span>Configuration Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'managed', label: 'Managed UI' },
              { id: 'headless', label: 'Headless' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => data.onUpdate?.({ ...data, configMode: m.id })}
                onMouseDown={e => e.stopPropagation()}
                className={`p-2 rounded-xl border text-left transition-all ${data.configMode === m.id
                  ? 'bg-purple-500/10 border-purple-500/40'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                   {m.id === 'managed' ? <Layout className={`w-3 h-3 ${data.configMode === m.id ? 'text-purple-400' : 'text-zinc-500'}`} /> : <Key className={`w-3 h-3 ${data.configMode === m.id ? 'text-purple-400' : 'text-zinc-500'}`} />}
                   <div className={`text-[10px] font-bold ${data.configMode === m.id ? 'text-purple-400' : 'text-zinc-300'}`}>{m.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-3">
          {[
            { id: 'projectId', label: 'Project ID (Optional)', placeholder: 'e.g., prj_123456' },
            { id: 'redirectUrl', label: 'Redirect URL (Optional)', placeholder: 'http://localhost/callback' },
          ].map(f => (
            <div key={f.id} className="space-y-1.5">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{f.label}</div>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-purple-500/40"
                value={data[f.id] || ''}
                onChange={e => data.onUpdate?.({ ...data, [f.id]: e.target.value })}
                onMouseDown={e => e.stopPropagation()}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className={`${baseHandle} bg-purple-400`} />
    </NodeWrapper>
  );
}

// ── Database Node ─────────────────────────────────────────────────────────────
export function DatabaseNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as any;
  const dbs = (data.availableDatabases as string[]) || [];

  return (
    <NodeWrapper selected={selected} color="green">
      <Handle type="target" position={Position.Left} className={`${baseHandle} bg-blue-500`} />

      <div className="flex items-center space-x-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
          <Database className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1">
          <div className="text-white text-[13px] font-bold">Database Hub</div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Storage Layer</div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[9px] px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 font-mono uppercase">
            {String(data.dbType ?? 'mongo')}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Select Active Database</div>
          <CustomDropdown
            value={data.selectedDatabase || ''}
            options={[
              { label: 'Select database...', value: '' },
              ...dbs.map(db => ({ label: db, value: db }))
            ]}
            onChange={(val: string) => data.onDatabaseSelect?.(val)}
          />
        </div>

        <div className="pt-2 border-t border-white/5">
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Attached Collections</div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {dbs.length > 0 ? (
              dbs.map((db, i) => (
                <div key={i} className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${data.selectedDatabase === db ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/[0.03] border-white/5 text-zinc-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${data.selectedDatabase === db ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`} />
                  <span className="text-[10px] font-mono truncate">{db}</span>
                  {data.selectedDatabase === db && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
              ))
            ) : (
              <div className="text-[9px] text-zinc-600 italic py-2 px-1 text-center bg-white/5 rounded-lg">
                No databases found. Check connector.
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className={`${baseHandle} bg-green-400`} />
    </NodeWrapper>
  );
}

// ── Connector Node ─────────────────────────────────────────────────────────────
export function ConnectorNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as any;
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <NodeWrapper selected={selected} color="blue">
      <Handle type="target" position={Position.Left} className={`${baseHandle} bg-blue-500`} />

      <div className="flex items-center space-x-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Globe className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="text-white text-[13px] font-bold truncate">
            {String(data.label ?? 'local-dev-connector')}
          </div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Remote Bridge (Static)</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full bg-emerald-400 ${isSyncing ? 'animate-ping' : 'animate-pulse'} shadow-[0_0_10px_rgba(52,211,153,0.5)]`} />
        </div>
      </div>

      <div className="p-4 pb-9.5 space-y-3">
        <div className="space-y-1.5">
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Select Connection</div>
          <CustomDropdown
            value={data.selectedConnector?.url || ''}
            options={[
              { label: 'Select a connector...', value: '' }, 
              ...(data.availableConnectors || []).map((c: any) => ({ label: `${c.name} (${c.url})`, value: c.url }))
            ]}
            onChange={(url: any) => {
              const selected = (data.availableConnectors || []).find((c: any) => c.url === url);
              if (selected) {
                data.onConnectorSelect?.(selected);
              }
            }}
          />
        </div>

        <button
          onClick={handleSync}
          onMouseDown={e => e.stopPropagation()}
          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-zinc-400 transition-all flex items-center justify-center space-x-2"
        >
          {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          <span>{isSyncing ? 'Syncing Schema...' : 'Sync Schema from DB'}</span>
        </button>
      </div>

      <Handle type="source" position={Position.Right} className={`${baseHandle} bg-blue-400`} />
    </NodeWrapper>
  );
}

export const NODE_TYPES = {
  'form-node': FormNode,
  'auth-node': AuthNode,
  'database-node': DatabaseNode,
  'connector-node': ConnectorNode,
};
