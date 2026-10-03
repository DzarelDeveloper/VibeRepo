"use client";

import { FormEvent, startTransition, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight, Check, ChevronDown, Clipboard, Download, GitBranch, Loader2,
  RotateCcw, Settings2, X,
} from "lucide-react";

type Provider = "openrouter" | "groq" | "gemini" | "openai";
type PackageResult = {
  repo: { name: string; fullName: string; description: string | null; stars: number; language: string | null };
  package: { vibeMd: string; mainPrompt: string; agents: string; design: string | null; architecture: string };
};

const providers: Record<Provider, { label: string; placeholder: string; models: string[] }> = {
  openrouter: { label: "OpenRouter", placeholder: "sk-or-v1-...", models: ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash-001"] },
  groq: { label: "Groq", placeholder: "gsk_...", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"] },
  gemini: { label: "Google Gemini", placeholder: "AIza...", models: ["gemini-3.6-flash"] },
  openai: { label: "OpenAI-compatible", placeholder: "sk-...", models: ["gpt-4o-mini", "gpt-4.1-mini"] },
};
const examples = ["vercel/next.js", "supabase/supabase", "shadcn-ui/ui"];
const stages = ["Fetching repo", "Analyzing structure", "Generating package"];
export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [model, setModel] = useState(providers.openrouter.models[0]);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PackageResult | null>(null);
  const [activeTab, setActiveTab] = useState("RECONSTRUCTION_PROMPT.md");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("viberepo-settings");
    if (saved) {
      const parsed = JSON.parse(saved) as { provider?: Provider; model?: string; apiKey?: string };
      const savedProvider = parsed.provider && providers[parsed.provider] ? parsed.provider : "openrouter";
      const savedModel = parsed.model && providers[savedProvider].models.includes(parsed.model)
        ? parsed.model
        : providers[savedProvider].models[0];
      startTransition(() => {
        setProvider(savedProvider);
        setModel(savedModel);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
      });
    }
  }, []);
  const saveSettings = () => { localStorage.setItem("viberepo-settings", JSON.stringify({ provider, model, apiKey })); setShowSettings(false); };
  const generate = async (event?: FormEvent) => {
    event?.preventDefault(); setError("");
    if (!repoUrl.trim()) return setError("Paste a public GitHub repository URL or owner/repo first.");
    if (!apiKey.trim()) return setError("Add your LLM API key in Settings to generate a package.");
    setLoading(true); setResult(null); setStage(0);
    const timer = window.setInterval(() => setStage((current) => Math.min(current + 1, 2)), 900);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repoUrl, provider, model, apiKey }) });
      const data = await response.json() as PackageResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Generation failed. Please try again.");
      setStage(2); setResult(data); setActiveTab("RECONSTRUCTION_PROMPT.md");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); }
    finally { window.clearInterval(timer); setLoading(false); }
  };
  const documents = useMemo(() => result ? {
    "RECONSTRUCTION_PROMPT.md": result.package.mainPrompt,
    "AGENTS.md": result.package.agents,
    ...(result.package.design ? { "DESIGN.md": result.package.design } : {}),
    "ARCHITECTURE.md": result.package.architecture,
    "VIBEREPO.md": result.package.vibeMd,
  } : {}, [result]);
  const content = documents[activeTab as keyof typeof documents] || "";
  const copy = async (text: string, label: string) => { await navigator.clipboard.writeText(text); setCopied(label); window.setTimeout(() => setCopied(""), 1600); };
  const download = () => {
    if (!result) return;
    const markdown = result.package.vibeMd;
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" })); const link = document.createElement("a"); link.href = url; link.download = `${result.repo.name}-VIBEREPO.md`; link.click(); URL.revokeObjectURL(url);
  };
  const tabs = Object.keys(documents);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0d0f] text-[#f5f3ee] selection:bg-[#c5f467] selection:text-[#111]">
      <div className="noise pointer-events-none fixed inset-0 opacity-[0.035]" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10"><button className="flex items-center gap-3" onClick={() => { setResult(null); setRepoUrl(""); }}><span className="grid size-9 place-items-center overflow-hidden rounded-xl border border-[#c5f467]/45 bg-[#151b17] shadow-[0_0_22px_rgba(197,244,103,.12)]"><Image src="/viberepo-mark.png" alt="VibeRepo" width={36} height={36} priority /></span><span className="font-display text-lg font-bold tracking-[-0.04em]">vibe<span className="text-[#c5f467]">repo</span></span></button><button onClick={() => setShowSettings(true)} className="control-button"><Settings2 size={16} /> Settings</button></header>
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 lg:px-10 lg:pt-24">
        {!result && !loading ? <div className="mx-auto max-w-4xl text-center"><div className="eyebrow"><span className="live-dot" /> Open source project intelligence</div><h1 className="font-display mt-7 text-5xl font-semibold leading-[0.95] tracking-[-0.075em] text-balance sm:text-7xl lg:text-[6.8rem]">Turn any repo into a <em className="text-[#c5f467]">vibe.</em></h1><p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#a5a6a3] sm:text-lg">One repository URL becomes one paste-ready reconstruction prompt, backed by a complete agent handoff. Zero archaeology.</p><form onSubmit={generate} className="mx-auto mt-11 max-w-3xl"><div className="input-shell"><GitBranch className="shrink-0 text-[#7b7f7d]" size={21} /><input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="github.com/owner/repository" aria-label="GitHub repository" /><button className="generate-button" type="submit"><span>Reverse this repo</span><ArrowRight size={17} /></button></div><div className="mt-5 flex flex-wrap items-center justify-center gap-2"><span className="mr-1 text-xs text-[#686c6a]">Try an example</span>{examples.map((example) => <button type="button" key={example} onClick={() => setRepoUrl(example)} className="example-chip">{example}</button>)}</div></form>{error && <p className="error-message" role="alert">{error}</p>}<div className="mt-20 grid gap-3 text-left sm:grid-cols-3"><Feature number="01" title="Read the repo" copy="README, tree, manifests, configuration, and the most relevant source files." /><Feature number="02" title="Find the signal" copy="Evidence-led analysis separates confirmed product behavior from inference." /><Feature number="03" title="Paste and build" copy="A GitReverse-style prompt plus one complete VIBEREPO.md handoff." /></div><section className="mt-20 text-left"><div className="eyebrow">What you receive</div><h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Four files, one goal: start building with the right context.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#8c918e]">Start with the primary prompt. The remaining files keep your coding agent consistent throughout the build.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><OutputFile name="RECONSTRUCTION_PROMPT.md" tag="Start here" copy="One detailed instruction to paste directly into Codex, Claude Code, or Cursor. It covers the product, core flows, stack, constraints, and acceptance criteria." /><OutputFile name="AGENTS.md" tag="Agent operating rules" copy="Add this file to your new project workspace. It defines structure, coding conventions, API and data rules, commands, and the agent's explicit do and don't rules." /><OutputFile name="DESIGN.md" tag="For UI projects" copy="Guides the visual layer: layout, components, states, responsiveness, accessibility, and motion. It is included only when the repository has a frontend." /><OutputFile name="VIBEREPO.md" tag="Complete handoff" copy="One Markdown handoff combining every output with the source snapshot, evidence index, and open questions. Download it when you want one source of truth." /></div></section></div> : loading ? <div className="mx-auto max-w-2xl py-28 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#303532] bg-[#131715]"><Loader2 className="animate-spin text-[#c5f467]" size={27} /></div><h2 className="font-display mt-8 text-3xl font-semibold tracking-[-0.04em]">Reading the room...</h2><p className="mt-3 text-[#8c918e]">Building a reconstruction brief for <span className="text-[#f5f3ee]">{repoUrl}</span></p><div className="mx-auto mt-12 max-w-sm space-y-4 text-left">{stages.map((item, index) => <div key={item} className={`flex items-center gap-3 text-sm ${index <= stage ? "text-[#f5f3ee]" : "text-[#505552]"}`}><span className={`grid size-6 place-items-center rounded-full border ${index < stage ? "border-[#c5f467] bg-[#c5f467] text-[#0b0d0f]" : index === stage ? "border-[#c5f467] text-[#c5f467]" : "border-[#343936]"}`}>{index < stage ? <Check size={13} /> : index === stage ? <Loader2 size={13} className="animate-spin" /> : index + 1}</span>{item}<span className="ml-auto text-xs text-[#66706a]">{index < stage ? "done" : index === stage ? "working" : "queued"}</span></div>)}</div></div> : result ? <div className="mx-auto max-w-6xl"><button onClick={() => setResult(null)} className="back-link"><RotateCcw size={14} /> Generate another</button><div className="mt-8 flex flex-col justify-between gap-6 border-b border-[#252a27] pb-8 sm:flex-row sm:items-end"><div><div className="eyebrow"><span className="live-dot" /> Paste-ready prompt</div><h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{result.repo.name}<span className="text-[#68706a]"> / decoded</span></h1><p className="mt-3 max-w-2xl text-[#8c918e]">Copy the first tab straight into your coding agent, or download the single complete handoff.</p></div><div className="flex shrink-0 gap-2"><button className="control-button" onClick={download}><Download size={15} /> Download full .md</button><button className="generate-button" onClick={() => copy(result.package.mainPrompt, "prompt")}><Clipboard size={15} /> {copied === "prompt" ? "Copied" : "Copy prompt"}</button></div></div><div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]"><nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button ${activeTab === tab ? "tab-active" : ""}`}>{tab}<ChevronDown className="ml-auto hidden lg:block" size={14} /></button>)}</nav><article className="min-h-[480px] rounded-2xl border border-[#292e2b] bg-[#111513]"><div className="flex items-center justify-between border-b border-[#292e2b] px-5 py-4"><div><p className="text-sm font-medium">{activeTab}</p><p className="mt-0.5 text-xs text-[#68706a]">Generated from {result.repo.fullName}</p></div><button className="icon-button" onClick={() => copy(content, activeTab)} aria-label={`Copy ${activeTab}`} title="Copy"><Check size={16} className={copied === activeTab ? "text-[#c5f467]" : "hidden"} /><Clipboard size={16} className={copied === activeTab ? "hidden" : ""} /></button></div><pre className="whitespace-pre-wrap p-6 font-mono text-[13px] leading-7 text-[#c4c9c5] sm:p-8">{content}</pre></article></div></div> : null}
      </section>
      <footer className="relative mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#252a27] px-5 py-7 text-xs text-[#686c6a] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>VibeRepo is free, open, and runs on your own API key.</span><span>Inspired by <a href="https://github.com/filiksyos/gitreverse" target="_blank" rel="noreferrer" className="text-[#a9b29f] underline decoration-[#c5f467] underline-offset-4">GitReverse</a></span></footer>
      {showSettings && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowSettings(false)}><section className="settings-modal"><div className="flex items-start justify-between"><div><div className="eyebrow">Your keys, your control</div><h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em]">LLM settings</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#8c918e]">Your key stays in this browser and is sent only when you generate a package.</p></div><button className="icon-button" onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={17} /></button></div><label className="field-label">Provider<select value={provider} onChange={(event) => { const next = event.target.value as Provider; setProvider(next); setModel(providers[next].models[0]); }}>{Object.entries(providers).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label><label className="field-label">Model<select value={model} onChange={(event) => setModel(event.target.value)}>{providers[provider].models.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">API key<input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={providers[provider].placeholder} autoComplete="off" /></label><button className="generate-button mt-2 w-full justify-center" onClick={saveSettings}>Save settings <Check size={15} /></button></section></div>}
    </main>
  );
}
function Feature({ number, title, copy }: { number: string; title: string; copy: string }) { return <div className="feature-card"><span className="text-xs text-[#c5f467]">{number}</span><h3 className="mt-8 font-display text-lg font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#7f8581]">{copy}</p></div>; }
function OutputFile({ name, tag, copy }: { name: string; tag: string; copy: string }) { return <article className="output-card"><div className="flex items-center justify-between gap-3"><code>{name}</code><span>{tag}</span></div><p>{copy}</p></article>; }
