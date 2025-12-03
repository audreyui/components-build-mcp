# components-build-mcp

An MCP (Model Context Protocol) server that implements the [components.build](https://components.build) specification for grading, generating, and validating UI components.

[![npm version](https://badge.fury.io/js/components-build-mcp.svg)](https://www.npmjs.com/package/components-build-mcp)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## About

This MCP server provides AI assistants with tools to:

- **Access the complete components.build specification** - The full documentation embedded and searchable
- **Grade components** - Validate any component against the spec's rules
- **Generate compliant components** - Create new components that follow all best practices
- **Search documentation** - Find specific patterns, rules, or concepts

The [components.build specification](https://components.build) is an open-source standard for building modern, composable, and accessible UI components, co-authored by [Hayden Bleasel](https://github.com/haydenbleasel) and [shadcn](https://github.com/shadcn).

## Framework Support

| Feature | Frameworks Supported |
|---------|---------------------|
| **Specification** | Framework-agnostic |
| **Grading** | Framework-agnostic (React, Vue, Svelte, Angular, etc.) |
| **Templates** | React + TypeScript |

The grading rules check for universal patterns (accessibility, composition, data attributes) that apply to any framework.

## Installation

### For Claude Code / Claude Desktop

```bash
npm install -g components-build-mcp
```

Add to your Claude configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "components-build": {
      "command": "components-build-mcp"
    }
  }
}
```

### For Local Development

```bash
git clone https://github.com/getlokiui/components-build-mcp.git
cd components-build-mcp
npm install
npm run build
```

Add to Claude config with full path:

```json
{
  "mcpServers": {
    "components-build": {
      "command": "node",
      "args": ["/path/to/components-build-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

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

## Usage Examples

Once configured, ask your AI assistant:

```
"Show me the components.build spec section on accessibility"

"Grade this component against the spec:
export const Button = ({ children }) => <button>{children}</button>"

"Generate a Card component with composable sub-components"

"Search the spec for keyboard navigation patterns"

"What rules does the grader check for?"
```

## Specification Sections

The complete components.build specification includes:

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

## Grading Rules

Components are graded on:

- **Types** - Extending HTML props, exporting types, spreading props correctly
- **Styling** - Using cn() utility, class order, design tokens
- **Accessibility** - ARIA attributes, keyboard navigation, semantic HTML
- **Composition** - Single element wrapping, composable patterns
- **State** - Supporting controlled and uncontrolled usage
- **Naming** - Following conventions (Root, Trigger, Content, etc.)

## HTTP API

A Vercel-compatible HTTP API is also available for non-MCP usage:

```bash
# Deploy to Vercel
cd components-build-mcp
vercel --prod
```

Endpoints:
- `GET /?action=rules` - Get all rules
- `POST /?action=grade` - Grade component code
- `POST /?action=generate` - Generate component
- `GET /?action=quick-reference` - Get cheat sheet

## Credits

This project implements the [components.build](https://components.build) specification.

The specification is:
- **Copyright 2023 Vercel, Inc.**
- **Co-authored by** [Hayden Bleasel](https://github.com/haydenbleasel) and [shadcn](https://github.com/shadcn)
- **Licensed under** Apache License 2.0

This MCP server is a community project by Audrey Klammer and is **not officially affiliated with or endorsed by Vercel, Inc.**

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read the components.build specification first to understand the patterns and rules.

## Links

- [components.build](https://components.build) - The specification
- [shadcn/ui](https://ui.shadcn.com) - Reference implementation
- [Radix UI](https://radix-ui.com) - Primitives library
- [getlokiui](https://github.com/getlokiui) - Component library built on this spec
