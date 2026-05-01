import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { Database, ChevronDown, Trash2 } from 'lucide-react';

function EdgeDropdown({ id, value, options, onUpdate }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.value === value);

  return (
    <div className="relative" onMouseDown={e => e.stopPropagation()}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 cursor-pointer transition-colors hover:text-white"
      >
        <span className="text-[9px] font-black uppercase tracking-widest text-white truncate max-w-[100px]">
          {selected?.label || 'Source DB'}
        </span>
        <ChevronDown className={`w-2.5 h-2.5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-[101] bg-[#0d0d0e] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-1 duration-200 min-w-[120px]">
            {options.map((opt: any) => (
              <div 
                key={opt.value}
                onClick={() => { onUpdate?.(id, { selectedDatabase: opt.value }); setIsOpen(false); }}
                className={`px-3 py-1.5 text-[9px] cursor-pointer transition-colors font-mono ${value === opt.value ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
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

export function DatabaseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data: rawData,
}: EdgeProps) {
  const data = rawData as any;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {/* Middle Selector */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="bg-[#0a0a0b]/95 border border-white/10 rounded-full px-3 py-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex items-center space-x-2 group hover:border-cyan-500/30 transition-all border-dashed relative">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
             <EdgeDropdown 
               id={id}
               value={data?.selectedDatabase || ''}
               options={(data?.options || []).map((opt: string) => ({ label: opt, value: opt }))}
               onUpdate={data?.onUpdate}
             />
             <Database className="w-2.5 h-2.5 text-zinc-500 group-hover:text-cyan-400 transition-colors shrink-0" />
          </div>
        </div>

        {/* End Delete Button */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetX - 25}px,${targetY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
           <button 
            onClick={(e) => { e.stopPropagation(); data?.onUpdate?.(id, { _deleted: true }); }}
            className="w-5 h-5 flex items-center justify-center bg-[#0a0a0b] border border-white/10 rounded-full hover:border-red-500/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all shadow-xl backdrop-blur-md group"
            title="Delete Connection"
          >
            <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export function GenericEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data: rawData,
}: EdgeProps) {
  const data = rawData as any;
  const [edgePath, ,] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetX - 25}px,${targetY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
           <button 
            onClick={(e) => { e.stopPropagation(); data?.onDelete?.(id); }}
            className="w-5 h-5 flex items-center justify-center bg-[#0a0a0b] border border-white/10 rounded-full hover:border-red-500/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all shadow-xl backdrop-blur-md group"
            title="Delete Connection"
          >
            <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const EDGE_TYPES = {
  'database-edge': DatabaseEdge,
  'generic-edge': GenericEdge,
};
