'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  MarkerType, Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import Image from 'next/image';
import {
  Layers, Link2, Server, Settings, User, HelpCircle,
  Rocket, ArrowRight, Layout, RotateCcw, ZoomIn, ZoomOut,
  PanelLeftOpen, PanelLeftClose, Trash2, FolderOpen, Loader2, Sparkles, FileDown, Database
} from 'lucide-react';

import { PikoLogo } from '@/components/ui/piko-logo';
import { PikoChatWindow } from '@/components/chat/piko-chat-window';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { ComponentLibrary, COMPONENT_LIBRARY } from '@/components/canvas/ComponentLibrary';
import { ProjectLibrary } from '@/components/canvas/ProjectLibrary';
import { NODE_TYPES } from '@/components/canvas/CanvasNodes';
import { DeployModal } from '@/components/canvas/DeployModal';
import { getPikoStructure, getPikoConnectors } from '@/app/actions/piko';
import { EDGE_TYPES } from '@/components/canvas/CanvasEdges';
import { fetchUserProfile, UserProfile } from '@/lib/auth-client';
import { 
  getCanvases, saveCanvas, getUserConnectors, 
  markCanvasActivity, checkUserCanvases
} from '@/app/actions/canvas';

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextId() { return `node-${Math.random().toString(36).substr(2, 9)}`; }

function makeEdgeStyle(type: string) {
  const colors: Record<string, string> = {
    'form-node': '#22d3ee',
    'auth-node': '#a855f7',
    'database-node': '#34d399',
    'connector-node': '#60a5fa',
  };
  const c = colors[type] || '#6b7280';
  return { stroke: c, strokeWidth: 2 };
}

function buildInstructionMarkdown(nodes: any[], edges: any[], canvasName: string): string {
  const nodeDescriptions = nodes.map(n => {
    const d = n.data;
    if (n.type === 'form-node') {
      const fields = (d.fields || []).map((f: any) => {
        let fieldStr = `${f.name} (${f.type}${f.required ? ', required' : ''})`;
        if (f.isRelationalSource) {
          fieldStr += ` [RELATIONAL_SOURCE]`;
        }
        return fieldStr;
      }).join('\n      - ');
      return `### FORM: ${d.label}\n- **Target Database**: ${d.sourceDatabase || 'Not specified'}\n- **Connector**: ${d.sourceConnector || 'Not specified'}\n- **Fields**:\n      - ${fields}\n- **Notes**: ${d.notes || 'None'}`;
    }
    if (n.type === 'auth-node') {
      const providers = Object.entries(d.providers || {}).filter(([, v]) => v).map(([k]) => k);
      return `### AUTH PRESET: ${d.label}\n- **Providers**: ${providers.join(', ')}\n- **Mode**: ${d.configMode}\n- **Target Database**: ${d.sourceDatabase || 'Not specified'}\n- **Connector**: ${d.sourceConnector || 'Not specified'}\n- **Notes**: ${d.notes || 'None'}`;
    }
    if (n.type === 'database-node') {
      return `### DATABASE: ${d.label}`;
    }
    if (n.type === 'connector-node') {
      return `### CONNECTOR: ${d.label}\n- **Name**: ${d.label}\n- **URL**: ${d.url}`;
    }
    return `### COMPONENT: ${d.label}\n- **Type**: ${n.type}`;
  });

  const edgeDescriptions = edges.map(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    return `- **${src?.data?.label ?? e.source}** (${src?.type?.replace('-node', '')}) → **${tgt?.data?.label ?? e.target}** (${tgt?.type?.replace('-node', '')})`;
  });

  // Automatically detect proper fields to use for relationships
  const inferredRelations: any[] = [];
  edges.forEach(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    
    if (src?.type === 'form-node' && tgt?.type === 'form-node') {
      const sourceFields = (src.data.fields || []).filter((f: any) => f.isRelationalSource);
      const targetFields = (tgt.data.fields || []).filter((f: any) => f.type === 'relational' || f.type === 'relational-data');
      
      if (sourceFields.length > 0 && targetFields.length > 0) {
        targetFields.forEach((tf: any) => {
          const match = sourceFields[0];
          inferredRelations.push({
            targetForm: tgt.data.label,
            targetField: tf.name,
            sourceForm: src.data.label,
            sourceField: match.name,
            database: src.data.sourceDatabase // The DB where the SOURCE form lives
          });
        });
      }
    }
  });

  // Build Structured JSON for Piko (Matching User's Corrected Format)
  const pikoStructure = {
    canvasName,
    timestamp: new Date().toISOString(),
    forms: nodes.filter(n => n.type === 'form-node').map(n => {
      const d = n.data;
      const formId = d.label.toLowerCase().replace(/\s+/g, '-');
      
      return {
        id: formId,
        name: d.label,
        connectorId: d.sourceConnector || 'local-dev-connector',
        targetDatabase: d.sourceDatabase || 'mongodb-uri',
        routing: {
          broadcast: [],
          splits: [],
          transformations: {
            mask: [],
            hash: []
          }
        },
        fields: (d.fields || []).map((f: any) => {
          const relation = inferredRelations.find(r => r.targetForm === d.label && r.targetField === f.name);
          if (relation) {
            return {
              name: f.name,
              type: 'relational',
              required: f.required || false,
              targetForm: relation.sourceForm,
              targetField: relation.sourceField,
              targetDatabase: relation.database
            };
          }
          return {
            name: f.name,
            type: f.type,
            required: f.required || false,
            isRelationalSource: f.isRelationalSource || false
          };
        }),
        notes: d.notes || ""
      };
    }),
    authPresets: nodes.filter(n => n.type === 'auth-node').map(n => {
      const d = n.data;
      return {
        id: d.label.toLowerCase().replace(/\s+/g, '-'),
        name: d.label,
        connectorId: d.sourceConnector || 'local-dev-connector',
        targetDatabase: d.sourceDatabase || 'mongodb-uri',
        providers: d.providers,
        configMode: d.configMode || 'managed',
        notes: d.notes || ""
      };
    }),
    relationships: inferredRelations.map(r => ({
      sourceForm: r.sourceForm,
      sourceField: r.sourceField,
      targetForm: r.targetForm,
      targetField: r.targetField,
      database: r.database
    }))
  };

  return `# Postpipe Architecture Instructions: ${canvasName}

## Overview
Automated backend structural definition for Piko AI.

## Architecture Map
${nodeDescriptions.join('\n\n')}

## Connections
${edgeDescriptions.join('\n') || '- No specific mappings defined'}

${inferredRelations.length > 0 ? `## Inferred Relationships\n${inferredRelations.map(r => `- **${r.targetForm}** (${r.targetField}) → **${r.sourceForm}** (${r.sourceField}) [DB: ${r.database}]`).join('\n')}\n` : ''}

## Structured Data (Direct Creation)
\`\`\`json
${JSON.stringify(pikoStructure, null, 2)}
\`\`\`

## Instructions for Piko AI
1. **Direct Creation**: Use the **Structured Data JSON** above to create all forms and auth presets. Do not ask for database or connector names; they are already specified in the JSON.
2. **Relational Setup**: Ensure relational fields correctly reference their target forms as mapped in the \`relationships\` array and the field-level \`targetForm\` properties.
3. **Connectors**: Use the connector URLs specified in the Architecture Map.

---
*Generated by Postpipe Studio Canvas*`;
}

function pikoFormsToFlow(forms: any[], presets: any[]) {
  const nodes: any[] = [];
  const edges: any[] = [];
  const ROW_H = 350;

  // 1. Create Connector Nodes (LEFT)
  // According to strict rules, Connector is static (e.g., "local-dev-connector")
  const firstWithConn = forms.find(f => f.connectorId || f.connector_id) || presets.find(p => p.connectorId || p.connector_id);
  const connectorId = firstWithConn?.connectorId || firstWithConn?.connector_id || 'local-dev-connector';
  const connNodeId = `piko-conn-${connectorId}`;
  
  nodes.push({
    id: connNodeId,
    type: 'connector-node',
    position: { x: 40, y: 150 },
    data: { 
      label: connectorId, 
      url: `https://${connectorId}`,
      isStatic: true 
    }
  });

  // 2. Create Database Nodes (CENTER)
  const firstWithDb = forms.find(f => f.targetDatabase || f.target_database) || presets.find(p => p.targetDatabase || p.target_database);
  const dbUri = firstWithDb?.targetDatabase || firstWithDb?.target_database || 'mongodb-uri';
  const dbNodeId = `piko-db-${dbUri}`;
  
  nodes.push({
    id: dbNodeId,
    type: 'database-node',
    position: { x: 480, y: 150 },
    data: { 
      label: 'Database', 
      dbType: 'mongodb', 
      selectedDatabase: dbUri 
    }
  });

  // Connect Connector -> DB (SOLID BLUE)
  edges.push({
    id: `e-${connNodeId}-${dbNodeId}`,
    source: connNodeId,
    target: dbNodeId,
    type: 'generic-edge',
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 3 }
  });

  // 3. Create Form and Auth Nodes (RIGHT)
  let rightSideIndex = 0;

  // Auth Presets (ISOLATED SYSTEM)
  presets.forEach((p) => {
    const id = p.id || p._id || `auth-${rightSideIndex}`;
    const nodeId = `piko-auth-${id}`;
    nodes.push({
      id: nodeId,
      type: 'auth-node',
      position: { x: 920, y: 100 + rightSideIndex * ROW_H },
      data: { 
        label: p.name || 'Auth', 
        providers: p.providers || { email: true },
        configMode: p.configMode || 'managed',
        status: 'Active',
        sourceDatabase: dbUri
      },
    });
    rightSideIndex++;

    // Connect DB -> Auth (SOLID PURPLE)
    edges.push({
      id: `e-${dbNodeId}-${nodeId}`,
      source: dbNodeId,
      target: nodeId,
      type: 'database-edge',
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 }
    });
  });

  // Forms
  forms.forEach((f) => {
    const id = f.id || f._id || `form-${rightSideIndex}`;
    const nodeId = `piko-form-${id}`;
    nodes.push({
      id: nodeId,
      type: 'form-node',
      position: { x: 920, y: 100 + rightSideIndex * ROW_H },
      data: {
        label: f.name,
        fields: f.fields || [],
        status: f.status || 'Live',
        relationCount: 0,
        sourceDatabase: dbUri
      },
    });
    rightSideIndex++;

    // Connect DB -> Form (SOLID CYAN)
    edges.push({
      id: `e-${dbNodeId}-${nodeId}`,
      source: dbNodeId,
      target: nodeId,
      type: 'database-edge',
      animated: true,
      style: { stroke: '#22d3ee', strokeWidth: 2 }
    });
  });

  // 4. Relational Linking (DASHED CYAN)
  forms.forEach(f => {
    const sourceNodeId = `piko-form-${f.id}`;
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    
    (f.fields || []).forEach((field: any) => {
      let targetFormId = field.targetFormId;
      if (!targetFormId && field.reference) {
        targetFormId = typeof field.reference === 'string' ? field.reference : (field.reference?.collection || field.reference?.formId);
      }

      if (targetFormId) {
        const targetNode = nodes.find(n => 
          n.id === `piko-form-${targetFormId}` || 
          n.data.label.toLowerCase() === String(targetFormId).toLowerCase()
        );

        if (targetNode) {
          if (sourceNode) sourceNode.data.relationCount++;
          targetNode.data.referencedByCount = (targetNode.data.referencedByCount || 0) + 1;
          
          edges.push({
            id: `rel-${f.id}-${targetNode.id}-${field.name}`,
            source: sourceNodeId,
            target: targetNode.id,
            type: 'generic-edge',
            animated: true,
            style: { stroke: '#22d3ee', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' },
            label: field.name,
            labelStyle: { fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' },
            labelBgStyle: { fill: '#18181b', fillOpacity: 0.9, borderRadius: 4 },
          });
        } else {
          field.isMissingTarget = true;
        }
      }
    });
  });

  return { nodes, edges };
}


// ── Mode Selector (landing) ───────────────────────────────────────────────────
function ModeSelector({ onSelect }: { onSelect: (m: 'ai' | 'manual') => void }) {
  return (
    <div className="relative z-10 max-w-5xl w-full mx-auto px-6 h-screen flex flex-col items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
          Build your <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">backend.</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          The all-in-one studio to design, build, and deploy robust APIs visually or through Piko AI.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Piko AI */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => onSelect('ai')}
          className="group relative p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 backdrop-blur-3xl cursor-pointer overflow-hidden shadow-2xl transition-all hover:border-purple-500/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] p-3">
              <PikoLogo selected className="w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Piko AI Agent</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
              Describe your backend in plain text. Piko will architect the entire system, create forms, and deploy it live.
            </p>
            <div className="flex items-center space-x-3 text-white font-bold text-xs group/btn">
              <span className="bg-white/10 px-4 py-2 rounded-full group-hover:bg-purple-500 transition-colors">Launch AI Mode</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-2" />
            </div>
          </div>
          <div className="absolute top-6 right-6 text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
            Recommended
          </div>
        </motion.div>

        {/* Manual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => onSelect('manual')}
          className="group relative p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 backdrop-blur-3xl cursor-pointer overflow-hidden shadow-2xl transition-all hover:border-cyan-500/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] group-hover:border-cyan-500/30 transition-colors">
              <Layout className="text-cyan-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Manual Workbench</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
              Drag and drop nodes onto an infinite canvas. Design complex relations and workflows manually with full control.
            </p>
            <div className="flex items-center space-x-3 text-white font-bold text-xs group/btn">
              <span className="bg-white/10 px-4 py-2 rounded-full group-hover:bg-cyan-500 transition-colors">Enter Workbench</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-2" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function sanitizeForSave(items: any[]) {
  return items.map(item => {
    const { data, ...rest } = item;
    const cleanData = { ...data };
    // Remove functions
    Object.keys(cleanData).forEach(key => {
      if (typeof cleanData[key] === 'function') {
        delete cleanData[key];
      }
    });
    return { ...rest, data: cleanData };
  });
}

// ── Main Studio ───────────────────────────────────────────────────────────────
function Studio({ mode }: { mode: 'ai' | 'manual' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState<string>(mode === 'ai' ? 'piko' : 'components');
  const [showDeploy, setShowDeploy] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [canvasName, setCanvasName] = useState('New Project');
  const [isSaving, setIsSaving] = useState(false);
const [pikoPrompt, setPikoPrompt] = useState('');
  const [globalConnector, setGlobalConnector] = useState<any>(null);
  const [globalDatabase, setGlobalDatabase] = useState<string>('');
  const [availableConnectors, setAvailableConnectors] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [ignoredNodeIds, setIgnoredNodeIds] = useState<Set<string>>(new Set());
  const [baselineNodeIds, setBaselineNodeIds] = useState<Set<string> | null>(null);

  const libraryDragControls = useDragControls();
  const projectDragControls = useDragControls();

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Load API key and User
  useEffect(() => {
    const k = localStorage.getItem('piko_api_key') || '';
    setApiKey(k);
    fetchUserProfile().then(setUser);
    
    if (k) {
      getPikoConnectors(k).then(res => {
        if (res.success && res.connectors.length > 0) {
          setAvailableConnectors(res.connectors);
          setGlobalConnector(res.connectors[0]);
        }
      });
    }
  }, []);

  // Fetch connectors from DB when user is available
  useEffect(() => {
    if (user?.id) {
      getUserConnectors(user.id).then(res => {
        if (res.success && res.connectors.length > 0) {
          setAvailableConnectors(res.connectors);
          if (!globalConnector) setGlobalConnector(res.connectors[0]);
        }
      });
    }
  }, [user]);

  // Handle global database auto-assignment
  useEffect(() => {
    if (globalConnector && !globalDatabase) {
      const dbs = globalConnector.databases ? Object.keys(globalConnector.databases) : (globalConnector.collections || []);
      if (dbs.length > 0) setGlobalDatabase(dbs[0]);
    }
  }, [globalConnector, globalDatabase]);

  const onSave = async () => {
    setIsSaving(true);
    const targetId = user?.id || apiKey || 'anonymous';
    const cleanNodes = sanitizeForSave(nodes);
    const cleanEdges = sanitizeForSave(edges);
    
    console.log('[Canvas] Saving for:', targetId, 'Name:', canvasName);
    const res = await saveCanvas(targetId, canvasName, cleanNodes, cleanEdges);
    console.log('[Canvas] Save result:', res);
    if (res.success) {
      // setRefreshKey(prev => prev + 1);
    } else {
      console.error('[Canvas] Save failed:', res.error);
    }
    setIsSaving(false);
  };

  const handleNewProject = () => {
    if (!confirm('Start a new project? Unsaved changes will be lost.')) return;
    setIgnoredNodeIds(prev => new Set([...prev, ...nodes.map(n => n.id)]));
    setNodes([]);
    setEdges([]);
    setCanvasName('New Project');
    setActivePanel('');
  };

  const handleExportAndAIBuild = async () => {
    if (nodes.length === 0) return;
    
    // 1. Generate MD content
    const mdContent = buildInstructionMarkdown(syncedNodes, syncedEdges, canvasName);
    
    // 2. Download MD file
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasName.toLowerCase().replace(/\s+/g, '-')}-architecture.md`;
    a.click();
    URL.revokeObjectURL(url);

    // 3. Pass to Piko
    setPikoPrompt(`I have exported my canvas architecture to a Markdown file. Here are the detailed instructions for you to build the backend in my account:\n\n${mdContent}`);
    setActivePanel('piko');

    // 4. Save to DB
    await onSave();
  };

  // Capture baseline to prevent old backend forms from auto-spawning
  useEffect(() => {
    const initBaseline = async () => {
      const k = localStorage.getItem('piko_api_key') || '';
      if (!k) {
        setBaselineNodeIds(new Set());
        return;
      }
      const { success, forms, presets } = await getPikoStructure(k);
      if (success) {
        const { nodes: n } = pikoFormsToFlow(forms, presets);
        setBaselineNodeIds(new Set(n.filter((node: any) => node.type === 'form-node' || node.type === 'auth-node').map((node: any) => node.id)));
      } else {
        setBaselineNodeIds(new Set());
      }
    };
    // initBaseline();
  }, []);

  // Node update callbacks
  const makeUpdater = useCallback((id: string) => (newData: any) => {
    setNodes(prev => prev.map((n: any) => n.id === id ? { ...n, data: { ...newData, onUpdate: makeUpdater(id) } } : n));
  }, [setNodes]);

  const makeDeleter = useCallback((id: string) => () => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setIgnoredNodeIds(prev => new Set(prev).add(id));
  }, [setNodes, setEdges]);

  // Manual sync function to fetch backend structure and render nodes
  const syncCanvasWithBackend = useCallback(async () => {
    setIsSyncing(true);
    try {
      const k = localStorage.getItem('piko_api_key') || '';
      if (!k) return;
      const { success, forms, presets } = await getPikoStructure(k);
      if (success && (forms.length > 0 || presets.length > 0)) {
        const { nodes: n, edges: e } = pikoFormsToFlow(forms, presets);
        // Compute fresh forms
        let freshNodesToInject: any[] = [];

        setNodes(prev => {
          const existingIds = new Set(prev.map((p: any) => p.id));
          
          const freshForms = n.filter((nn: any) => 
            (nn.type === 'form-node' || nn.type === 'auth-node') && 
            !existingIds.has(nn.id) && 
            !ignoredNodeIds.has(nn.id)
          );

          const freshFormIds = new Set(freshForms.map((f: any) => f.id));
          const requiredDbConnIds = new Set<string>();
          
          // Find edges connecting to/from fresh forms
          e.forEach((ee: any) => {
             if (freshFormIds.has(ee.target) || freshFormIds.has(ee.source)) {
                 if (ee.source.startsWith('piko-db-') || ee.source.startsWith('piko-conn-')) requiredDbConnIds.add(ee.source);
                 if (ee.target.startsWith('piko-db-') || ee.target.startsWith('piko-conn-')) requiredDbConnIds.add(ee.target);
             }
          });

          // Also get connector nodes connecting to required DBs
          e.forEach((ee: any) => {
             if (requiredDbConnIds.has(ee.target) && ee.source.startsWith('piko-conn-')) {
                 requiredDbConnIds.add(ee.source);
             }
          });

          const freshDbConn = n.filter((nn: any) => requiredDbConnIds.has(nn.id) && !existingIds.has(nn.id) && !ignoredNodeIds.has(nn.id));
          
          freshNodesToInject = [...freshForms, ...freshDbConn];

          return [...prev, ...freshNodesToInject.map((nn: any) => ({
            ...nn,
            data: {
              ...nn.data,
              onUpdate: makeUpdater(nn.id),
              onDelete: makeDeleter(nn.id)
            }
          }))];
        });

        setEdges(prev => {
          if (freshNodesToInject.length === 0) return prev;
          const existingIds = new Set(prev.map((p: any) => p.id));
          const injectedNodeIds = new Set(freshNodesToInject.map((nn: any) => nn.id));
          
          // Only add edges where AT LEAST ONE endpoint is a freshly injected node
          const freshEdges = e.filter((ee: any) => 
            !existingIds.has(ee.id) && 
            (injectedNodeIds.has(ee.source) || injectedNodeIds.has(ee.target))
          );
          return [...prev, ...freshEdges];
        });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [ignoredNodeIds, makeUpdater, makeDeleter]);

  // Sync canvas with backend when refreshKey changes (manually triggered)
  useEffect(() => {
    if (refreshKey > 0) {
      syncCanvasWithBackend();
    }
  }, [refreshKey, syncCanvasWithBackend]);

  const updateEdgeData = useCallback((id: string, newData: any) => {
    if (newData._deleted) {
      setEdges(eds => eds.filter(e => e.id !== id));
      return;
    }
    setEdges(eds => eds.map(e => e.id === id ? { ...e, data: { ...e.data, ...newData } } : e));
  }, [setEdges]);

  // 1. Compute synced nodes
  const syncedNodes = nodes.map(n => {
    const connectorLabel = globalConnector?.name || 'local-dev-connector';
    const dbs = globalConnector?.databases ? Object.keys(globalConnector.databases) : (globalConnector?.collections || []);
    
    if (n.type === 'connector-node') {
      return { 
        ...n, 
        data: { 
          ...n.data, 
          label: connectorLabel,
          availableConnectors,
          selectedConnector: globalConnector,
          onConnectorSelect: (c: any) => setGlobalConnector(c)
        } 
      };
    }

    if (n.type === 'database-node') {
      return { 
        ...n, 
        data: { 
          ...n.data, 
          label: 'Database',
          dbType: globalConnector?.type === 'postgres' ? 'postgres' : 'mongo',
          selectedDatabase: globalDatabase,
          availableDatabases: dbs,
          onDatabaseSelect: (db: string) => setGlobalDatabase(db)
        } 
      };
    }

    if (n.type === 'form-node' || n.type === 'auth-node') {
      return { 
        ...n, 
        data: { 
          ...n.data, 
          sourceDatabase: globalDatabase || n.data.sourceDatabase,
          sourceConnector: connectorLabel,
          availableDatabases: dbs
        } 
      };
    }
    return n;
  });

  // 2. Extract all collections for relations
  const allCollections = syncedNodes
    .filter((n: any) => n.type === 'database-node')
    .flatMap((n: any) => n.data.availableDatabases || []);

  // 3. Compute synced edges
  const syncedEdges = edges.map(e => {
    const sourceNode = syncedNodes.find(n => n.id === e.source);
    if (sourceNode?.type === 'database-node') {
      return {
        ...e,
        type: 'database-edge',
        data: {
          ...e.data,
          options: sourceNode.data.availableDatabases || [],
          onUpdate: updateEdgeData
        }
      };
    }
    return {
      ...e,
      type: 'generic-edge',
      data: {
        ...e.data,
        onDelete: (id: string) => updateEdgeData(id, { _deleted: true })
      }
    };
  });

  const loadCanvas = useCallback((savedNodes: any[], savedEdges: any[], name?: string, id?: string) => {
    if (name) setCanvasName(name);
    if (id) markCanvasActivity(id);
    // Re-bind updaters to nodes
    const bound = savedNodes.map((n: any) => ({
      ...n,
      data: { 
        ...n.data, 
        availableCollections: allCollections,
        onUpdate: makeUpdater(n.id),
        onDelete: makeDeleter(n.id)
      }
    }));
    setNodes(bound);
    setEdges(savedEdges);
    setActivePanel('');
  }, [makeUpdater, setNodes, setEdges, allCollections, setCanvasName]);

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find((n: any) => n.id === params.source);
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: makeEdgeStyle(sourceNode?.type || ''),
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds));
  }, [nodes, setEdges]);

  // Drag-and-drop from library
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/postpipe-component');
    if (!raw) return;
    const def = JSON.parse(raw);

    // Get canvas bounds for position calc
    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = nextId();
    const updater = makeUpdater(id);
    const deleter = makeDeleter(id);

    setNodes(prev => [...prev, {
      id,
      type: def.id,
      position: { x: e.clientX - bounds.left - 110, y: e.clientY - bounds.top - 60 },
      data: { 
        ...def.defaultData, 
        availableCollections: allCollections, 
        availableConnectors,
        onUpdate: updater, 
        onDelete: deleter 
      },
    }]);
  }, [makeUpdater, setNodes, allCollections, availableConnectors]);

  const clearCanvas = () => {
    setIgnoredNodeIds(prev => new Set([...prev, ...nodes.map(n => n.id)]));
    setNodes([]);
    setEdges([]);
  };

  const sidebarItems = [
    { id: 'components', icon: Layers, label: 'Components', color: 'text-cyan-400' },
    { id: 'piko', icon: PikoLogo, label: 'Piko AI', isPiko: true },
    { id: 'projects', icon: FolderOpen, label: 'Projects', color: 'text-purple-400' },
    { id: 'mcp', icon: Server, label: 'MCP Server', color: 'text-zinc-400' },
  ];

  return (
    <div ref={containerRef} className="flex h-screen w-full bg-[#030304] overflow-hidden text-white relative p-4 gap-4">
      {/* Dot grid (Background) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #ffffff 1px, transparent 0)', backgroundSize: '48px 48px' }} />

      {/* ── Sidebar (Floating Island) ── */}
      <aside className="relative z-30 w-20 flex flex-col items-center py-8 bg-black/40 border border-white/5 backdrop-blur-3xl shrink-0 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="mb-12 relative group">
          <div className="absolute -inset-3 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Image src="/Postpipe-Studio.svg" alt="Logo" width={32} height={32} className="relative hover:rotate-12 transition-transform duration-500 cursor-pointer" />
        </div>

        <div className="flex-1 flex flex-col space-y-6">
          {sidebarItems.map(item => (
            <div key={item.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                onClick={() => setActivePanel(prev => prev === item.id ? '' : item.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                  activePanel === item.id ? 'bg-purple-500/15 text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.2)] border border-purple-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.isPiko
                  ? <PikoLogo selected={activePanel === item.id} className="w-6 h-6" />
                  : <item.icon className={`w-5.5 h-5.5`} />}
                {activePanel === item.id && (
                  <motion.div layoutId="sidebar-indicator" className="absolute -left-2 w-1.5 h-6 rounded-r-full shadow-lg bg-purple-500 shadow-purple-500/60" />
                )}
              </motion.button>
              <div className="absolute left-full ml-5 px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-xl text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-15px] group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl z-50 backdrop-blur-xl">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mode badge (Floating Vertical) */}
        <div className="pb-4">
          <div className="flex flex-col items-center space-y-3 py-4 px-1.5 rounded-3xl border transition-all duration-700 bg-purple-500/10 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-180 select-none text-purple-400"
              style={{ writingMode: 'vertical-rl' }}>
              PIKO STUDIO
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 relative h-full">

        {/* ── Top Bar (Floating Island) ── */}
        <header className="h-16 flex items-center justify-between px-8 bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[1.5rem] shadow-2xl z-20">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[9px]">Environment</span>
              </div>
              <input 
                value={canvasName}
                onChange={e => setCanvasName(e.target.value)}
                className="bg-transparent border-none text-white font-black text-base focus:outline-none focus:ring-0 p-0 w-48 placeholder:text-zinc-700"
                placeholder="Project Name"
              />
            </div>
            <div className="h-8 w-px bg-white/10" />
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center bg-white/5 border border-white/5 rounded-2xl px-4 py-2 space-x-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-white text-xs font-mono font-bold">{nodes.length}</span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Components</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center space-x-2">
                <Link2 className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-white text-xs font-mono font-bold">{edges.length}</span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Relations</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setRefreshKey(prev => prev + 1)}
                disabled={isSyncing}
                className="group flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
              >
                {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isSyncing ? 'Syncing...' : 'Manual Sync'}</span>
              </button>

              <button onClick={onSave} disabled={isSaving}
                className="group relative flex items-center space-x-3 bg-white text-black px-7 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isSaving ? 'Saving...' : 'Save Canvas'}</span>
              </button>
              <button
                onClick={handleExportAndAIBuild}
                className="group relative flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-7 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Sparkles className="w-4 h-4" />
                <span>Export & AI Build</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Canvas Area (Island Background) ── */}
        <div className="flex-1 bg-black/40 border border-white/5 backdrop-blur-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden group/canvas" onDragOver={onDragOver} onDrop={onDrop}>
          <AnimatePresence>
            {nodes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <div className="text-center max-w-sm relative">
                  <div className="absolute -inset-24 bg-purple-500/10 blur-[120px] rounded-full opacity-50" />
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl">
                      <PikoLogo selected={false} className="w-12 h-12" />
                    </div>
                    <h3 className="text-white font-black text-3xl mb-4 tracking-tight">
                      Awaiting Strategy
                    </h3>
                    <p className="text-zinc-500 text-base leading-relaxed font-medium">
                      {mode === 'ai'
                        ? 'Describe your architecture in the Piko panel. The canvas will synchronize with your backend automatically.'
                        : 'Drag components from the library to start architecting your production backend.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ReactFlow
            nodes={syncedNodes.map((n: any) => ({ 
              ...n, 
              data: { 
                ...n.data, 
                allCanvasCollections: allCollections,
                availableConnectors 
              } 
            }))}
            edges={syncedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView={nodes.length > 0}
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={1.5}
            className="bg-transparent"
            deleteKeyCode="Delete"
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={48} size={1} color="#ffffff" style={{ opacity: 0.02 }} />
            <Controls
              className="react-flow-island-controls !m-6"
              showInteractive={false}
              position="top-right"
            />
            <MiniMap
              className="!bg-[#0a0a0b]/80 !border-white/10 !rounded-3xl !overflow-hidden !shadow-2xl !backdrop-blur-3xl !m-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              nodeColor={(n) => {
                const map: Record<string, string> = { 'form-node': '#22d3ee', 'auth-node': '#a855f7', 'database-node': '#34d399', 'connector-node': '#60a5fa' };
                return map[n.type || ''] || '#6b7280';
              }}
              maskColor="rgba(0,0,0,0.85)"
              style={{ width: 160, height: 110 }}
            />
          </ReactFlow>

          {/* ── Component Library (Nested Floating Island) ── */}
          <AnimatePresence>
            {activePanel === 'components' && (
              <motion.div
                drag
                dragMomentum={false}
                dragControls={libraryDragControls}
                dragListener={false}
                dragConstraints={containerRef}
                initial={{ x: -40, opacity: 0, scale: 0.95 }} 
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -40, opacity: 0, scale: 0.95 }} 
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute left-6 top-6 bottom-6 z-40"
              >
                <ComponentLibrary isOpen dragControls={libraryDragControls} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Project Library (Nested Floating Island) ── */}
          <AnimatePresence>
            {activePanel === 'projects' && (
              <motion.div
                drag
                dragMomentum={false}
                dragControls={projectDragControls}
                dragListener={false}
                dragConstraints={containerRef}
                initial={{ x: -40, opacity: 0, scale: 0.95 }} 
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -40, opacity: 0, scale: 0.95 }} 
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute left-6 top-6 bottom-6 z-40"
              >
                <ProjectLibrary 
                  userId={user?.id || apiKey || 'anonymous'} 
                  onLoad={loadCanvas}
                  currentNodes={nodes}
                  currentEdges={edges}
                  dragControls={projectDragControls}
                  refreshKey={refreshKey}
                  onNewProject={handleNewProject}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Piko AI Chat (Detached Island) ── */}
      <PikoChatWindow
        isOpen={activePanel === 'piko'}
        onClose={() => setActivePanel('')}
        dragConstraints={containerRef}
        dragMomentum={false}
        initialPrompt={pikoPrompt}
        onPromptConsumed={() => setPikoPrompt('')}
        onTaskComplete={() => {
          console.log('[Studio] Piko task complete. Auto-sync is OFF.');
          // setRefreshKey(prev => prev + 1);
        }}
      />

      {/* Deploy Modal */}
      <DeployModal
        isOpen={showDeploy}
        onClose={() => setShowDeploy(false)}
        nodes={nodes}
        edges={edges}
        apiKey={apiKey}
        mode={mode}
        onSendToPiko={(prompt) => {
          setPikoPrompt(prompt);
          setActivePanel('piko');
          setShowDeploy(false);
        }}
      />

      <style jsx global>{`
        .react-flow-island-controls {
          background: rgba(10, 10, 11, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1.25rem !important;
          overflow: hidden !important;
          backdrop-filter: blur(24px) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05) !important;
          padding: 4px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
        .react-flow-island-controls button {
          background: transparent !important;
          border: none !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: #94a3b8 !important;
          transition: all 0.2s transition !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .react-flow-island-controls button:last-child {
          border-bottom: none !important;
        }
        .react-flow-island-controls button:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }
        .react-flow-island-controls button svg {
          fill: currentColor !important;
          width: 14px !important;
          height: 14px !important;
        }
      `}</style>
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function CanvasPage() {
  const [mode, setMode] = useState<'ai' | 'manual' | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkFirstTime() {
      // 1. Check LocalStorage
      const onboarded = localStorage.getItem('piko_onboarded');
      if (onboarded === 'true') {
        setIsFirstTime(false);
        // Default to manual for returning users if they just hit /canvas
        setMode('manual');
        return;
      }

      // 2. Check Database (more reliable)
      try {
        const user = await fetchUserProfile();
        if (user) {
          const { hasCanvases } = await checkUserCanvases(user.id);
          if (hasCanvases) {
            localStorage.setItem('piko_onboarded', 'true');
            setIsFirstTime(false);
            setMode('manual');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking first time status:', err);
      }

      // 3. Truly first time
      setIsFirstTime(true);
    }
    
    checkFirstTime();
  }, []);

  const handleSelectMode = (m: 'ai' | 'manual') => {
    localStorage.setItem('piko_onboarded', 'true');
    setMode(m);
  };

  // Prevent flash of content
  if (isFirstTime === null) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {mode ? (
        <motion.div 
          key="studio" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="h-full w-full"
        >
          <Studio mode={mode} />
        </motion.div>
      ) : (
        <motion.div
          key="selector"
          exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className="relative min-h-screen bg-black w-full overflow-y-auto flex items-start justify-center"
        >
          <div className="fixed inset-0 z-0 pointer-events-none">
            <BackgroundGradientAnimation
              gradientBackgroundStart="rgb(5, 5, 20)"
              gradientBackgroundEnd="rgb(0, 0, 0)"
              containerClassName="h-full w-full"
            />
          </div>
          <ModeSelector onSelect={handleSelectMode} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
