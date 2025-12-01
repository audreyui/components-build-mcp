# Deployment Guide

## Option 1: Vercel (Recommended for HTTP API)

### Quick Deploy

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd mcp-server
   vercel
   ```

3. **Follow prompts** to link to your Vercel account.

4. **For production**:
   ```bash
   vercel --prod
   ```

### Your API will be live at:
```
https://your-project.vercel.app/
```

### API Endpoints

Once deployed, you can use these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/?action=rules` | GET | Get all rules |
| `/?action=rule&id=<ruleId>` | GET | Get specific rule |
| `/?action=grade` | POST | Grade component code |
| `/?action=generate` | POST | Generate component |
| `/?action=check` | POST | Check compliance |
| `/?action=list` | GET | List all rules |
| `/?action=template&name=<template>` | GET | Get template |
| `/?action=quick-reference` | GET | Get quick reference |

### Example Usage

```bash
# Get all rules
curl https://your-project.vercel.app/?action=list

# Grade a component
curl -X POST https://your-project.vercel.app/?action=grade \
  -H "Content-Type: application/json" \
  -d '{"code": "export const Button = () => <button>Click</button>"}'

# Generate a component
curl -X POST https://your-project.vercel.app/?action=generate \
  -H "Content-Type: application/json" \
  -d '{"name": "Card", "template": "card"}'
```

---

## Option 2: Local MCP Server (For Claude Code)

### Setup

1. **Build the server**:
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

2. **Add to Claude Code config** (`~/.claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "audreyui-rules": {
         "command": "node",
         "args": ["/Users/audreyklammer/Clean_Room/audreyui/components.build-main/mcp-server/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Claude Code**

### Verify

After restarting, ask Claude:
- "What tools do you have for component rules?"
- "Grade this button component..."
- "Generate a Card component"

---

## Option 3: Use Both

You can use **both** approaches:

1. **Local MCP** for Claude Code integration (best AI experience)
2. **Vercel API** for:
   - Other AI tools
   - CI/CD pipelines
   - Web dashboards
   - Team sharing

---

## Environment Variables

None required for basic functionality.

Optional for future features:
- `OPENAI_API_KEY` - For AI-powered suggestions
- `DATABASE_URL` - For tracking scores over time

---

## Updating

### Local
```bash
cd mcp-server
git pull
npm run build
# Restart Claude Code
```

### Vercel
```bash
cd mcp-server
git pull
vercel --prod
```

---

## Troubleshooting

### MCP Server not showing in Claude Code

1. Check the path in config is correct
2. Ensure `dist/index.js` exists (run `npm run build`)
3. Check for errors: `node dist/index.js`
4. Restart Claude Code completely

### Vercel deploy fails

1. Check `npm run build` works locally
2. Ensure all dependencies are in package.json
3. Check Vercel logs for errors

### API returns errors

1. Check request format (POST needs JSON body)
2. Verify Content-Type header
3. Check the action parameter spelling
