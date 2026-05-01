'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getPikoStructure } from '@/app/actions/piko';

// Custom Node for Forms
const FormNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 min-w-[200px] shadow-2xl relative">
      {/* Target handle for incoming connections */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500 border-none" />
      
      <div className="flex items-center space-x-2 mb-3 border-b border-white/5 pb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <h3 className="font-bold text-sm text-white">{data.label}</h3>
        {data.status === 'Live' && (
          <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Live</span>
        )}
      </div>
      
      <div className="space-y-1.5">
        {data.fields?.map((field: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="text-zinc-300 font-medium">{field.name}</span>
            <span className="text-zinc-500 font-mono text-[10px]">{field.type}</span>
          </div>
        ))}
      </div>

      {/* Source handle for outgoing connections */}
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-cyan-400 border-none" />
    </div>
  );
};

// Custom Node for Auth Presets
const AuthNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-purple-500/30 rounded-xl p-4 min-w-[200px] shadow-2xl relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500 border-none" />
      
      <div className="flex items-center space-x-2 mb-3 border-b border-white/10 pb-2">
        <div className="w-2 h-2 rounded-full bg-purple-400" />
        <h3 className="font-bold text-sm text-white">{data.label}</h3>
      </div>
      
      <div className="space-y-1.5">
        {Object.entries(data.providers || {}).map(([provider, enabled], idx) => enabled ? (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="text-purple-200 capitalize">{provider}</span>
            <span className="text-emerald-400 font-mono text-[10px]">Enabled</span>
          </div>
        ) : null)}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-cyan-400 border-none" />
    </div>
  );
};

const nodeTypes = {
  formNode: FormNode,
  authNode: AuthNode,
};

export default function StructuralMap({ isPikoOpen }: { isPikoOpen: boolean }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [loading, setLoading] = useState(true);

  // Auto layout function
  const getLayoutedElements = (forms: any[], presets: any[]) => {
    const newNodes: any[] = [];
    const newEdges: any[] = [];
    
    let xOffset = 100;
    let yOffset = 100;

    // Add Auth nodes
    presets.forEach((preset, index) => {
      newNodes.push({
        id: `auth-${preset.id}`,
        type: 'authNode',
        position: { x: xOffset, y: yOffset + (index * 200) },
        data: { label: preset.name || 'Auth Preset', providers: preset.providers },
      });
      
      // Connect Auth to some forms if specified, but usually it's independent or connected to 'users' table
      // Let's connect the first auth to the first form as a visual flow example
      if (index === 0 && forms.length > 0) {
        newEdges.push({
          id: `e-auth-${forms[0].id}`,
          source: `auth-${preset.id}`,
          target: `form-${forms[0].id}`,
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
        });
      }
    });

    xOffset += 350;
    yOffset = 100;

    // Add Form nodes
    forms.forEach((form, index) => {
      // Find a row/col position
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      newNodes.push({
        id: `form-${form.id}`,
        type: 'formNode',
        position: { x: xOffset + (col * 350), y: yOffset + (row * 300) },
        data: { label: form.name, fields: form.fields, status: form.status },
      });
      
      // Create edges for relational fields
      form.fields?.forEach((field: any) => {
        if (field.type === 'reference' || field.targetFormId || field.reference) {
          let targetId = field.targetFormId;
          if (!targetId && field.reference) {
            targetId = typeof field.reference === 'string' ? field.reference : field.reference.collection;
          }
          
          if (targetId) {
             newEdges.push({
               id: `e-${form.id}-${targetId}`,
               source: `form-${form.id}`,
               target: `form-${targetId}`,
               animated: true,
               style: { stroke: '#22d3ee', strokeWidth: 2 },
               markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' },
               label: field.name,
               labelStyle: { fill: '#a1a1aa', fontSize: 10, fontWeight: 700 },
               labelBgStyle: { fill: '#18181b' },
             });
          }
        }
      });
    });

    return { newNodes, newEdges };
  };

  const loadData = useCallback(async () => {
    const apiKey = localStorage.getItem('piko_api_key') || '';
    const { success, forms, presets } = await getPikoStructure(apiKey);
    
    if (success && (forms.length > 0 || presets.length > 0)) {
      const { newNodes, newEdges } = getLayoutedElements(forms, presets);
      setNodes(newNodes);
      setEdges(newEdges);
    }
    setLoading(false);
  }, [setNodes, setEdges]);

  // Load data initially and every 5 seconds if Piko is open
  useEffect(() => {
    loadData();
    let interval: NodeJS.Timeout;
    if (isPikoOpen) {
      interval = setInterval(loadData, 5000);
    }
    return () => clearInterval(interval);
  }, [loadData, isPikoOpen]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-20 pointer-events-none">
        <div className="max-w-md text-center">
           <h2 className="text-2xl font-bold mb-4 opacity-80">Welcome to your empty Canvas</h2>
           <p className="text-zinc-500 text-sm leading-relaxed mb-8">
             Start by dragging nodes from the Components tab or ask Piko AI to generate your first structure.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        minZoom={0.2}
      >
        <Background gap={32} size={1} color="#22d3ee" className="opacity-10" />
      </ReactFlow>
    </div>
  );
}
