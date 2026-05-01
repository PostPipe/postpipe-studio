'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Shield, Database, Globe, 
  Key, Hash, Mail, Phone, Calendar, Image, 
  List, Type, ToggleLeft, Link2, Plus, Search,
  ChevronDown, Zap
} from 'lucide-react';

export interface ComponentDefinition {
  id: string;
  type: 'form' | 'auth' | 'database' | 'connector';
  label: string;
  description: string;
  icon: any;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  defaultData: Record<string, any>;
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    id: 'form-node',
    type: 'form',
    label: 'Form',
    description: 'Collect user data with custom fields',
    icon: FileText,
    color: 'text-purple-400',
    gradientFrom: 'from-purple-500/20',
    gradientTo: 'to-blue-500/20',
    defaultData: {
      label: 'New Form',
      fields: [
        { name: 'user_id', type: 'text_area', required: false, isRelational: false },
        { name: 'label', type: 'text', required: false, isRelational: false },
      ],
      notes: '',
      status: 'Draft',
    },
  },
  {
    id: 'auth-node',
    type: 'auth',
    label: 'Auth Preset',
    description: 'Handle user authentication flows',
    icon: Shield,
    color: 'text-purple-400',
    gradientFrom: 'from-purple-500/20',
    gradientTo: 'to-indigo-500/20',
    defaultData: {
      label: 'Auth',
      providers: { email: true, google: true, github: false },
      requireEmailVerification: false,
      configMode: 'managed', // 'managed' or 'headless'
      projectId: '',
      redirectUrl: 'http://localhost:9002/auth/callback',
      frontendUrlAlias: '',
      connector: 'local-dev-connector',
      notes: '',
    },
  },
  {
    id: 'database-node',
    type: 'database',
    label: 'Database',
    description: 'MongoDB or SQL data storage',
    icon: Database,
    color: 'text-emerald-400',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-teal-500/20',
    defaultData: {
      label: 'Database',
      dbType: 'mongodb',
      collections: ['users', 'submissions'],
    },
  },
  {
    id: 'connector-node',
    type: 'connector',
    label: 'Connector',
    description: 'Link to a local or remote Postpipe agent',
    icon: Globe,
    color: 'text-blue-400',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-purple-500/20',
    defaultData: {
      label: 'Connector',
      url: 'http://localhost:3002',
    },
  },
];

export const FIELD_TYPES = [
  // TEXT
  { value: 'text', label: 'Text', category: 'TEXT', icon: Type },
  { value: 'text_area', label: 'Text Area', category: 'TEXT', icon: FileText },
  { value: 'email', label: 'Email', category: 'TEXT', icon: Mail },
  // NUMERIC
  { value: 'number', label: 'Number', category: 'NUMERIC', icon: Hash },
  { value: 'decimal', label: 'Decimal / Float', category: 'NUMERIC', icon: Hash },
  // BOOLEAN
  { value: 'boolean', label: 'Checkbox (Boolean)', category: 'BOOLEAN', icon: ToggleLeft },
  // MEDIA
  { value: 'image', label: 'Image Upload', category: 'MEDIA', icon: Image },
  { value: 'images', label: 'Array of Images', category: 'MEDIA', icon: Image },
  // STRUCTURED
  { value: 'list', label: 'List', category: 'STRUCTURED', icon: List },
  { value: 'json_object', label: 'JSON Object', category: 'STRUCTURED', icon: FileText },
  { value: 'json_array', label: 'JSON Array', category: 'STRUCTURED', icon: List },
  // SELECTION
  { value: 'dropdown', label: 'Dropdown', category: 'SELECTION', icon: ChevronDown },
  // REFERENCE
  { value: 'relational', label: 'Relational Data', category: 'REFERENCE', icon: Link2 },
];

function DraggableComponent({ component }: { component: ComponentDefinition }) {
  const Icon = component.icon;

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/postpipe-component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`group relative p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all hover:border-white/20`}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${component.gradientFrom} ${component.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10 flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${component.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-xs">{component.label}</div>
          <div className="text-zinc-500 text-[10px] leading-tight truncate">{component.description}</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-3 h-3 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}

interface ComponentLibraryProps {
  isOpen: boolean;
  dragControls: any;
}

export function ComponentLibrary({ isOpen, dragControls }: ComponentLibraryProps) {
  const [search, setSearch] = React.useState('');
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set(['core', 'integrations']));

  const filtered = COMPONENT_LIBRARY.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const groups = [
    { id: 'core', label: 'Core Components', items: filtered.filter(c => ['form', 'auth', 'database'].includes(c.type)) },
    { id: 'integrations', label: 'Integrations', items: filtered.filter(c => ['connector'].includes(c.type)) },
  ];

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="w-80 h-full flex flex-col bg-[#0a0a0b] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden group/library relative"
    >
      
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="px-6 pt-6 pb-2 relative z-10 cursor-grab active:cursor-grabbing flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 pointer-events-none">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight uppercase tracking-widest text-xs opacity-80">Library</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none">
          v2.0
        </div>
      </div>

      <div className="px-6 pb-4 relative z-10">
        <div className="relative group/search">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/search:text-purple-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search building blocks..."
            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-purple-500/30 focus:bg-black/60 transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar" data-lenis-prevent>
        {groups.map(group => (
          <div key={group.id} className="px-4">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between py-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <span className="flex items-center space-x-2">
                <div className="w-1 h-3 rounded-full bg-purple-500/50" />
                <span>{group.label}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedGroups.has(group.id) ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedGroups.has(group.id) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-3 pb-2">
                    {group.items.map(component => (
                      <DraggableComponent key={component.id} component={component} />
                    ))}
                    {group.items.length === 0 && (
                      <p className="text-center text-zinc-600 text-[10px] py-4 bg-white/5 rounded-xl border border-dashed border-white/5">No components found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

    </motion.div>
  );
}
