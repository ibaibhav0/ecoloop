'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Code,
  Terminal,
  Key,
  Copy,
  Check,
  Send,
  ArrowLeft,
  Database,
  RefreshCw,
  QrCode,
  Globe,
  Server,
  BookOpen,
} from 'lucide-react';

export default function DevelopersPortalPage({ onBack }) {
  const [apiKey, setApiKey] = useState('ecoloop_live_public_key_2026_demo');
  const [selectedEndpoint, setSelectedEndpoint] = useState('stats'); // 'stats', 'items', 'register', 'keys'
  const [codeLanguage, setCodeLanguage] = useState('curl'); // 'curl', 'javascript', 'python'
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live Query Responses
  const [responseOutput, setResponseOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseTimeMs, setResponseTimeMs] = useState(null);

  // Filters for GET /api/items
  const [itemFilters, setItemFilters] = useState({
    status: 'all',
    type: 'all',
    minWeight: '',
    search: '',
    limit: 10,
  });

  // Form for POST /api/items/register
  const [registerPayload, setRegisterPayload] = useState({
    type: 'Laptop / Computer',
    approxWeight: 2.3,
    registeredBy: 'Arjun Rao (MIT Manipal)',
    email: 'arjun.rao@mit.manipal.edu',
    hostel: 'Block 14 (MIT Campus)',
    location: 'MIT Central Library E-Waste Bin',
    notes: 'Lenovo laptop submitted via federated campus API integration',
  });

  // Key Generation Form
  const [keyForm, setKeyForm] = useState({
    name: 'RVCE Bangalore Campus Portal',
    ownerEmail: 'sustainability@rvce.edu.in',
    role: 'external_campus',
    notes: 'Inter-collegiate green campus circular initiative',
  });

  const [generatedKeyResult, setGeneratedKeyResult] = useState(null);

  const runGetStats = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await api.getPublicStatsTotal(apiKey);
      setResponseTimeMs(Math.round(performance.now() - start));
      setResponseStatus(200);
      setResponseOutput(res);
    } catch (err) {
      setResponseTimeMs(Math.round(performance.now() - start));
      setResponseStatus(500);
      setResponseOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const runGetItems = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const params = {};
      if (itemFilters.status !== 'all') params.status = itemFilters.status;
      if (itemFilters.type !== 'all') params.type = itemFilters.type;
      if (itemFilters.minWeight) params.minWeight = itemFilters.minWeight;
      if (itemFilters.search) params.search = itemFilters.search;
      params.limit = itemFilters.limit;

      const res = await api.getPublicItems(params, apiKey);
      setResponseTimeMs(Math.round(performance.now() - start));
      setResponseStatus(res.success ? 200 : 401);
      setResponseOutput(res);
    } catch (err) {
      setResponseTimeMs(Math.round(performance.now() - start));
      setResponseStatus(500);
      setResponseOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const runRegisterItem = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await api.registerPublicItem(registerPayload, apiKey);
      setResponseTimeMs(Math.round(performance.now() - start));
      setResponseStatus(res.success ? 201 : 400);
      setResponseOutput(res);
    } catch (err) {
      setResponseTimeMs(Math.round(performance.now() - start));
      setResponseStatus(500);
      setResponseOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const runGenerateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateDeveloperKey(keyForm);
      if (res.success) {
        setGeneratedKeyResult(res);
        setApiKey(res.apiKey);
        setResponseOutput(res);
        setResponseStatus(201);
      }
    } catch (err) {
      setResponseOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runGetStats();
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getCodeSnippet = () => {
    if (selectedEndpoint === 'stats') {
      if (codeLanguage === 'curl') {
        return `curl -X GET "http://localhost:5000/api/stats/total" \\\n  -H "X-API-Key: ${apiKey}"`;
      }
      if (codeLanguage === 'javascript') {
        return `const response = await fetch('http://localhost:5000/api/stats/total', {\n  headers: { 'X-API-Key': '${apiKey}' }\n});\nconst stats = await response.json();\nconsole.log('Total Kg:', stats.totalWeightKg);`;
      }
      if (codeLanguage === 'python') {
        return `import requests\n\nurl = "http://localhost:5000/api/stats/total"\nheaders = {"X-API-Key": "${apiKey}"}\nresponse = requests.get(url, headers=headers)\nprint(response.json())`;
      }
    }

    if (selectedEndpoint === 'items') {
      if (codeLanguage === 'curl') {
        return `curl -X GET "http://localhost:5000/api/items?type=Laptop%20/%20Computer&minWeight=1.0&limit=10" \\\n  -H "X-API-Key: ${apiKey}"`;
      }
      if (codeLanguage === 'javascript') {
        return `const response = await fetch('http://localhost:5000/api/items?type=Laptop&limit=10', {\n  headers: { 'X-API-Key': '${apiKey}' }\n});\nconst { items } = await response.json();\nconsole.log(items);`;
      }
      if (codeLanguage === 'python') {
        return `import requests\n\nurl = "http://localhost:5000/api/items"\nheaders = {"X-API-Key": "${apiKey}"}\nparams = {"limit": 10}\nresponse = requests.get(url, headers=headers, params=params)\nprint(response.json())`;
      }
    }

    if (selectedEndpoint === 'register') {
      if (codeLanguage === 'curl') {
        return `curl -X POST "http://localhost:5000/api/items/register" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: ${apiKey}" \\\n  -d '${JSON.stringify(registerPayload, null, 2)}'`;
      }
      if (codeLanguage === 'javascript') {
        return `const payload = ${JSON.stringify(registerPayload, null, 2)};\nconst response = await fetch('http://localhost:5000/api/items/register', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'X-API-Key': '${apiKey}' },\n  body: JSON.stringify(payload)\n});\nconst result = await response.json();`;
      }
      if (codeLanguage === 'python') {
        return `import requests\n\nurl = "http://localhost:5000/api/items/register"\nheaders = {"X-API-Key": "${apiKey}", "Content-Type": "application/json"}\npayload = ${JSON.stringify(registerPayload, null, 2)}\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
      }
    }

    return `curl -X POST "http://localhost:5000/api/keys/generate" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(keyForm, null, 2)}'`;
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#000000] py-4 px-6 border-b border-[#3a3a3f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
            className="btn-spacex"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="spacex-caption flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffffff] inline-block" />
            <span>OPEN REST TELEMETRY &amp; FEDERATED API</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="spacex-caption">// FEDERATED DATA INTERFACE</div>
            <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
              DEVELOPER REST API
            </h1>
            <p className="text-base text-[#f0f0fa] leading-relaxed">
              Programmatic telemetry endpoints for universities, state pollution control boards, and authorized recyclers. Ingest external lab assets, query real-time mass diversion totals, and authenticate with cryptographic API keys.
            </p>
          </div>

          {/* Active Key Box */}
          <div className="border border-[#3a3a3f] bg-[#0a0a0a] p-6 space-y-3 min-w-[320px]">
            <div className="spacex-caption">// ACTIVE SSS-TOKEN HEADER</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full px-3 py-2 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] font-mono text-xs"
              />
              <button
                onClick={() => copyToClipboard(apiKey, 'key')}
                className="btn-spacex py-2 px-3 text-xs shrink-0"
              >
                <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 space-y-12 w-full">
        <div className="flex items-center gap-2 border-b border-[#3a3a3f] pb-4">
          {[
            { id: 'stats', label: 'GET /api/stats/total' },
            { id: 'items', label: 'GET /api/items' },
            { id: 'register', label: 'POST /api/items/register' },
            { id: 'keys', label: 'POST /api/keys/generate' },
          ].map((ep) => (
            <button
              key={ep.id}
              onClick={() => setSelectedEndpoint(ep.id)}
              className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
                selectedEndpoint === ep.id
                  ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                  : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
              }`}
            >
              {ep.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameters and Execute */}
          <div className="lg:col-span-5 border border-[#3a3a3f] bg-[#000000] p-6 space-y-6">
            <div className="border-b border-[#3a3a3f] pb-4">
              <span className="spacex-caption">// REQUEST CONFIGURATION</span>
              <h3 className="font-['D-DIN-Bold'] text-xl uppercase tracking-wider text-[#ffffff] mt-1">
                {selectedEndpoint === 'stats' && 'Campus Statistics'}
                {selectedEndpoint === 'items' && 'Query Manifest Items'}
                {selectedEndpoint === 'register' && 'Ingest Asset'}
                {selectedEndpoint === 'keys' && 'Generate API Key'}
              </h3>
            </div>

            {selectedEndpoint === 'stats' && (
              <div className="space-y-4">
                <p className="text-xs font-mono text-[#5a5a5f]">
                  Returns cumulative diverted kilograms, greenhouse gas reductions, active student operators, and CPCB hostel standings.
                </p>
                <button onClick={runGetStats} disabled={loading} className="btn-spacex w-full">
                  <span>{loading ? 'EXECUTING...' : 'SEND REQUEST'}</span>
                </button>
              </div>
            )}

            {selectedEndpoint === 'items' && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="spacex-caption block mb-1">SEARCH QUERY</label>
                  <input
                    type="text"
                    value={itemFilters.search}
                    onChange={(e) => setItemFilters({ ...itemFilters, search: e.target.value })}
                    placeholder="Search by code or model..."
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="spacex-caption block mb-1">MIN WEIGHT (KG)</label>
                  <input
                    type="number"
                    value={itemFilters.minWeight}
                    onChange={(e) => setItemFilters({ ...itemFilters, minWeight: e.target.value })}
                    placeholder="e.g. 1.0"
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <button onClick={runGetItems} disabled={loading} className="btn-spacex w-full">
                  <span>{loading ? 'EXECUTING...' : 'SEND REQUEST'}</span>
                </button>
              </div>
            )}

            {selectedEndpoint === 'register' && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="spacex-caption block mb-1">HARDWARE CLASSIFICATION</label>
                  <input
                    type="text"
                    value={registerPayload.type}
                    onChange={(e) => setRegisterPayload({ ...registerPayload, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="spacex-caption block mb-1">MASS (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={registerPayload.approxWeight}
                    onChange={(e) => setRegisterPayload({ ...registerPayload, approxWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="spacex-caption block mb-1">OPERATOR IDENTIFIER</label>
                  <input
                    type="text"
                    value={registerPayload.email}
                    onChange={(e) => setRegisterPayload({ ...registerPayload, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <button onClick={runRegisterItem} disabled={loading} className="btn-spacex w-full">
                  <span>{loading ? 'EXECUTING...' : 'SEND REQUEST'}</span>
                </button>
              </div>
            )}

            {selectedEndpoint === 'keys' && (
              <form onSubmit={runGenerateKey} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="spacex-caption block mb-1">INSTITUTION OR SYSTEM NAME</label>
                  <input
                    type="text"
                    required
                    value={keyForm.name}
                    onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="spacex-caption block mb-1">ADMINISTRATIVE CONTACT EMAIL</label>
                  <input
                    type="email"
                    required
                    value={keyForm.ownerEmail}
                    onChange={(e) => setKeyForm({ ...keyForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-spacex w-full">
                  <span>{loading ? 'GENERATING...' : 'GENERATE TOKEN'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Code and Live Response */}
          <div className="lg:col-span-7 space-y-6">
            {/* Code Snippet */}
            <div className="border border-[#3a3a3f] bg-[#000000] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
                <div className="flex items-center gap-2">
                  {['curl', 'javascript', 'python'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-3 py-1 uppercase font-mono text-[11px] rounded-full border transition-all ${
                        codeLanguage === lang
                          ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                          : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(getCodeSnippet(), 'code')}
                  className="btn-spacex py-1 px-3 text-[11px]"
                >
                  <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-[#f0f0fa] overflow-x-auto p-4 bg-[#0a0a0a] border border-[#3a3a3f]">
                {getCodeSnippet()}
              </pre>
            </div>

            {/* Live Telemetry Output */}
            <div className="border border-[#3a3a3f] bg-[#000000] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3 text-xs font-mono">
                <span className="spacex-caption">// LIVE API RESPONSE</span>
                {responseStatus && (
                  <div className="flex items-center gap-4">
                    <span className="text-[#ffffff]">HTTP {responseStatus}</span>
                    <span className="text-[#5a5a5f]">{responseTimeMs} MS</span>
                  </div>
                )}
              </div>

              <pre className="font-mono text-xs text-[#f0f0fa] overflow-x-auto p-4 bg-[#0a0a0a] border border-[#3a3a3f] max-h-96">
                {responseOutput ? JSON.stringify(responseOutput, null, 2) : '// Awaiting query execution...'}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
