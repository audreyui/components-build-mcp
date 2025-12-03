# components-build-mcp Setup Guide

## What We Built

An MCP server that embeds the complete [components.build](https://components.build) specification so AI assistants always have context when building UI components.

## Live URLs

| Asset | URL |
|-------|-----|
| **npm** | https://www.npmjs.com/package/components-build-mcp |
| **GitHub** | https://github.com/getlokiui/components-build-mcp |
| **Vercel API** | https://mcp-server-l0cjofu64-klammertime-projects.vercel.app |

---

## Using the MCP Server

### Option 1: Claude Desktop / Claude Code

Install globally:
```bash
npm install -g components-build-mcp
```

Add to your Claude config:

**Mac:** `~/.claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "components-build": {
      "command": "components-build-mcp"
    }
  }
}
```

Restart Claude. Then ask things like:
- "Grade this component against the components.build spec"
- "Show me the accessibility section"
- "Generate a Card component with composable sub-components"
- "What are the rules for data-slot attributes?"

### Option 2: HTTP API

```bash
# Get all grading rules
curl "https://mcp-server-l0cjofu64-klammertime-projects.vercel.app/?action=rules"

# Grade a component
curl -X POST "https://mcp-server-l0cjofu64-klammertime-projects.vercel.app/?action=grade" \
  -H "Content-Type: application/json" \
  -d '{"code": "export const Button = ({ children }) => <button>{children}</button>"}'

# Get quick reference cheat sheet
curl "https://mcp-server-l0cjofu64-klammertime-projects.vercel.app/?action=quick-reference"

# Generate a component
curl -X POST "https://mcp-server-l0cjofu64-klammertime-projects.vercel.app/?action=generate" \
  -H "Content-Type: application/json" \
  -d '{"name": "Card", "composable": true}'
```

---

## Custom Domain Setup (Optional)

### Domain Strategy

Set up a subdomain for the API (optional):
```
components.yourdomain.com → components-build-mcp Vercel deployment
```

### Step 1: Add DNS Record

Add a CNAME record in your DNS provider:
- **Host:** `components` (or your preferred subdomain)
- **Type:** CNAME
- **Answer:** `cname.vercel-dns.com`
- **TTL:** 600 (or default)

### Step 2: Add Domain in Vercel

1. Go to your Vercel project settings → Domains
2. Click "Add Domain"
3. Enter your subdomain
4. Vercel will verify the DNS (may take a few minutes)

### Step 3: Update README and package.json

Once the domain is working, update the URLs in:
- `README.md` - Update API examples
- `package.json` - Update homepage if desired

---

## Available MCP Tools

### Documentation Tools
| Tool | Description |
|------|-------------|
| `get_specification` | Get the full spec or a specific section |
| `search_specification` | Search for terms like "aria", "CVA", "data-slot" |
| `list_specification_sections` | List all 16 documentation sections |

### Grading & Validation Tools
| Tool | Description |
|------|-------------|
| `grade_component` | Grade code and get detailed feedback with score |
| `check_compliance` | Quick pass/fail check (threshold: 80/100) |
| `get_rules` | Get grading rules by category |
| `get_rule` | Get details about a specific rule |
| `list_rules` | List all rules with severity and weight |

### Generation Tools
| Tool | Description |
|------|-------------|
| `generate_component` | Generate a compliant component from templates |
| `get_template` | Get reference templates (button, card, input, etc.) |
| `get_quick_reference` | Get the cheat sheet |

---

## Specification Sections

The complete components.build specification includes 16 sections:

| Section | Description |
|---------|-------------|
| `overview` | Introduction and purpose |
| `definitions` | Terminology (Primitive, Component, Block, etc.) |
| `principles` | Core principles (Composability, Accessibility, etc.) |
| `composition` | Root/Trigger/Content pattern |
| `accessibility` | Complete a11y guide |
| `designTokens` | CSS variables and theming |
| `state` | Controlled/uncontrolled state |
| `styling` | cn(), CVA, tailwind-merge |
| `types` | TypeScript patterns |
| `polymorphism` | The "as" prop |
| `asChild` | Radix Slot pattern |
| `dataAttributes` | data-state/data-slot patterns |
| `docs` | Documentation standards |
| `registry` | shadcn CLI distribution |
| `marketplaces` | Component marketplaces |
| `npm` | NPM distribution |

---

## Grading Categories

Components are graded on:

- **Types** - Extending HTML props, exporting types, spreading props correctly
- **Styling** - Using cn() utility, class order, design tokens
- **Accessibility** - ARIA attributes, keyboard navigation, semantic HTML
- **Composition** - Single element wrapping, composable patterns
- **State** - Supporting controlled and uncontrolled usage
- **Naming** - Following conventions (Root, Trigger, Content, etc.)

---

## Publishing Updates

### To npm

```bash
# Bump version
npm version patch  # or minor, or major

# Publish (will prompt for OTP)
npm publish --access public --ignore-scripts
```

### To Vercel

Automatic on git push, or manually:
```bash
vercel --prod
```

---

## Local Development

```bash
cd mcp-server
npm install
npm run build
npm start
```

Test with MCP Inspector:
```bash
npm run inspect
```

---

## Credits

This project implements the [components.build](https://components.build) specification.

- **Specification Copyright:** 2023 Vercel, Inc.
- **Co-authored by:** [Hayden Bleasel](https://github.com/haydenbleasel) and [shadcn](https://github.com/shadcn)
- **Licensed under:** Apache License 2.0

This MCP server is a community project by Audrey Klammer and is not officially affiliated with or endorsed by Vercel, Inc.
