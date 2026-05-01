'use client';

import React, { useState } from 'react';
import { X, Rocket, CheckCircle, AlertCircle, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeployResult {
  success: boolean;
  items: Array<{ name: string; type: string; status: 'created' | 'error'; id?: string; error?: string }>;
  pikoSummary?: string;
}

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: any[];
  edges: any[];
  apiKey: string;
  mode: 'manual' | 'ai';
  onSendToPiko?: (prompt: string) => void;
}

function buildDeployPrompt(nodes: any[], edges: any[]): string {
  const nodeDescriptions = nodes.map(n => {
    const d = n.data;
    if (n.type === 'form-node') {
      const fields = (d.fields || []).map((f: any) => {
        let fieldStr = `${f.name}(${f.type}${f.required ? ', required' : ''})`;
        if (f.type === 'relational') {
          fieldStr += ` [Relational Target: ${f.targetCollection}.${f.targetField}]`;
        }
        if (f.isRelationalSource) {
          fieldStr += ` [Marked as Relational Source]`;
        }
        return fieldStr;
      }).join(', ');
      return `FORM "${d.label}"\n    Fields: ${fields}\n    Notes: ${d.notes || 'None'}`;
    }
    if (n.type === 'auth-node') {
      const providers = Object.entries(d.providers || {}).filter(([, v]) => v).map(([k]) => k);
      let authStr = `AUTH PRESET "${d.label}"\n    Providers: ${providers.join(', ')}\n    Config Mode: ${d.configMode}\n    Connector: ${d.connector}\n    Notes: ${d.notes || 'None'}`;
      
      if (d.requireEmailVerification) {
        authStr += `\n    Security: Email Verification Required (via ${d.emailProvider || 'resend'})`;
        if (d.emailProvider === 'nodemailer') {
          authStr += `\n    SMTP Config: ${d.smtpHost}:${d.smtpPort} (User: ${d.smtpUser})`;
        }
      }
      return authStr;
    }
    if (n.type === 'database-node') {
      return `DATABASE "${d.label}" (${d.dbType || 'mongodb'}) with collections: ${(d.collections || []).join(', ')}`;
    }
    if (n.type === 'webhook-node') return `WEBHOOK "${d.label}" pointing to ${d.url}`;
    if (n.type === 'connector-node') return `CONNECTOR "${d.label}" at ${d.url}`;
    return `NODE "${d.label}"`;
  });


  const edgeDescriptions = edges.map(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    return `${src?.data?.label ?? e.source} (${src?.type?.replace('-node', '')}) → ${tgt?.data?.label ?? e.target} (${tgt?.type?.replace('-node', '')})`;
  });

  return `The user has architected the following system in Postpipe Studio:\n\n### Components\n${nodeDescriptions.map(d => `- ${d}`).join('\n')}\n\n### Connections & Mappings\n${edgeDescriptions.map(d => `- ${d}`).join('\n') || '- No specific mappings defined'}\n\n### Task for Piko\nPlease execute the creation of all these forms, auth presets, and systems exactly as defined above. Ensure relational fields are linked correctly to their target collections. If notes are provided, follow those custom instructions for the specific component.`;
}

export function DeployModal({ isOpen, onClose, nodes, edges, apiKey, mode, onSendToPiko }: DeployModalProps) {
  const [status, setStatus] = useState<'idle' | 'deploying' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<DeployResult | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const handleSendToPiko = () => {
    const prompt = buildDeployPrompt(nodes, edges);
    onSendToPiko?.(prompt);
  };

  const deploy = async () => {
    if (!apiKey) {
      setStatus('error');
      setResult({ success: false, items: [], pikoSummary: 'No API key found. Open Piko chat and enter your key first.' });
      return;
    }

    setStatus('deploying');
    setLog([]);
    const items: DeployResult['items'] = [];

    const POSTPIPE = process.env.NEXT_PUBLIC_POSTPIPE_URL || 'https://www.postpipe.in';
    const headers = { 'x-piko-api-key': apiKey, 'Content-Type': 'application/json' };

    // Deploy each node
    for (const node of nodes) {
      const d = node.data;
      setLog(prev => [...prev, `Deploying ${node.type}: ${d.label}...`]);

      try {
        if (node.type === 'form-node') {
          const res = await fetch(`${POSTPIPE}/api/piko/v1/forms`, {
            method: 'POST', headers,
            body: JSON.stringify({ name: d.label, fields: d.fields || [] }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            items.push({ name: String(d.label), type: 'Form', status: 'created', id: data.form?.id });
            setLog(prev => [...prev, `✓ Form "${d.label}" created (${data.form?.id})`]);
          } else {
            throw new Error(data.error || 'Unknown error');
          }
        } else if (node.type === 'auth-node') {
          const res = await fetch(`${POSTPIPE}/api/piko/v1/auth-presets`, {
            method: 'POST', headers,
            body: JSON.stringify({ 
              name: d.label, 
              providers: d.providers,
              requireEmailVerification: d.requireEmailVerification,
              configMode: d.configMode,
              projectId: d.projectId,
              redirectUrl: d.redirectUrl,
              frontendUrlAlias: d.frontendUrlAlias,
              connector: d.connector
            }),
          });
          const data = await res.json();
          if (res.ok) {
            items.push({ name: String(d.label), type: 'Auth', status: 'created', id: data.preset?.id });
            setLog(prev => [...prev, `✓ Auth "${d.label}" created`]);
          } else {
            throw new Error(data.error || 'Unknown error');
          }
        } else {
          items.push({ name: String(d.label), type: node.type, status: 'created' });
          setLog(prev => [...prev, `✓ ${node.type} "${d.label}" noted`]);
        }
      } catch (err: any) {
        items.push({ name: String(d.label), type: node.type, status: 'error', error: err.message });
        setLog(prev => [...prev, `✗ Error: ${err.message}`]);
      }
    }

    const allOk = items.every(i => i.status === 'created');
    setResult({
      success: allOk,
      items,
      pikoSummary: allOk
        ? `Deployed ${items.length} component(s) successfully.`
        : `Deployed with ${items.filter(i => i.status === 'error').length} error(s).`,
    });
    setStatus('done');
  };

  const handleClose = () => {
    setStatus('idle');
    setResult(null);
    setLog([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg mx-4 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="font-bold text-white">Deploy Architecture</h2>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {mode === 'manual' ? `${nodes.length} component(s) will be created` : 'Piko-generated structure'}
                </p>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {status === 'idle' && (
                <>
                  {nodes.length === 0 ? (
                    <div className="text-center py-6">
                      <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-400 text-sm">Canvas is empty. Add components first.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {nodes.map(n => (
                          <div key={n.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                              <span className="text-white text-sm font-medium">{String(n.data.label)}</span>
                            </div>
                            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                              {n.type.replace('-node', '')}
                            </span>
                          </div>
                        ))}
                      </div>
                      {!apiKey && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
                          ⚠ Enter your API key in the Piko chat panel before deploying.
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {status === 'deploying' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Deploying to Postpipe...</span>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                    {log.map((l, i) => (
                      <div key={i} className={l.startsWith('✓') ? 'text-emerald-400' : l.startsWith('✗') ? 'text-red-400' : 'text-zinc-400'}>
                        {l}
                      </div>
                    ))}
                    <div className="w-2 h-4 bg-white/60 animate-pulse inline-block" />
                  </div>
                </div>
              )}

              {status === 'done' && result && (
                <div className="space-y-3">
                  <div className={`flex items-center space-x-2 ${result.success ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold">{result.pikoSummary}</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.items.map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${item.status === 'created' ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-white text-xs font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">{item.type}</span>
                          {item.status === 'created' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="text-red-400 text-[10px]">{item.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/5">
              <button onClick={handleClose} className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors">
                {status === 'done' ? 'Close' : 'Cancel'}
              </button>
              {status === 'idle' && nodes.length > 0 && (
                <>
                   <button
                    onClick={handleSendToPiko}
                    className="flex items-center space-x-2 px-5 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold rounded-xl text-sm hover:bg-purple-500/30 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Send to Piko</span>
                  </button>
                  <button
                    onClick={deploy}
                    className="flex items-center space-x-2 px-5 py-2 bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-100 transition-all active:scale-95"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Deploy Manually</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
