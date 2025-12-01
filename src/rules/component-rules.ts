/**
 * Component Rules Engine
 * Based on components.build specification by Hayden Bleasel and shadcn
 *
 * These rules are enforced, not just documented.
 *
 * IMPORTANT: The grading rules are FRAMEWORK-AGNOSTIC.
 * While examples use React/TypeScript, the core principles apply to:
 * - React, Vue, Svelte, Angular, Solid, etc.
 * - The rules check for patterns and best practices, not framework-specific syntax.
 *
 * Templates are currently React/TypeScript only.
 */

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: 'types' | 'styling' | 'accessibility' | 'composition' | 'state' | 'naming';
  severity: 'error' | 'warning' | 'info';
  weight: number;
  check: (code: string) => RuleViolation[];
  fix?: (code: string, violation: RuleViolation) => string;
  example: {
    bad: string;
    good: string;
  };
}

export interface RuleViolation {
  ruleId: string;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface GradeResult {
  score: number;
  grade: string;
  violations: RuleViolation[];
  passes: string[];
  summary: string;
}

// Helper to find line number of a match
function findLineNumber(code: string, match: string): number | undefined {
  const index = code.indexOf(match);
  if (index === -1) return undefined;
  return code.substring(0, index).split('\n').length;
}

/**
 * All component rules from the components.build specification
 */
export const RULES: Rule[] = [
  // ============================================
  // TYPES RULES
  // ============================================
  {
    id: 'extends-html-props',
    name: 'Extend HTML Props',
    description: 'Components must extend native HTML attributes using React.ComponentProps',
    category: 'types',
    severity: 'error',
    weight: 15,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if there's a type definition
      const hasTypeDefinition = /type\s+\w+Props\s*=/.test(code) || /interface\s+\w+Props/.test(code);

      if (hasTypeDefinition) {
        // Check if it extends React.ComponentProps or ComponentProps
        const extendsComponentProps = /React\.ComponentProps<['"`]\w+['"`]>/.test(code) ||
                                       /ComponentProps<['"`]\w+['"`]>/.test(code);

        if (!extendsComponentProps) {
          violations.push({
            ruleId: 'extends-html-props',
            message: 'Component props should extend React.ComponentProps<"element">',
            suggestion: 'Add React.ComponentProps<"div"> or appropriate element type'
          });
        }
      }

      return violations;
    },
    example: {
      bad: `type ButtonProps = {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
};`,
      good: `type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};`
    }
  },

  {
    id: 'exports-types',
    name: 'Export Types',
    description: 'Component prop types must be exported',
    category: 'types',
    severity: 'error',
    weight: 10,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Find all Props type definitions
      const propsMatch = code.match(/(?:type|interface)\s+(\w+Props)/g);

      if (propsMatch) {
        for (const match of propsMatch) {
          const typeName = match.replace(/(?:type|interface)\s+/, '');
          // Check if it's exported
          const isExported = new RegExp(`export\\s+(?:type|interface)\\s+${typeName}`).test(code);

          if (!isExported) {
            violations.push({
              ruleId: 'exports-types',
              message: `Type "${typeName}" should be exported`,
              suggestion: `Add "export" before the type definition`
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `type ButtonProps = React.ComponentProps<'button'>;`,
      good: `export type ButtonProps = React.ComponentProps<'button'>;`
    }
  },

  {
    id: 'props-spread-last',
    name: 'Props Spread Last',
    description: 'Spread props (...props) must come last on the element to allow user overrides',
    category: 'types',
    severity: 'error',
    weight: 10,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Find JSX elements with spread props
      const jsxWithSpread = code.match(/<\w+[^>]*\{\.\.\.props\}[^>]*>/g);

      if (jsxWithSpread) {
        for (const jsx of jsxWithSpread) {
          // Check if there are props AFTER the spread
          const afterSpread = jsx.split('{...props}')[1];
          if (afterSpread && /\w+=/.test(afterSpread)) {
            violations.push({
              ruleId: 'props-spread-last',
              message: 'Props are defined after {...props}, which prevents user overrides',
              line: findLineNumber(code, jsx),
              suggestion: 'Move {...props} to the end of the element'
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `<div {...props} className="default-class" />`,
      good: `<div className="default-class" {...props} />`
    }
  },

  {
    id: 'single-element-wrap',
    name: 'Single Element Wrapping',
    description: 'Each component should wrap a single HTML/JSX element for maximum composability',
    category: 'composition',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // This is a heuristic - check for multiple root elements in return
      const returnMatch = code.match(/return\s*\(\s*(<[\s\S]*?>[\s\S]*?<\/[\s\S]*?>)\s*\)/);

      if (returnMatch) {
        const jsx = returnMatch[1];
        // Count top-level elements (simplified check)
        const fragmentWrapper = /<>|<React\.Fragment>|<Fragment>/.test(jsx);
        if (fragmentWrapper) {
          violations.push({
            ruleId: 'single-element-wrap',
            message: 'Component returns a fragment with multiple elements. Consider breaking into sub-components.',
            suggestion: 'Use composable sub-components (Root, Header, Content, etc.)'
          });
        }
      }

      return violations;
    },
    example: {
      bad: `return (
  <>
    <div className="header">{title}</div>
    <div className="content">{content}</div>
  </>
);`,
      good: `// CardHeader.tsx
return <div className="header" {...props} />;

// CardContent.tsx
return <div className="content" {...props} />;`
    }
  },

  // ============================================
  // STYLING RULES
  // ============================================
  {
    id: 'uses-cn-utility',
    name: 'Uses cn() Utility',
    description: 'Use the cn() utility for class merging (clsx + tailwind-merge)',
    category: 'styling',
    severity: 'warning',
    weight: 8,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if component has className but doesn't use cn()
      const hasClassName = /className=/.test(code);
      const usesCn = /cn\(/.test(code);
      const hasConditionalClasses = /className=\{.*\?.*:/.test(code) ||
                                     /className=\{`/.test(code);

      if (hasClassName && hasConditionalClasses && !usesCn) {
        violations.push({
          ruleId: 'uses-cn-utility',
          message: 'Use cn() utility for conditional class names instead of template literals or ternaries',
          suggestion: 'Import cn from @/lib/utils and use cn(baseClasses, conditionalClasses, className)'
        });
      }

      return violations;
    },
    example: {
      bad: `className={\`base-class \${isActive ? 'active' : ''}\`}`,
      good: `className={cn('base-class', isActive && 'active', className)}`
    }
  },

  {
    id: 'class-order',
    name: 'Class Order',
    description: 'Classes should be ordered: base, variants, conditionals, user overrides (className last)',
    category: 'styling',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if cn() is used and className is not last
      const cnCalls = code.match(/cn\([^)]+\)/g);

      if (cnCalls) {
        for (const call of cnCalls) {
          // className should be the last argument in cn()
          if (/cn\([^)]*className[^)]*,[^)]+\)/.test(call)) {
            violations.push({
              ruleId: 'class-order',
              message: 'className should be the last argument in cn() to allow user overrides',
              line: findLineNumber(code, call),
              suggestion: 'Move className to the end: cn(baseClasses, variants, conditionals, className)'
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `cn(className, 'base-styles', isActive && 'active')`,
      good: `cn('base-styles', isActive && 'active', className)`
    }
  },

  {
    id: 'uses-design-tokens',
    name: 'Uses Design Tokens',
    description: 'Use CSS variables/design tokens instead of hardcoded colors',
    category: 'styling',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for hardcoded color values in className
      const hardcodedColors = code.match(/(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d{2,3}/g);

      if (hardcodedColors && hardcodedColors.length > 3) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: 'Consider using semantic design tokens (primary, secondary, destructive) instead of hardcoded colors',
          suggestion: 'Use bg-primary, text-foreground, border-border, etc.'
        });
      }

      return violations;
    },
    example: {
      bad: `className="bg-blue-500 text-white"`,
      good: `className="bg-primary text-primary-foreground"`
    }
  },

  // ============================================
  // DATA ATTRIBUTES RULES
  // ============================================
  {
    id: 'has-data-slot',
    name: 'Has data-slot Attribute',
    description: 'Components should have a data-slot attribute for parent-aware styling',
    category: 'styling',
    severity: 'warning',
    weight: 8,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if this looks like a component (has export and returns JSX)
      const isComponent = /export\s+(?:const|function)/.test(code) && /<\w+/.test(code);
      const hasDataSlot = /data-slot=/.test(code);

      if (isComponent && !hasDataSlot) {
        violations.push({
          ruleId: 'has-data-slot',
          message: 'Component should have a data-slot attribute for identification',
          suggestion: 'Add data-slot="component-name" to the root element'
        });
      }

      return violations;
    },
    example: {
      bad: `<div className="card" {...props} />`,
      good: `<div data-slot="card" className="card" {...props} />`
    }
  },

  {
    id: 'uses-data-state',
    name: 'Uses data-state for Visual States',
    description: 'Use data-state attribute to expose component state for styling',
    category: 'styling',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if component has state that should be exposed
      const hasOpenState = /isOpen|open|setOpen/.test(code);
      const hasActiveState = /isActive|active|setActive/.test(code);
      const hasDataState = /data-state=/.test(code);

      if ((hasOpenState || hasActiveState) && !hasDataState) {
        violations.push({
          ruleId: 'uses-data-state',
          message: 'Component has state that could be exposed via data-state attribute',
          suggestion: 'Add data-state={isOpen ? "open" : "closed"} for styling hooks'
        });
      }

      return violations;
    },
    example: {
      bad: `<div className={isOpen ? 'opacity-100' : 'opacity-0'} />`,
      good: `<div data-state={isOpen ? 'open' : 'closed'} className="data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />`
    }
  },

  // ============================================
  // ACCESSIBILITY RULES
  // ============================================
  {
    id: 'button-has-type',
    name: 'Button Has Type',
    description: 'Button elements must have an explicit type attribute',
    category: 'accessibility',
    severity: 'error',
    weight: 10,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Find button elements without type
      const buttonMatches = code.match(/<button[^>]*>/g);

      if (buttonMatches) {
        for (const match of buttonMatches) {
          if (!/type=/.test(match)) {
            violations.push({
              ruleId: 'button-has-type',
              message: 'Button element missing type attribute',
              line: findLineNumber(code, match),
              suggestion: 'Add type="button" or type="submit"'
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `<button onClick={handleClick}>Click me</button>`,
      good: `<button type="button" onClick={handleClick}>Click me</button>`
    }
  },

  {
    id: 'interactive-has-keyboard',
    name: 'Interactive Elements Have Keyboard Support',
    description: 'Interactive non-button elements must have keyboard event handlers',
    category: 'accessibility',
    severity: 'error',
    weight: 12,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Find div/span with onClick but no onKeyDown/onKeyUp
      const interactiveMatches = code.match(/<(?:div|span)[^>]*onClick[^>]*>/g);

      if (interactiveMatches) {
        for (const match of interactiveMatches) {
          const hasKeyHandler = /onKey(?:Down|Up|Press)/.test(match);
          const hasRole = /role=/.test(match);

          if (!hasKeyHandler) {
            violations.push({
              ruleId: 'interactive-has-keyboard',
              message: 'Interactive element with onClick needs keyboard handler',
              line: findLineNumber(code, match),
              suggestion: 'Add onKeyDown handler for Enter/Space activation, or use a <button>'
            });
          }

          if (!hasRole) {
            violations.push({
              ruleId: 'interactive-has-keyboard',
              message: 'Interactive element needs role="button"',
              line: findLineNumber(code, match),
              suggestion: 'Add role="button" and tabIndex={0}'
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `<div onClick={handleClick}>Click me</div>`,
      good: `<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>Click me</div>`
    }
  },

  {
    id: 'icon-button-has-label',
    name: 'Icon Buttons Have Labels',
    description: 'Icon-only buttons must have aria-label or visually hidden text',
    category: 'accessibility',
    severity: 'error',
    weight: 12,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for buttons that only contain icons (simplified heuristic)
      const iconButtonPattern = /<button[^>]*>\s*<(?:svg|Icon|\w+Icon)[^>]*\/>\s*<\/button>/g;
      const matches = code.match(iconButtonPattern);

      if (matches) {
        for (const match of matches) {
          const hasAriaLabel = /aria-label=/.test(match);
          const hasSrOnly = /sr-only|visually-hidden/.test(match);

          if (!hasAriaLabel && !hasSrOnly) {
            violations.push({
              ruleId: 'icon-button-has-label',
              message: 'Icon-only button needs aria-label for screen readers',
              line: findLineNumber(code, match),
              suggestion: 'Add aria-label="Description" to the button'
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `<button><TrashIcon /></button>`,
      good: `<button aria-label="Delete item"><TrashIcon aria-hidden="true" /></button>`
    }
  },

  {
    id: 'uses-semantic-html',
    name: 'Uses Semantic HTML',
    description: 'Use semantic HTML elements instead of divs with roles',
    category: 'accessibility',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for div with button role (should be button)
      if (/<div[^>]*role=["']button["']/.test(code)) {
        violations.push({
          ruleId: 'uses-semantic-html',
          message: 'Use <button> instead of <div role="button">',
          suggestion: 'Replace with semantic <button> element'
        });
      }

      // Check for div with nav role (should be nav)
      if (/<div[^>]*role=["']navigation["']/.test(code)) {
        violations.push({
          ruleId: 'uses-semantic-html',
          message: 'Use <nav> instead of <div role="navigation">',
          suggestion: 'Replace with semantic <nav> element'
        });
      }

      return violations;
    },
    example: {
      bad: `<div role="button" onClick={handleClick}>Click</div>`,
      good: `<button onClick={handleClick}>Click</button>`
    }
  },

  {
    id: 'aria-expanded-with-controls',
    name: 'aria-expanded Has aria-controls',
    description: 'Elements with aria-expanded should have aria-controls pointing to the controlled element',
    category: 'accessibility',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Find elements with aria-expanded
      const expandedMatches = code.match(/<\w+[^>]*aria-expanded[^>]*>/g);

      if (expandedMatches) {
        for (const match of expandedMatches) {
          if (!/aria-controls=/.test(match)) {
            violations.push({
              ruleId: 'aria-expanded-with-controls',
              message: 'Element with aria-expanded should have aria-controls',
              line: findLineNumber(code, match),
              suggestion: 'Add aria-controls="content-id" pointing to the expandable content'
            });
          }
        }
      }

      return violations;
    },
    example: {
      bad: `<button aria-expanded={isOpen}>Toggle</button>`,
      good: `<button aria-expanded={isOpen} aria-controls="panel-1">Toggle</button>
<div id="panel-1">{content}</div>`
    }
  },

  // ============================================
  // STATE RULES
  // ============================================
  {
    id: 'supports-controlled-uncontrolled',
    name: 'Supports Controlled and Uncontrolled',
    description: 'Stateful components should support both controlled and uncontrolled usage',
    category: 'state',
    severity: 'info',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if component has useState but no controlled props
      const hasUseState = /useState/.test(code);
      const hasValueProp = /value.*:/.test(code) || /\bvalue\b/.test(code);
      const hasDefaultValueProp = /defaultValue/.test(code);
      const hasOnChangeProp = /onValueChange|onChange/.test(code);

      if (hasUseState && !hasDefaultValueProp && !hasOnChangeProp) {
        violations.push({
          ruleId: 'supports-controlled-uncontrolled',
          message: 'Stateful component should support controlled usage',
          suggestion: 'Add value, defaultValue, and onValueChange props. Consider using useControllableState.'
        });
      }

      return violations;
    },
    example: {
      bad: `const Stepper = () => {
  const [value, setValue] = useState(0);
  return <div>{value}</div>;
};`,
      good: `const Stepper = ({ value: controlledValue, defaultValue, onValueChange }) => {
  const [value, setValue] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  return <div>{value}</div>;
};`
    }
  },

  // ============================================
  // NAMING RULES
  // ============================================
  {
    id: 'composable-naming',
    name: 'Composable Naming Convention',
    description: 'Sub-components should follow naming conventions: Root, Trigger, Content, Header, Footer, Title, Description',
    category: 'naming',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if file exports multiple components (compound component pattern)
      const exports = code.match(/export\s+(?:const|function)\s+(\w+)/g);

      if (exports && exports.length > 1) {
        const validNames = ['Root', 'Item', 'Trigger', 'Content', 'Header', 'Body', 'Footer', 'Title', 'Description', 'Close', 'Overlay', 'Portal'];

        for (const exp of exports) {
          const name = exp.replace(/export\s+(?:const|function)\s+/, '');
          const hasValidSuffix = validNames.some(valid => name.endsWith(valid) || name === valid);

          if (!hasValidSuffix && name !== 'default') {
            // This is informational, not an error
          }
        }
      }

      return violations;
    },
    example: {
      bad: `export const AccordionContainer = ...
export const AccordionButton = ...
export const AccordionPanel = ...`,
      good: `export const Root = ...
export const Trigger = ...
export const Content = ...`
    }
  },

  {
    id: 'data-slot-naming',
    name: 'data-slot Naming Convention',
    description: 'data-slot values should use kebab-case and be descriptive',
    category: 'naming',
    severity: 'info',
    weight: 2,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Find data-slot values
      const dataSlotMatches = code.match(/data-slot=["']([^"']+)["']/g);

      if (dataSlotMatches) {
        for (const match of dataSlotMatches) {
          const value = match.match(/data-slot=["']([^"']+)["']/)?.[1];

          if (value) {
            // Check for camelCase (should be kebab-case)
            if (/[a-z][A-Z]/.test(value)) {
              violations.push({
                ruleId: 'data-slot-naming',
                message: `data-slot value "${value}" should use kebab-case`,
                suggestion: `Change to "${value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}"`
              });
            }
          }
        }
      }

      return violations;
    },
    example: {
      bad: `data-slot="cardHeader"`,
      good: `data-slot="card-header"`
    }
  },

  // ============================================
  // POLYMORPHISM RULES
  // ============================================
  {
    id: 'supports-as-prop',
    name: 'Supports as/asChild Prop',
    description: 'Components that render interactive elements should support polymorphism via as or asChild prop',
    category: 'composition',
    severity: 'info',
    weight: 3,
    check: (code) => {
      // This is informational - not checking automatically
      return [];
    },
    example: {
      bad: `// Only renders as button
<Button>Click</Button>`,
      good: `// Can render as link
<Button asChild>
  <a href="/home">Click</a>
</Button>`
    }
  }
];

/**
 * Grade a component against all rules
 */
export function gradeComponent(code: string): GradeResult {
  const violations: RuleViolation[] = [];
  const passes: string[] = [];
  let totalWeight = 0;
  let lostPoints = 0;

  for (const rule of RULES) {
    totalWeight += rule.weight;
    const ruleViolations = rule.check(code);

    if (ruleViolations.length === 0) {
      passes.push(rule.id);
    } else {
      violations.push(...ruleViolations);
      lostPoints += rule.weight;
    }
  }

  const score = Math.max(0, Math.round(((totalWeight - lostPoints) / totalWeight) * 100));

  let grade: string;
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 85) grade = 'B+';
  else if (score >= 80) grade = 'B';
  else if (score >= 75) grade = 'C+';
  else if (score >= 70) grade = 'C';
  else if (score >= 65) grade = 'D+';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  const errorCount = violations.filter(v =>
    RULES.find(r => r.id === v.ruleId)?.severity === 'error'
  ).length;

  const warningCount = violations.filter(v =>
    RULES.find(r => r.id === v.ruleId)?.severity === 'warning'
  ).length;

  const summary = `Score: ${score}/100 (${grade}) | ${passes.length} passed | ${errorCount} errors | ${warningCount} warnings`;

  return {
    score,
    grade,
    violations,
    passes,
    summary
  };
}

/**
 * Get all rules with full documentation
 */
export function getAllRules(): Rule[] {
  return RULES;
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category: Rule['category']): Rule[] {
  return RULES.filter(r => r.category === category);
}

/**
 * Get a specific rule by ID
 */
export function getRule(id: string): Rule | undefined {
  return RULES.find(r => r.id === id);
}

/**
 * Get the full rules documentation as markdown
 */
export function getRulesMarkdown(): string {
  let md = `# Component Rules Reference

> Based on components.build specification by Hayden Bleasel and shadcn.

---

`;

  const categories = [...new Set(RULES.map(r => r.category))];

  for (const category of categories) {
    const categoryRules = RULES.filter(r => r.category === category);
    md += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Rules\n\n`;

    for (const rule of categoryRules) {
      md += `### ${rule.name}\n`;
      md += `**ID:** \`${rule.id}\` | **Severity:** ${rule.severity} | **Weight:** ${rule.weight}\n\n`;
      md += `${rule.description}\n\n`;
      md += `**Bad:**\n\`\`\`tsx\n${rule.example.bad}\n\`\`\`\n\n`;
      md += `**Good:**\n\`\`\`tsx\n${rule.example.good}\n\`\`\`\n\n`;
      md += `---\n\n`;
    }
  }

  return md;
}
