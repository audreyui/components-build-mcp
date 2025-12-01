# Project Context & Brain Dump

> **For Audrey (who has ADHD) and future AI assistants**
>
> This document contains EVERYTHING about why this project exists, what we built, where we left off, and what's next. Don't assume anyone remembers anything.

---

## TL;DR - What Is This?

An MCP server that embeds the **components.build specification** (by Vercel/shadcn) so that AI assistants (like Claude) always have access to the rules when helping you build UI components. No more re-explaining the spec every session.

---

## Why Audrey Built This

### The Problem
- Audrey is building **AudreyUI**, a component library (think: TailGrids competitor with 500+ components)
- The components.build spec has 16 sections of rules for building proper, accessible, composable components
- Every time Audrey starts a new Claude session, the AI doesn't know these rules
- Re-explaining the spec every time is exhausting and error-prone

### The Solution
- Embed the ENTIRE spec into an MCP server
- Now any AI assistant with this MCP installed automatically knows:
  - How to grade components against the spec
  - How to generate compliant components
  - All the accessibility, typing, styling, and composition rules
  - The "why" behind each rule

### Why This Is Exciting
1. **For AudreyUI**: Every component Audrey builds will automatically follow the spec
2. **For Portfolio**: This is a legit open-source contribution that shows Audrey understands component architecture
3. **For Job Application**: Audrey is applying to Vercel - this shows deep understanding of their ecosystem
4. **For Community**: Anyone can use this MCP to build better components

---

## The Master Plan (Audrey's Business Vision)

```
┌─────────────────────────────────────────────────────────────┐
│                      AUDREYUI EMPIRE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AudreyUI Component Library (audreyui.com)              │
│     - Free tier: 100 components                            │
│     - Pro tier: $49 lifetime (500+ components)             │
│     - Team tier: $199 for 5 seats                          │
│                                                             │
│  2. Free Components in shadcn Registry                      │
│     - Drives traffic to AudreyUI                           │
│     - Builds credibility in the ecosystem                  │
│                                                             │
│  3. This MCP Server (open source)                          │
│     - Shows AudreyUI follows the spec                      │
│     - Portfolio piece for Vercel job                       │
│     - Community goodwill                                   │
│                                                             │
│  4. Vercel Job Application                                 │
│     - All of the above demonstrates expertise              │
│     - Deep understanding of shadcn/Radix patterns          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## What We Built (Technical Details)

### The MCP Server

**Location:** `/Users/audreyklammer/Clean_Room/audreyui/components.build-main/mcp-server/`

**Key Files:**
```
mcp-server/
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── docs/
│   │   └── full-specification.ts   # ALL 16 sections of components.build (2176 lines!)
│   ├── rules/
│   │   ├── component-rules.ts      # 18 grading rules (framework-agnostic)
│   │   └── templates.ts            # React/TypeScript templates
│   └── tools/
│       └── index.ts                # 11 MCP tools
├── api/
│   └── index.ts                    # Vercel serverless function (HTTP API)
├── dist/                           # Compiled JS (don't edit, run `npm run build`)
├── package.json                    # npm package config
├── tsconfig.json                   # TypeScript config
├── vercel.json                     # Vercel deployment config
├── LICENSE                         # Apache 2.0
├── NOTICE                          # Attribution to Vercel/Hayden/shadcn
├── README.md                       # Public-facing docs
├── SETUP.md                        # Detailed setup guide
└── CONTEXT.md                      # THIS FILE
```

### Important Design Decisions

1. **Grading is FRAMEWORK-AGNOSTIC**
   - The rules check for universal patterns (accessibility, composition, data attributes)
   - Works with React, Vue, Svelte, Angular, etc.
   - This was a deliberate choice to maximize usefulness

2. **Templates are REACT/TYPESCRIPT ONLY**
   - The `generate_component` tool outputs React + TypeScript
   - This matches shadcn/ui patterns
   - Could add other frameworks later

3. **Full Spec Embedded (not summarized)**
   - Audrey initially wanted just a summary
   - We realized the FULL spec is needed for AI to give accurate advice
   - All 16 sections are in `full-specification.ts`

---

## Where Everything Lives

### Live URLs

| What | URL |
|------|-----|
| npm package | https://www.npmjs.com/package/components-build-mcp |
| GitHub repo | https://github.com/audreyui/components-build-mcp |
| Vercel API | https://mcp-server-l0cjofu64-klammertime-projects.vercel.app |

### Accounts & Credentials

| Service | Account | Notes |
|---------|---------|-------|
| GitHub | `audreyui` org | Repo: `components-build-mcp` |
| npm | Audrey's personal npm account | Published as `components-build-mcp` |
| Vercel | `klammertime-projects` | Project: `mcp-server` |
| Porkbun | Audrey owns `audreyui.com` and `audreyui.dev` | DNS managed here |

### Contact Info Used

- **Author email:** audrey.ck@gmail.com
- **Website:** https://audreyui.com

---

## What's Done (Completed Tasks)

- [x] Read and analyzed all 16 sections of components.build spec
- [x] Created documentation in `/docs` folder (COMPONENT_RULES.md, QUICK_REFERENCE.md, TOOLING_IDEAS.md)
- [x] Built complete MCP server with 11 tools
- [x] Embedded FULL specification (2176 lines) - not just a summary
- [x] Created 18 grading rules (framework-agnostic)
- [x] Created React/TypeScript templates
- [x] Added Vercel HTTP API endpoint
- [x] Fixed TypeScript build errors
- [x] Set up proper Apache 2.0 licensing with NOTICE file
- [x] Created professional README with credits to Vercel/Hayden/shadcn
- [x] Created GitHub repo under `audreyui` org
- [x] Deployed to Vercel (API is live!)
- [x] Disabled Vercel deployment protection (API is public)
- [x] Published to npm as `components-build-mcp` v1.0.0
- [x] Created SETUP.md with detailed usage instructions
- [x] Created CONTEXT.md (this file)

---

## What's NOT Done (Next Steps)

### Immediate (Do These First)

1. **Set up custom domain**
   - Add `components.audreyui.dev` pointing to the Vercel deployment
   - Instructions in SETUP.md under "Custom Domain Setup"
   - Need to: Add CNAME in Porkbun, then add domain in Vercel

2. **Test the MCP in Claude**
   - Install globally: `npm install -g components-build-mcp`
   - Add to Claude config (see SETUP.md)
   - Restart Claude and test with: "Grade this component..."

3. **Commit this CONTEXT.md file**
   - It's written but not pushed yet

### Soon (This Week)

4. **Update README/SETUP with custom domain URL**
   - Once `components.audreyui.dev` is working, update all the example URLs

5. **Add GitHub Actions for CI/CD**
   - Auto-publish to npm on version tag
   - Auto-deploy to Vercel on push

### Later (When Building AudreyUI)

6. **Use this MCP to grade AudreyUI components**
   - Every component you build, ask Claude to grade it
   - Iterate until score is 90+

7. **Create more MCP servers for other purposes**
   - Could have MCPs for: design tokens, accessibility testing, etc.
   - Use subdomains: `tokens.audreyui.dev`, `a11y.audreyui.dev`

---

## How to Continue Working on This

### If You Need to Make Changes

```bash
cd /Users/audreyklammer/Clean_Room/audreyui/components.build-main/mcp-server

# Edit files in src/
# Then build:
npm run build

# Test locally:
npm start

# Commit and push:
git add -A
git commit -m "Your message"
git push

# Vercel auto-deploys on push
```

### If You Need to Publish a New npm Version

```bash
# Bump version (patch = 1.0.0 → 1.0.1)
npm version patch

# Publish (will prompt for OTP from authenticator app)
npm publish --access public --ignore-scripts

# Push the version tag
git push --tags
```

### If You Need to Test the MCP

```bash
# Run the MCP inspector
npm run inspect

# Or test the HTTP API:
curl "https://mcp-server-l0cjofu64-klammertime-projects.vercel.app/?action=rules"
```

---

## Key Concepts to Remember

### What is MCP?
**Model Context Protocol** - A standard for giving AI assistants access to tools and context. When you add an MCP server to Claude, it gains new capabilities.

### What is components.build?
A specification by Vercel (co-authored by Hayden Bleasel and shadcn) that defines how to build modern, composable, accessible UI components. It's the philosophy behind shadcn/ui.

### What does this MCP give Claude?
- Access to the full spec (so it knows the rules)
- Ability to grade any component code
- Ability to generate compliant components
- Search functionality across the spec

### Why Apache 2.0 License?
- The original components.build spec is Apache 2.0
- We must use the same license for derivative works
- Required proper attribution in NOTICE file

---

## Files to Read First (For Future AI)

If you're an AI assistant continuing this work, read these in order:

1. `README.md` - Public overview
2. `CONTEXT.md` - This file (you're reading it)
3. `SETUP.md` - Technical setup details
4. `src/docs/full-specification.ts` - The embedded spec
5. `src/rules/component-rules.ts` - The grading rules
6. `src/tools/index.ts` - The MCP tools

---

## Emotional Context (For Audrey)

**Why you were excited about this:**
- This solves a real problem you have (AI forgetting the spec)
- It's a portfolio piece that shows deep expertise
- It supports your business (AudreyUI)
- It's open source and helps others
- It positions you well for the Vercel job

**What was frustrating:**
- npm login changed in 2025 (now requires granular tokens)
- OTP codes kept expiring during publish
- Vercel deployment protection was blocking the API

**What felt good:**
- The MCP server works!
- It's live on npm and Vercel
- The architecture is clean
- Proper licensing is in place

---

## Quick Commands Reference

```bash
# Navigate to project
cd /Users/audreyklammer/Clean_Room/audreyui/components.build-main/mcp-server

# Build
npm run build

# Run locally
npm start

# Test with inspector
npm run inspect

# Deploy to Vercel
vercel --prod

# Publish to npm (prompts for OTP)
npm version patch && npm publish --access public --ignore-scripts

# Test the live API
curl "https://mcp-server-l0cjofu64-klammertime-projects.vercel.app/?action=rules"
```

---

## Contact / Help

- **Audrey's email:** audrey.ck@gmail.com
- **GitHub issues:** https://github.com/audreyui/components-build-mcp/issues
- **components.build spec:** https://components.build

---

*Last updated: November 30, 2025*
*Created during session with Claude (Opus 4.5)*
