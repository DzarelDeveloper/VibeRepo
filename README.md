<div align="center">
  <img src="./public/viberepo-mark.png" alt="VibeRepo mark" width="88" />
  <h1>VibeRepo</h1>
  <p><strong>Turn a GitHub repository into a clear, build-ready blueprint.</strong></p>
  <p>Skip the archaeology. Get the context, structure, and handoff you need to start building.</p>
  <p>
    <a href="https://github.com/DzarelDeveloper/VibeRepo/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-c5f467?style=flat-square" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  </p>
</div>

---

Paste a **public GitHub repository URL** and VibeRepo examines its README, file tree, manifests, configuration, and relevant source files. It turns that evidence into a practical project handoff, ready to copy, download, and use.

## What you get

| Document | What it is for |
| --- | --- |
| `RECONSTRUCTION_PROMPT.md` | A single, paste-ready instruction describing the product, workflows, stack, constraints, and acceptance criteria. |
| `AGENTS.md` | Project-specific working rules, architecture notes, commands, and implementation guardrails. |
| `DESIGN.md` | Visual guidance for frontend projects; included when the source repository has a frontend. |
| `ARCHITECTURE.md` | A concise summary of the confirmed stack, entry points, data flow, and open questions. |
| `VIBEREPO.md` | One combined handoff with the generated documents, source snapshot, evidence index, and uncertainties. |

Copy an individual document or download the complete `VIBEREPO.md` handoff.

## How it works

1. **Enter a repository** — paste a GitHub URL or `owner/repo`.
2. **Review the evidence** — the project is summarized from its public files and structure.
3. **Generate the handoff** — choose a provider and model, then create the project documents.
4. **Copy or download** — use the individual files or save the combined handoff.

## Run locally

**Requirements:** Node.js 18.18 or newer and npm.

```bash
git clone https://github.com/DzarelDeveloper/VibeRepo.git
cd VibeRepo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), open **Settings**, add a provider API key, and enter a public repository.

## Providers

VibeRepo supports **OpenRouter**, **Groq**, **Google Gemini**, and **OpenAI-compatible** endpoints. Select a provider and model in Settings.

Your provider key is saved in your browser's `localStorage` and sent with the generation request. VibeRepo does not require a GitHub token to read public repositories; an optional server-side `GITHUB_TOKEN` can be used to raise GitHub API rate limits.

## Built with

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Lucide icons

## Deploy

Deploy as a standard Next.js application on [Vercel](https://vercel.com/). No database or required environment variables are needed.

## Credits

Inspired by [GitReverse](https://github.com/filiksyos/gitreverse).
