/**
 * MCP Tools for Component Rules
 * These tools are available to any AI using this MCP server
 */

import {
  gradeComponent,
  getAllRules,
  getRulesByCategory,
  getRule,
  getRulesMarkdown,
  type Rule,
  type GradeResult,
  type RuleViolation,
} from '../rules/component-rules.js';

import {
  generateBasicComponent,
  generateComposableComponent,
  generateButtonComponent,
  generateCardComponent,
  generateInputComponent,
  type TemplateOptions,
} from '../rules/templates.js';

import {
  SPECIFICATION,
  getFullSpecification,
  getSection,
  getSectionNames,
  searchSpecification,
} from '../docs/full-specification.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Get all available tool definitions
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: 'get_rules',
      description: 'Get component rules documentation. Use this to understand what rules exist and how to follow them. Can filter by category.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter rules by category',
            enum: ['types', 'styling', 'accessibility', 'composition', 'state', 'naming', 'all'],
          },
          format: {
            type: 'string',
            description: 'Output format',
            enum: ['markdown', 'json', 'summary'],
          },
        },
      },
    },
    {
      name: 'get_rule',
      description: 'Get details about a specific rule by ID',
      inputSchema: {
        type: 'object',
        properties: {
          ruleId: {
            type: 'string',
            description: 'The rule ID (e.g., "extends-html-props", "has-data-slot")',
          },
        },
        required: ['ruleId'],
      },
    },
    {
      name: 'grade_component',
      description: 'Grade a component against all rules. Returns a score, grade, violations, and suggestions for fixes.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The component source code to grade',
          },
          verbose: {
            type: 'boolean',
            description: 'Include detailed violation information',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'generate_component',
      description: 'Generate a new component that follows all rules. Choose a template type or customize.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Component name (e.g., "Button", "Card", "Dialog")',
          },
          template: {
            type: 'string',
            description: 'Template type to use',
            enum: ['basic', 'composable', 'button', 'card', 'input'],
          },
          element: {
            type: 'string',
            description: 'HTML element to wrap (for basic template)',
          },
          hasVariants: {
            type: 'boolean',
            description: 'Include CVA variants (for basic template)',
          },
          variants: {
            type: 'array',
            items: { type: 'string' },
            description: 'Variant names (e.g., ["default", "secondary", "destructive"])',
          },
          sizes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Size names (e.g., ["sm", "md", "lg"])',
          },
        },
        required: ['name', 'template'],
      },
    },
    {
      name: 'check_compliance',
      description: 'Quick check if component code is compliant (score >= 80)',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The component source code to check',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'list_rules',
      description: 'List all available rules with their IDs, names, and categories',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_template',
      description: 'Get a component template for reference',
      inputSchema: {
        type: 'object',
        properties: {
          template: {
            type: 'string',
            description: 'Template name',
            enum: ['button', 'card', 'input', 'basic', 'composable'],
          },
        },
        required: ['template'],
      },
    },
    {
      name: 'get_quick_reference',
      description: 'Get a quick reference cheat sheet for component development',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_specification',
      description: 'Get the FULL components.build specification documentation. This is the complete guide to building modern UI components by Hayden Bleasel and shadcn. Use this to understand the complete philosophy, patterns, and best practices.',
      inputSchema: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            description: 'Specific section to retrieve (optional). Available sections: overview, definitions, principles, composition, accessibility, designTokens, state, styling, types, polymorphism, asChild, dataAttributes, docs, registry, marketplaces, npm',
          },
        },
      },
    },
    {
      name: 'search_specification',
      description: 'Search the components.build specification for a specific term or concept. Returns matching sections and context.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The term or concept to search for (e.g., "aria", "keyboard", "CVA", "asChild")',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'list_specification_sections',
      description: 'List all available sections in the components.build specification',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

/**
 * Execute a tool by name
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_rules':
        return handleGetRules(args);
      case 'get_rule':
        return handleGetRule(args);
      case 'grade_component':
        return handleGradeComponent(args);
      case 'generate_component':
        return handleGenerateComponent(args);
      case 'check_compliance':
        return handleCheckCompliance(args);
      case 'list_rules':
        return handleListRules();
      case 'get_template':
        return handleGetTemplate(args);
      case 'get_quick_reference':
        return handleGetQuickReference();
      case 'get_specification':
        return handleGetSpecification(args);
      case 'search_specification':
        return handleSearchSpecification(args);
      case 'list_specification_sections':
        return handleListSpecificationSections();
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

function handleGetRules(args: Record<string, unknown>): ToolResult {
  const category = args.category as string | undefined;
  const format = (args.format as string) || 'markdown';

  let rules: Rule[];
  if (category && category !== 'all') {
    rules = getRulesByCategory(category as Rule['category']);
  } else {
    rules = getAllRules();
  }

  let text: string;

  if (format === 'json') {
    text = JSON.stringify(rules, null, 2);
  } else if (format === 'summary') {
    text = rules
      .map((r) => `- **${r.name}** (\`${r.id}\`): ${r.description}`)
      .join('\n');
  } else {
    text = getRulesMarkdown();
  }

  return {
    content: [{ type: 'text', text }],
  };
}

function handleGetRule(args: Record<string, unknown>): ToolResult {
  const ruleId = args.ruleId as string;
  const rule = getRule(ruleId);

  if (!rule) {
    return {
      content: [
        {
          type: 'text',
          text: `Rule not found: ${ruleId}\n\nAvailable rules:\n${getAllRules()
            .map((r) => `- ${r.id}`)
            .join('\n')}`,
        },
      ],
      isError: true,
    };
  }

  const text = `# ${rule.name}

**ID:** \`${rule.id}\`
**Category:** ${rule.category}
**Severity:** ${rule.severity}
**Weight:** ${rule.weight}

## Description
${rule.description}

## Bad Example
\`\`\`tsx
${rule.example.bad}
\`\`\`

## Good Example
\`\`\`tsx
${rule.example.good}
\`\`\`
`;

  return {
    content: [{ type: 'text', text }],
  };
}

function handleGradeComponent(args: Record<string, unknown>): ToolResult {
  const code = args.code as string;
  const verbose = args.verbose as boolean;

  const result = gradeComponent(code);

  let text = `# Component Grade: ${result.grade} (${result.score}/100)

${result.summary}

`;

  if (result.violations.length > 0) {
    text += `## Violations (${result.violations.length})

`;
    for (const v of result.violations) {
      const rule = getRule(v.ruleId);
      text += `### ❌ ${rule?.name || v.ruleId}
- **Message:** ${v.message}
${v.line ? `- **Line:** ${v.line}` : ''}
${v.suggestion ? `- **Suggestion:** ${v.suggestion}` : ''}

`;
      if (verbose && rule) {
        text += `**Good example:**
\`\`\`tsx
${rule.example.good}
\`\`\`

`;
      }
    }
  }

  if (result.passes.length > 0) {
    text += `## Passed Rules (${result.passes.length})

${result.passes.map((p) => `✅ ${p}`).join('\n')}
`;
  }

  return {
    content: [{ type: 'text', text }],
  };
}

function handleGenerateComponent(args: Record<string, unknown>): ToolResult {
  const name = args.name as string;
  const template = args.template as string;
  const element = (args.element as string) || 'div';
  const hasVariants = args.hasVariants as boolean;
  const variants = args.variants as string[] | undefined;
  const sizes = args.sizes as string[] | undefined;

  let code: string;

  switch (template) {
    case 'button':
      code = generateButtonComponent();
      break;
    case 'card':
      code = generateCardComponent();
      break;
    case 'input':
      code = generateInputComponent();
      break;
    case 'composable':
      code = generateComposableComponent({ name });
      break;
    case 'basic':
    default:
      code = generateBasicComponent({
        name,
        element,
        hasVariants,
        variants,
        sizes,
      });
      break;
  }

  // Grade the generated component to prove it's compliant
  const grade = gradeComponent(code);

  const text = `# Generated Component: ${name}

**Template:** ${template}
**Compliance Score:** ${grade.score}/100 (${grade.grade})

\`\`\`tsx
${code}
\`\`\`

## Compliance Report
${grade.passes.map((p) => `✅ ${p}`).join('\n')}
`;

  return {
    content: [{ type: 'text', text }],
  };
}

function handleCheckCompliance(args: Record<string, unknown>): ToolResult {
  const code = args.code as string;
  const result = gradeComponent(code);

  const isCompliant = result.score >= 80;
  const status = isCompliant ? '✅ COMPLIANT' : '❌ NOT COMPLIANT';

  const text = `# ${status}

**Score:** ${result.score}/100 (${result.grade})
**Threshold:** 80/100

${
  result.violations.length > 0
    ? `## Issues to Fix (${result.violations.length})
${result.violations.map((v) => `- ${v.message}${v.suggestion ? ` → ${v.suggestion}` : ''}`).join('\n')}`
    : '## All checks passed!'
}
`;

  return {
    content: [{ type: 'text', text }],
  };
}

function handleListRules(): ToolResult {
  const rules = getAllRules();

  const byCategory: Record<string, Rule[]> = {};
  for (const rule of rules) {
    if (!byCategory[rule.category]) {
      byCategory[rule.category] = [];
    }
    byCategory[rule.category].push(rule);
  }

  let text = '# Available Rules\n\n';

  for (const [category, categoryRules] of Object.entries(byCategory)) {
    text += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    for (const rule of categoryRules) {
      const severityEmoji =
        rule.severity === 'error' ? '🔴' : rule.severity === 'warning' ? '🟡' : '🔵';
      text += `- ${severityEmoji} \`${rule.id}\` - ${rule.name} (weight: ${rule.weight})\n`;
    }
    text += '\n';
  }

  return {
    content: [{ type: 'text', text }],
  };
}

function handleGetTemplate(args: Record<string, unknown>): ToolResult {
  const template = args.template as string;

  let code: string;
  let description: string;

  switch (template) {
    case 'button':
      code = generateButtonComponent();
      description = 'A fully accessible button component with variants, sizes, and asChild support.';
      break;
    case 'card':
      code = generateCardComponent();
      description = 'A composable card component with Header, Title, Description, Content, and Footer sub-components.';
      break;
    case 'input':
      code = generateInputComponent();
      description = 'An accessible input component with proper focus states and styling.';
      break;
    case 'composable':
      code = generateComposableComponent({ name: 'Example' });
      description = 'A composable component template with Root, Trigger, and Content pattern using Context.';
      break;
    case 'basic':
    default:
      code = generateBasicComponent({ name: 'Example', hasVariants: true });
      description = 'A basic component template with CVA variants.';
      break;
  }

  const text = `# Template: ${template}

${description}

\`\`\`tsx
${code}
\`\`\`
`;

  return {
    content: [{ type: 'text', text }],
  };
}

function handleGetQuickReference(): ToolResult {
  const text = `# Component Rules Quick Reference

## Component Structure
\`\`\`tsx
export type ComponentProps = React.ComponentProps<'element'> & {
  variant?: 'default' | 'secondary';
};

export const Component = ({ className, variant, ...props }: ComponentProps) => (
  <element
    data-slot="component-name"
    data-state={state}
    className={cn(variants({ variant }), className)}
    {...props}
  />
);
\`\`\`

## Naming Conventions
| Sub-Component | Use For |
|---------------|---------|
| Root | Main container with context |
| Trigger | Opens/toggles something |
| Content | Main content area |
| Item | Individual item wrapper |
| Header/Footer | Top/bottom sections |
| Title/Description | Text elements |

## Class Order (IMPORTANT)
\`\`\`tsx
className={cn(
  'base-styles',           // 1. Base
  variantStyles,           // 2. Variants
  isActive && 'active',    // 3. Conditionals
  className                // 4. User overrides LAST
)}
\`\`\`

## Data Attributes
- \`data-slot="button"\` - Component identification
- \`data-state="open"\` - Visual state
- \`data-variant={variant}\` - Current variant

## Accessibility Must-Haves
- Button type: \`<button type="button">\`
- Icon buttons: \`aria-label="Description"\`
- Expandable: \`aria-expanded={isOpen} aria-controls="id"\`
- Interactive divs: \`role="button" tabIndex={0} onKeyDown\`

## Pre-Ship Checklist
- [ ] Extends React.ComponentProps
- [ ] Exports types
- [ ] {...props} spread LAST
- [ ] Uses cn() utility
- [ ] Has data-slot
- [ ] Keyboard accessible
- [ ] ARIA attributes
- [ ] Design tokens (no hardcoded colors)
`;

  return {
    content: [{ type: 'text', text }],
  };
}

function handleGetSpecification(args: Record<string, unknown>): ToolResult {
  const section = args.section as string | undefined;

  if (section) {
    const content = getSection(section);
    if (!content) {
      return {
        content: [
          {
            type: 'text',
            text: `Section not found: ${section}\n\nAvailable sections:\n${getSectionNames()
              .map((s) => `- ${s}`)
              .join('\n')}`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text', text: content }],
    };
  }

  // Return the full specification
  return {
    content: [{ type: 'text', text: getFullSpecification() }],
  };
}

function handleSearchSpecification(args: Record<string, unknown>): ToolResult {
  const query = args.query as string;

  if (!query) {
    return {
      content: [{ type: 'text', text: 'Please provide a search query.' }],
      isError: true,
    };
  }

  const results = searchSpecification(query);

  if (results.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No results found for "${query}". Try a different search term.`,
        },
      ],
    };
  }

  let text = `# Search Results for "${query}"\n\n`;
  text += `Found matches in ${results.length} section(s):\n\n`;

  for (const result of results) {
    text += `## ${result.section}\n\n`;
    for (const match of result.matches) {
      text += `> ${match}\n\n`;
    }
  }

  text += `\n---\n\nUse \`get_specification\` with the section name to get the full content.`;

  return {
    content: [{ type: 'text', text }],
  };
}

function handleListSpecificationSections(): ToolResult {
  const sections = getSectionNames();

  const sectionDescriptions: Record<string, string> = {
    overview: 'Introduction to components.build and who it\'s for',
    definitions: 'Terminology: Primitive, Component, Pattern, Block, Page, Template, Utility',
    principles: 'Core principles: Composability, Accessibility, Customization, Performance',
    composition: 'How to make components composable with Root/Trigger/Content pattern',
    accessibility: 'Complete a11y guide: ARIA, keyboard navigation, focus management',
    designTokens: 'CSS variables and semantic color system',
    state: 'Controlled vs uncontrolled state, useControllableState',
    styling: 'cn() utility, tailwind-merge, CVA for variants',
    types: 'TypeScript patterns: extending HTML props, exporting types',
    polymorphism: 'The "as" prop pattern for changing rendered elements',
    asChild: 'The asChild pattern with Radix Slot for composition',
    dataAttributes: 'data-state and data-slot patterns',
    docs: 'How to document your components',
    registry: 'Component registries and shadcn CLI distribution',
    marketplaces: 'Publishing to component marketplaces like 21st.dev',
    npm: 'Traditional npm package distribution',
  };

  let text = `# components.build Specification Sections

**Authors:** ${SPECIFICATION.authors.join(', ')}

${SPECIFICATION.description}

## Available Sections

`;

  for (const section of sections) {
    const desc = sectionDescriptions[section] || 'Documentation section';
    text += `### ${section}\n${desc}\n\n`;
  }

  text += `\n---\n\nUse \`get_specification\` with a section name to read the full content.
Use \`get_specification\` without a section to get the ENTIRE specification.`;

  return {
    content: [{ type: 'text', text }],
  };
}
