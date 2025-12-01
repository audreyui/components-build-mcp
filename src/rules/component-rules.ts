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

      // Remove import statements to avoid matching imported types like `type VariantProps`
      const codeWithoutImports = code.replace(/^import\s+.*$/gm, '');

      // Find all Props type definitions (only in actual type/interface declarations, not imports)
      const propsMatch = codeWithoutImports.match(/(?:type|interface)\s+(\w+Props)/g);

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

      // Match cn() calls, handling nested parentheses for variant functions
      const cnCallRegex = /cn\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
      let match;

      while ((match = cnCallRegex.exec(code)) !== null) {
        const args = match[1];

        // Check 1: className should be last
        // className followed by a comma means something comes after it
        if (/className\s*,/.test(args)) {
          violations.push({
            ruleId: 'class-order',
            message: 'className should be the last argument in cn() to allow user overrides',
            line: findLineNumber(code, match[0]),
            suggestion: 'Move className to the end: cn(baseClasses, variants, conditionals, className)'
          });
        }

        // Check 2: Base styles (string literals) should come first
        // If we see a conditional (&&) or variable before a string literal, flag it
        const firstArg = args.split(',')[0]?.trim();
        if (firstArg && /^[a-zA-Z]/.test(firstArg) && !firstArg.startsWith("'") && !firstArg.startsWith('"')) {
          // First arg is a variable/conditional, not a string literal
          // Check if there are string literals later
          const hasLaterStringLiteral = /,\s*['"][^'"]+['"]/.test(args);
          if (hasLaterStringLiteral) {
            violations.push({
              ruleId: 'class-order',
              message: 'Base styles (string literals) should come before variables and conditionals',
              line: findLineNumber(code, match[0]),
              suggestion: 'Order: cn("base-styles", variantStyles, conditional && "active", className)'
            });
          }
        }

        // Check 3: CVA variants function should come before conditionals
        // Look for pattern: conditional && before variantFunction(
        if (/\w+\s*&&\s*['"][^'"]*['"].*\w+Variants?\(/.test(args)) {
          violations.push({
            ruleId: 'class-order',
            message: 'Variant styles should come before conditional styles',
            line: findLineNumber(code, match[0]),
            suggestion: 'Order: cn("base", variants({ size }), isActive && "active", className)'
          });
        }
      }

      return violations;
    },
    example: {
      bad: `cn(className, 'base-styles', isActive && 'active')
cn(isActive && 'active', 'base-styles')`,
      good: `cn(
  'base-styles',            // 1. Base (always applied)
  variants({ size }),       // 2. Variants (based on props)
  isActive && 'active',     // 3. Conditionals (based on state)
  className                 // 4. User overrides (last!)
)`
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

      // Check for Tailwind arbitrary hex values: bg-[#5B9BD5], text-[#2B5BA8], from-[#hex], etc.
      const arbitraryHexColors = code.match(/(?:bg|text|border|fill|stroke|from|to|via|ring|outline|shadow|accent|caret|decoration)-\[#[0-9A-Fa-f]{3,8}(?:\/\d+)?\]/g);

      if (arbitraryHexColors && arbitraryHexColors.length > 0) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: `Found ${arbitraryHexColors.length} hardcoded hex color(s) in Tailwind arbitrary values: ${arbitraryHexColors.slice(0, 3).join(', ')}`,
          suggestion: `Use CSS variables instead: bg-[var(--custom-color)] or define semantic tokens.

Bad:  bg-[#5B9BD5] text-[#2B5BA8] dark:bg-[#5B9BD5]/10
Good: bg-primary text-primary-foreground (with CSS vars handling dark mode)`,
          line: findLineNumber(code, arbitraryHexColors[0])
        });
      }

      // Check for manual dark mode color overrides (sign of missing design tokens)
      const darkModeColorOverrides = code.match(/dark:(?:bg|text|border|fill|stroke|from|to|via|ring|outline|shadow|accent|caret|decoration)-\[#[0-9A-Fa-f]{3,8}/g);

      if (darkModeColorOverrides && darkModeColorOverrides.length > 0) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: `Found ${darkModeColorOverrides.length} manual dark mode color overrides - this should be handled by CSS variables`,
          suggestion: `Instead of: bg-[#5B9BD5] dark:bg-[#7BA3D9]
Use: bg-[var(--brand-color)] where --brand-color changes in .dark`
        });
      }

      // Check for hardcoded color values in className (Tailwind palette colors)
      const hardcodedTailwindColors = code.match(/(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d{2,3}/g);

      if (hardcodedTailwindColors && hardcodedTailwindColors.length > 3) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: 'Consider using semantic design tokens (primary, secondary, destructive) instead of hardcoded Tailwind colors',
          suggestion: 'Use bg-primary, text-foreground, border-border, etc.'
        });
      }

      // Check for hardcoded hex colors in style objects or JSX
      // Matches: color: "#8B5CF6", background: '#fff', etc.
      const hexInStyles = code.match(/(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*["']#[0-9A-Fa-f]{3,8}["']/g);

      if (hexInStyles && hexInStyles.length > 0) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: `Found ${hexInStyles.length} hardcoded hex color(s) in style objects`,
          suggestion: 'Use CSS variables: style={{ color: "var(--primary)" }} or define as CSS custom properties',
          line: findLineNumber(code, hexInStyles[0])
        });
      }

      // Check for hex values assigned to variables (config objects)
      // Matches: primary: "#8B5CF6", color: '#fff', etc.
      const hexInConfig = code.match(/\w+\s*:\s*["']#[0-9A-Fa-f]{3,8}["']/g);

      // Filter out CSS variable definitions which are fine
      const nonCssVarHex = hexInConfig?.filter(match => !match.includes('--'));

      if (nonCssVarHex && nonCssVarHex.length > 3) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: `Found ${nonCssVarHex.length} hardcoded hex colors in config/variables`,
          suggestion: 'Define colors as CSS variables: "--palette-primary": "#8B5CF6" then use var(--palette-primary)'
        });
      }

      // Check for rgb/rgba/hsl/hsla hardcoded values
      const hardcodedRgbHsl = code.match(/(?:rgb|rgba|hsl|hsla)\s*\([^)]+\)/g);

      if (hardcodedRgbHsl && hardcodedRgbHsl.length > 3) {
        violations.push({
          ruleId: 'uses-design-tokens',
          message: `Found ${hardcodedRgbHsl.length} hardcoded rgb/hsl colors`,
          suggestion: 'Use CSS variables for colors to enable theming'
        });
      }

      return violations;
    },
    example: {
      bad: `<Badge className="bg-[#5B9BD5]/20 text-[#2B5BA8] dark:bg-[#5B9BD5]/10 dark:text-[#7BA3D9]">
const config = { primary: "#8B5CF6" };`,
      good: `const config = { "--primary": "#8B5CF6" };
<div style={config as React.CSSProperties} className="text-[var(--primary)]">`
    }
  },

  {
    id: 'uses-semantic-tokens',
    name: 'Uses Semantic Design Tokens',
    description: 'Use semantic token names (background, foreground, primary) instead of color names',
    category: 'styling',
    severity: 'warning',
    weight: 8,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Semantic tokens that SHOULD be used
      const semanticTokens = [
        'background', 'foreground',
        'primary', 'primary-foreground',
        'secondary', 'secondary-foreground',
        'muted', 'muted-foreground',
        'accent', 'accent-foreground',
        'destructive', 'destructive-foreground',
        'border', 'input', 'ring',
        'card', 'card-foreground',
        'popover', 'popover-foreground'
      ];

      // Check if component uses Tailwind classes
      const hasTailwindClasses = /className=.*(?:bg-|text-|border-)/.test(code);

      if (hasTailwindClasses) {
        // Check for non-semantic color usage (e.g., bg-white, text-black, bg-gray-100)
        const nonSemanticColors = code.match(/(?:bg|text|border)-(?:white|black|transparent)/g) || [];
        const paletteColors = code.match(/(?:bg|text|border)-(?:gray|slate|zinc|neutral|stone)-\d{2,3}/g) || [];

        // Check if semantic tokens are used
        const usesSemanticTokens = semanticTokens.some(token =>
          new RegExp(`(?:bg|text|border)-${token}(?:-foreground)?`).test(code)
        );

        // If using lots of non-semantic colors and no semantic tokens, flag it
        if ((nonSemanticColors.length + paletteColors.length) > 3 && !usesSemanticTokens) {
          violations.push({
            ruleId: 'uses-semantic-tokens',
            message: 'Use semantic design tokens instead of color names for better theming support',
            suggestion: `Replace bg-white → bg-background, text-black → text-foreground, bg-gray-100 → bg-muted, etc.

Semantic tokens to use:
- background/foreground: Page background and main text
- primary/primary-foreground: Brand color and its text
- secondary/secondary-foreground: Secondary actions
- muted/muted-foreground: Subtle backgrounds and text
- accent/accent-foreground: Highlights
- destructive/destructive-foreground: Errors/warnings
- border, input, ring: Borders and focus states
- card/card-foreground: Card surfaces`
          });
        }

        // Check for direct color values that should use tokens
        const directWhiteBlack = code.match(/(?:bg|text|border)-(?:white|black)/g);
        if (directWhiteBlack && directWhiteBlack.length > 0) {
          violations.push({
            ruleId: 'uses-semantic-tokens',
            message: `Found ${directWhiteBlack.length} uses of bg-white/black - these break dark mode`,
            suggestion: 'bg-white → bg-background or bg-card, text-black → text-foreground'
          });
        }
      }

      // Check for CSS variable usage without semantic naming
      const cssVarUsage = code.match(/var\(--[\w-]+\)/g);
      if (cssVarUsage) {
        const nonSemanticVars = cssVarUsage.filter(v => {
          const varName = v.match(/--[\w-]+/)?.[0] || '';
          // Check if it's a color-based name instead of semantic
          return /--(?:red|blue|green|yellow|purple|pink|gray|white|black|color-\d)/.test(varName);
        });

        if (nonSemanticVars.length > 0) {
          violations.push({
            ruleId: 'uses-semantic-tokens',
            message: `Found CSS variables with color names instead of semantic names: ${nonSemanticVars.slice(0, 3).join(', ')}`,
            suggestion: 'Use semantic names: --primary instead of --blue, --destructive instead of --red'
          });
        }
      }

      return violations;
    },
    example: {
      bad: `// Hardcoded colors break dark mode
<div className="bg-white text-black border-gray-200">
  <button className="bg-blue-500 text-white">Click</button>
</div>`,
      good: `// Semantic tokens adapt to theme
<div className="bg-background text-foreground border-border">
  <button className="bg-primary text-primary-foreground">Click</button>
</div>

/* In globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}`
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
    id: 'supports-polymorphism',
    name: 'Supports Polymorphism',
    description: 'Interactive and layout components should support polymorphism via as or asChild prop',
    category: 'composition',
    severity: 'warning',
    weight: 8,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check if this is an interactive component (Button, Link, etc.)
      const isInteractiveComponent = /export\s+(?:const|function)\s+(?:Button|Link|Clickable|Interactive|Action|Trigger)/i.test(code);

      // Check if this is a layout/container component
      const isLayoutComponent = /export\s+(?:const|function)\s+(?:Box|Container|Flex|Grid|Stack|Card|Section|Article|Main|Header|Footer|Aside|Nav)/i.test(code);

      // Check if component uses Slot from Radix
      const usesSlot = /import.*Slot.*from\s+['"]@radix-ui\/react-slot['"]/.test(code);
      const hasAsChild = /asChild/.test(code);

      // Check if component accepts 'as' prop
      const hasAsProp = /\bas\s*[?:]/.test(code) || /as\s*=/.test(code) || /as:\s*Element/.test(code);

      // Check for compound component sub-parts that render links/buttons without polymorphism
      // Matches: const NavItem = ..., const Logo = ..., function MobileNavItem, etc.
      const subComponentPatterns = [
        // Navigation items - should support button OR link
        { pattern: /(?:const|function)\s+(NavItem|NavigationItem|MenuItem|MobileNavItem|NavLink)/g, type: 'navigation' },
        // Logo - might be link or static
        { pattern: /(?:const|function)\s+(Logo|Brand|LogoLink)/g, type: 'logo' },
        // Root/Container components - should support semantic elements
        { pattern: /(?:const|function)\s+(Root|Wrapper|Container|Section|Layout)/g, type: 'container' },
        // Action items
        { pattern: /(?:const|function)\s+(Action|CTA|ActionButton)/g, type: 'action' },
      ];

      for (const { pattern, type } of subComponentPatterns) {
        const matches = code.match(pattern);
        if (matches && !hasAsChild && !hasAsProp && !usesSlot) {
          // Check if the component renders a hardcoded <a> or <button>
          const rendersHardcodedLink = /<a\s/.test(code) && !/<a\s[^>]*\{/.test(code);
          const rendersHardcodedButton = /<button\s/.test(code) && !/<button\s[^>]*\{/.test(code);

          if ((type === 'navigation' || type === 'logo' || type === 'action') && (rendersHardcodedLink || rendersHardcodedButton)) {
            violations.push({
              ruleId: 'supports-polymorphism',
              message: `${matches[0].replace(/(?:const|function)\s+/, '')} renders hardcoded ${rendersHardcodedLink ? '<a>' : '<button>'} - add asChild support for Next.js Link / React Router compatibility`,
              suggestion: `Add asChild prop for router integration:

// Before (hardcoded anchor)
const NavItem = ({ href, children }) => (
  <a href={href}>{children}</a>
)

// After (supports any link component)
import { Slot } from "@radix-ui/react-slot"

const NavItem = ({ href, asChild = false, children, ...props }) => {
  const Comp = asChild ? Slot : "a"
  return <Comp href={!asChild ? href : undefined} {...props}>{children}</Comp>
}

// Usage with Next.js:
<NavItem asChild>
  <Link href="/features">Features</Link>
</NavItem>`
            });
          }

          if (type === 'container') {
            violations.push({
              ruleId: 'supports-polymorphism',
              message: `${matches[0].replace(/(?:const|function)\s+/, '')} should support 'as' prop for semantic HTML (<section>, <article>, etc.)`,
              suggestion: `Add 'as' prop:

const Root = <E extends React.ElementType = 'div'>({
  as,
  ...props
}: { as?: E } & React.ComponentPropsWithoutRef<E>) => {
  const Element = as || 'div';
  return <Element {...props} />;
}

// Usage:
<Hero.Root as="section" aria-labelledby="hero-title">
<Hero.Root as="article">`
            });
          }
        }
      }

      // Interactive components SHOULD support polymorphism
      if (isInteractiveComponent && !usesSlot && !hasAsChild && !hasAsProp) {
        violations.push({
          ruleId: 'supports-polymorphism',
          message: 'Interactive component should support polymorphism (as or asChild prop)',
          suggestion: `Use Radix Slot for asChild pattern:

import { Slot } from "@radix-ui/react-slot"

function Button({ asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp {...props} />
}

// Usage: <Button asChild><a href="/">Link Button</a></Button>`
        });
      }

      // Layout components SHOULD support 'as' prop for semantic HTML
      if (isLayoutComponent && !hasAsProp && !hasAsChild) {
        violations.push({
          ruleId: 'supports-polymorphism',
          message: 'Layout component should support the "as" prop for semantic HTML',
          suggestion: `Add 'as' prop for semantic flexibility:

type BoxProps<E extends React.ElementType = 'div'> = {
  as?: E;
} & React.ComponentPropsWithoutRef<E>;

function Box<E extends React.ElementType = 'div'>({
  as,
  ...props
}: BoxProps<E>) {
  const Element = as || 'div';
  return <Element {...props} />;
}

// Usage:
<Box as="section">Content</Box>
<Box as="nav">Navigation</Box>
<Box as="article">Article</Box>`
        });
      }

      // Check for hardcoded elements that could be polymorphic
      // e.g., a component that always renders <div> but could be semantic
      const rendersDiv = /<div[^>]*data-slot=/.test(code);
      const hasSemanticProps = /role=["'](?:navigation|main|banner|contentinfo|complementary|article|region)["']/.test(code);

      if (rendersDiv && hasSemanticProps && !hasAsProp) {
        violations.push({
          ruleId: 'supports-polymorphism',
          message: 'Component uses role attribute - consider supporting "as" prop for semantic HTML instead',
          suggestion: 'Replace <div role="navigation"> with as="nav" support'
        });
      }

      return violations;
    },
    example: {
      bad: `// Hardcoded element - no flexibility
function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}

// Hardcoded div with role - should use semantic element
function Nav({ children }) {
  return <div role="navigation">{children}</div>
}`,
      good: `// With asChild (Radix Slot pattern)
import { Slot } from "@radix-ui/react-slot"

function Button({ asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="button" {...props} />
}

// With as prop (for layout components)
function Container<E extends React.ElementType = 'div'>({
  as,
  ...props
}: { as?: E } & React.ComponentPropsWithoutRef<E>) {
  const Element = as || 'div';
  return <Element data-slot="container" {...props} />;
}

// Usage:
<Button asChild><a href="/">Link</a></Button>
<Container as="section">Content</Container>
<Container as="nav">Navigation</Container>`
    }
  },

  {
    id: 'semantic-default-element',
    name: 'Semantic Default Element',
    description: 'Polymorphic components should default to semantic elements, not generic divs',
    category: 'composition',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for components with 'as' prop that default to 'div' when they should be semantic
      const componentDefaults = [
        // Component name patterns and their expected semantic defaults
        { pattern: /(?:const|function)\s+Article.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'article' },
        { pattern: /(?:const|function)\s+Navigation.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'nav' },
        { pattern: /(?:const|function)\s+Nav\b.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'nav' },
        { pattern: /(?:const|function)\s+Header\b.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'header' },
        { pattern: /(?:const|function)\s+Footer\b.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'footer' },
        { pattern: /(?:const|function)\s+Main\b.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'main' },
        { pattern: /(?:const|function)\s+Aside\b.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'aside' },
        { pattern: /(?:const|function)\s+Section\b.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'section' },
        { pattern: /(?:const|function)\s+Heading.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'h2' },
        { pattern: /(?:const|function)\s+Title.*as:\s*Element\s*=\s*['"]div['"]/, expected: 'h1 or h2' },
      ];

      for (const { pattern, expected } of componentDefaults) {
        if (pattern.test(code)) {
          const match = code.match(/(?:const|function)\s+(\w+)/);
          const componentName = match ? match[1] : 'Component';
          violations.push({
            ruleId: 'semantic-default-element',
            message: `${componentName} defaults to 'div' but should default to '${expected}'`,
            suggestion: `Change default from 'div' to '${expected}':

// ❌ Too generic
function ${componentName}({ as: Element = 'div', ...props }) { }

// ✅ Semantic default
function ${componentName}({ as: Element = '${expected}', ...props }) { }`
          });
        }
      }

      return violations;
    },
    example: {
      bad: `// Too generic defaults
function Article({ as: Element = 'div', ...props }) { }
function Navigation({ as: Element = 'div', ...props }) { }
function Heading({ as: Element = 'div', ...props }) { }`,
      good: `// Semantic defaults
function Article({ as: Element = 'article', ...props }) { }
function Navigation({ as: Element = 'nav', ...props }) { }
function Heading({ as: Element = 'h2', ...props }) { }`
    }
  },

  {
    id: 'polymorphic-type-safety',
    name: 'Polymorphic Type Safety',
    description: 'Polymorphic components should use proper TypeScript generics for type safety',
    category: 'types',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for 'as' prop with 'any' type
      if (/as\s*\??\s*:\s*any/.test(code)) {
        violations.push({
          ruleId: 'polymorphic-type-safety',
          message: "The 'as' prop is typed as 'any' - this loses type safety",
          suggestion: `Use proper generic typing:

type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & React.ComponentPropsWithoutRef<E>;

function Component<E extends React.ElementType = 'div'>({
  as,
  ...props
}: PolymorphicProps<E>) {
  const Element = as || 'div';
  return <Element {...props} />;
}`
        });
      }

      // Check for 'as' prop with string type instead of ElementType
      if (/as\s*\??\s*:\s*string/.test(code)) {
        violations.push({
          ruleId: 'polymorphic-type-safety',
          message: "The 'as' prop is typed as 'string' - use React.ElementType for proper inference",
          suggestion: `Use React.ElementType:

// ❌ No inference
as?: string

// ✅ Full type inference
<E extends React.ElementType = 'div'>
as?: E`
        });
      }

      // Check for polymorphic component without generic type parameter
      const hasAsProp = /\bas\s*[?:]/.test(code);
      const hasGeneric = /<\s*E\s+extends\s+React\.ElementType/.test(code);

      if (hasAsProp && !hasGeneric && !/asChild/.test(code)) {
        // Only flag if it looks like a polymorphic component definition
        if (/(?:const|function)\s+\w+.*as\s*[?:]/.test(code)) {
          violations.push({
            ruleId: 'polymorphic-type-safety',
            message: "Polymorphic component lacks generic type parameter - props won't be inferred correctly",
            suggestion: `Add generic type parameter:

function Component<E extends React.ElementType = 'div'>({
  as,
  ...props
}: { as?: E } & React.ComponentPropsWithoutRef<E>) {
  const Element = as || 'div';
  return <Element {...props} />;
}

// Now TypeScript infers props based on 'as':
<Component as="a" href="/" />  // ✅ href is valid
<Component as="button" href="/" />  // ❌ Error: href not on button`
          });
        }
      }

      return violations;
    },
    example: {
      bad: `// No type safety
function Component({ as: Element = 'div', ...props }: any) {
  return <Element {...props} />;
}

// String type loses inference
function Box({ as }: { as?: string }) { }`,
      good: `// Full type safety with generics
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & React.ComponentPropsWithoutRef<E>;

function Component<E extends React.ElementType = 'div'>({
  as,
  ...props
}: PolymorphicProps<E>) {
  const Element = as || 'div';
  return <Element {...props} />;
}

// Props are inferred from element type:
<Component as="a" href="/home" />  // ✅ href valid
<Component as="button" type="submit" />  // ✅ type valid`
    }
  },

  {
    id: 'polymorphic-keyboard-handler',
    name: 'Polymorphic Keyboard Handler',
    description: 'Non-button interactive elements need keyboard event handlers for accessibility',
    category: 'accessibility',
    severity: 'warning',
    weight: 8,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for onClick without onKeyDown on polymorphic components
      const hasAsProp = /\bas\s*[?:]/.test(code) || /as\s*=/.test(code);
      const hasOnClick = /onClick/.test(code);
      const hasKeyboardHandler = /onKeyDown|onKeyUp|onKeyPress/.test(code);

      // If component supports 'as' and has onClick but no keyboard handler
      if (hasAsProp && hasOnClick && !hasKeyboardHandler) {
        violations.push({
          ruleId: 'polymorphic-keyboard-handler',
          message: "Polymorphic component with onClick needs keyboard handler for when rendered as non-button",
          suggestion: `Add keyboard support for accessibility:

function Interactive({ as: Element = 'button', onClick, ...props }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only needed for non-button elements
    if (Element !== 'button' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  return (
    <Element
      onClick={onClick}
      onKeyDown={Element !== 'button' ? handleKeyDown : undefined}
      tabIndex={Element !== 'button' && Element !== 'a' ? 0 : undefined}
      role={Element !== 'button' && Element !== 'a' ? 'button' : undefined}
      {...props}
    />
  );
}`
        });
      }

      return violations;
    },
    example: {
      bad: `// Missing keyboard support
function Clickable({ as: Element = 'div', onClick, ...props }) {
  return <Element onClick={onClick} {...props} />;
}

// When rendered as div, Enter/Space won't work!`,
      good: `// With keyboard support
function Clickable({ as: Element = 'button', onClick, ...props }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (Element !== 'button' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  return (
    <Element
      onClick={onClick}
      onKeyDown={Element !== 'button' ? handleKeyDown : undefined}
      tabIndex={Element !== 'button' ? 0 : undefined}
      role={Element !== 'button' ? 'button' : undefined}
      {...props}
    />
  );
}`
    }
  },

  {
    id: 'as-prop-documented',
    name: 'As Prop Documented',
    description: 'The as prop should have JSDoc documenting valid element choices',
    category: 'types',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for 'as' prop without JSDoc
      const hasAsProp = /\bas\s*\??\s*:/.test(code);
      const hasAsJsDoc = /\/\*\*[\s\S]*?@(?:example|default)[\s\S]*?\*\/[\s\n]*.*as\s*\??\s*:/.test(code);

      if (hasAsProp && !hasAsJsDoc) {
        violations.push({
          ruleId: 'as-prop-documented',
          message: "The 'as' prop should have JSDoc documenting valid elements",
          suggestion: `Add JSDoc to 'as' prop:

interface BoxProps {
  /**
   * The HTML element to render as
   * @default 'div'
   * @example 'section', 'article', 'aside', 'main'
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
}`
        });
      }

      return violations;
    },
    example: {
      bad: `interface BoxProps {
  as?: React.ElementType;  // No documentation
}`,
      good: `interface BoxProps {
  /**
   * The HTML element to render as
   * @default 'div'
   * @example 'section', 'article', 'aside', 'main'
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
}`
    }
  },

  // ============================================
  // DOCUMENTATION RULES
  // ============================================
  {
    id: 'variants-documented',
    name: 'Variants Are Documented',
    description: 'Variant props should have JSDoc comments explaining their purpose',
    category: 'types',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for variant/size props without JSDoc
      const variantProps = code.match(/(?:variant|size)\??\s*:\s*['"][^'"]+['"]\s*\|/g);

      if (variantProps && variantProps.length > 0) {
        // Check if there's JSDoc before the type definition
        const hasJsDoc = /\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?(?:type|interface)\s+\w+Props/.test(code);
        const hasInlineJsDoc = /@(?:default|description)/.test(code);

        if (!hasJsDoc && !hasInlineJsDoc) {
          violations.push({
            ruleId: 'variants-documented',
            message: 'Variant props should have JSDoc comments',
            suggestion: 'Add /** @default "primary" */ or descriptive comments above variant props'
          });
        }
      }

      return violations;
    },
    example: {
      bad: `type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};`,
      good: `type ButtonProps = {
  /**
   * The visual style of the button
   * @default "primary"
   */
  variant?: 'primary' | 'secondary';
  /**
   * The size of the button
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
};`
    }
  },

  {
    id: 'extracts-repeated-patterns',
    name: 'Extracts Repeated Patterns',
    description: 'Repeated style patterns should be extracted into shared utilities',
    category: 'styling',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Common patterns that should be extracted
      const commonPatterns = [
        { pattern: /focus-visible:outline-none\s+focus-visible:ring/g, name: 'focus ring' },
        { pattern: /disabled:pointer-events-none\s+disabled:opacity/g, name: 'disabled state' },
        { pattern: /transition-(?:all|colors|opacity|transform)/g, name: 'transition' },
      ];

      for (const { pattern, name } of commonPatterns) {
        const matches = code.match(pattern);
        if (matches && matches.length >= 3) {
          violations.push({
            ruleId: 'extracts-repeated-patterns',
            message: `The ${name} pattern appears ${matches.length} times - consider extracting to a shared utility`,
            suggestion: `Create a utility: export const ${name.replace(' ', '')} = '${matches[0]}'; and import it`
          });
        }
      }

      return violations;
    },
    example: {
      bad: `// Same focus ring copied everywhere
<Button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
<Input className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />`,
      good: `// utils/styles.ts
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const disabled = 'disabled:pointer-events-none disabled:opacity-50';

// In components
<Button className={cn(focusRing, disabled, className)} />`
    }
  },

  // ============================================
  // ASCHILD PATTERN RULES
  // ============================================
  {
    id: 'aschild-spreads-props',
    name: 'asChild Component Spreads Props',
    description: 'Components used with asChild must spread props to receive parent behavior',
    category: 'composition',
    severity: 'error',
    weight: 10,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for components that DON'T spread props
      // Pattern: function/const Component = ({ children }) => ... (no ...props)
      const noSpreadPattern = /(?:const|function)\s+(\w+)\s*=?\s*\(\s*\{\s*(?:children|className)(?:\s*,\s*(?:children|className))*\s*\}\s*\)/g;

      let match;
      while ((match = noSpreadPattern.exec(code)) !== null) {
        const componentName = match[1];
        // Skip if this looks like a type definition
        if (code.includes(`${componentName}Props`)) {
          violations.push({
            ruleId: 'aschild-spreads-props',
            message: `${componentName} doesn't spread props - won't work correctly with asChild`,
            suggestion: `Always spread props to receive parent behavior:

// ❌ Won't receive trigger behavior
const ${componentName} = ({ children }) => <div>{children}</div>;

// ✅ Properly receives all props
const ${componentName} = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);`
          });
        }
      }

      return violations;
    },
    example: {
      bad: `// Won't work with asChild - props not spread
const Button = ({ children }) => <button>{children}</button>;`,
      good: `// Works with asChild - props are spread
const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);`
    }
  },

  // ============================================
  // ACCESSIBILITY ADVANCED RULES
  // ============================================
  {
    id: 'nav-has-label',
    name: 'Navigation Has Label',
    description: 'Navigation elements should have aria-label for screen readers',
    category: 'accessibility',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for <nav> without aria-label
      const navWithoutLabel = /<nav(?![^>]*aria-label)/g;
      const matches = code.match(navWithoutLabel);

      if (matches && matches.length > 0) {
        violations.push({
          ruleId: 'nav-has-label',
          message: `Found ${matches.length} <nav> element(s) without aria-label`,
          suggestion: `Add aria-label to describe the navigation:

<nav aria-label="Main navigation">
<nav aria-label="Breadcrumb">
<nav aria-label="Footer links">`
        });
      }

      return violations;
    },
    example: {
      bad: `<nav>
  <ul>...</ul>
</nav>`,
      good: `<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>`
    }
  },

  {
    id: 'focus-visible-styles',
    name: 'Uses Focus Visible',
    description: 'Use focus-visible instead of focus for keyboard-only focus styles',
    category: 'accessibility',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for :focus without :focus-visible
      const focusWithoutVisible = /(?:^|[^-])focus:/g;
      const hasFocusVisible = /focus-visible:/.test(code);

      const matches = code.match(focusWithoutVisible);
      if (matches && matches.length > 2 && !hasFocusVisible) {
        violations.push({
          ruleId: 'focus-visible-styles',
          message: 'Using focus: instead of focus-visible: - focus styles will show on mouse click',
          suggestion: `Use focus-visible: to only show focus styles for keyboard navigation:

// ❌ Shows focus ring on mouse click too
className="focus:ring-2 focus:ring-blue-500"

// ✅ Only shows focus ring for keyboard users
className="focus-visible:ring-2 focus-visible:ring-blue-500"`
        });
      }

      return violations;
    },
    example: {
      bad: `<button className="focus:outline-none focus:ring-2">`,
      good: `<button className="focus-visible:outline-none focus-visible:ring-2">`
    }
  },

  {
    id: 'input-has-label',
    name: 'Input Has Associated Label',
    description: 'Form inputs should have associated labels or aria-label',
    category: 'accessibility',
    severity: 'warning',
    weight: 8,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for input without aria-label and not near a label
      const inputPattern = /<input(?![^>]*(?:aria-label|aria-labelledby|id=))[^>]*>/g;
      const matches = code.match(inputPattern);

      // Only flag if there's no <label> in the code at all
      const hasLabel = /<label/.test(code);

      if (matches && matches.length > 0 && !hasLabel) {
        violations.push({
          ruleId: 'input-has-label',
          message: `Found input(s) without labels or aria-label`,
          suggestion: `Associate inputs with labels:

// Option 1: Wrapping label
<label>
  Email
  <input type="email" />
</label>

// Option 2: Using htmlFor/id
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Option 3: aria-label for icon inputs
<input type="search" aria-label="Search" />`
        });
      }

      return violations;
    },
    example: {
      bad: `<input type="email" placeholder="Email" />`,
      good: `<label>
  Email
  <input type="email" />
</label>`
    }
  },

  {
    id: 'prefers-aria-disabled',
    name: 'Prefers aria-disabled Over disabled',
    description: 'Consider aria-disabled over disabled to maintain focusability',
    category: 'accessibility',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for disabled without aria-disabled explanation
      const hasDisabled = /disabled(?:\s*=\s*\{|\s*\})/.test(code);
      const hasAriaDisabled = /aria-disabled/.test(code);
      const hasExplanation = /aria-describedby|disabled.*help|disabled.*explain/i.test(code);

      if (hasDisabled && !hasAriaDisabled && !hasExplanation) {
        violations.push({
          ruleId: 'prefers-aria-disabled',
          message: 'Using disabled attribute - users cannot focus to understand why',
          suggestion: `Consider aria-disabled with explanation:

// ❌ User can't understand why button is disabled
<button disabled={!isValid}>Submit</button>

// ✅ User can focus and learn why
<button
  aria-disabled={!isValid}
  aria-describedby="submit-help"
  onClick={isValid ? handleSubmit : undefined}
  className={!isValid ? 'opacity-50 cursor-not-allowed' : ''}
>
  Submit
</button>
<span id="submit-help">
  {!isValid && 'Please fill in all required fields'}
</span>`
        });
      }

      return violations;
    },
    example: {
      bad: `<button disabled={!isValid}>Submit</button>`,
      good: `<button
  aria-disabled={!isValid}
  aria-describedby="submit-help"
>Submit</button>
<span id="submit-help">{!isValid && 'Complete required fields'}</span>`
    }
  },

  {
    id: 'cva-outside-component',
    name: 'CVA Defined Outside Component',
    description: 'CVA variants should be defined outside the component to avoid recreation',
    category: 'styling',
    severity: 'warning',
    weight: 5,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for cva() inside a function component
      const componentPattern = /(?:function|const)\s+\w+\s*(?:=|[\(<])[\s\S]*?cva\(/g;

      // More specific: cva inside the component body
      const cvaInsideComponent = /(?:function|const)\s+\w+\s*(?:=\s*\([^)]*\)\s*=>|[\(<])[^}]*\breturn\b[^}]*\bcva\(/;

      if (cvaInsideComponent.test(code)) {
        violations.push({
          ruleId: 'cva-outside-component',
          message: 'CVA variants defined inside component - recreated on every render',
          suggestion: `Define CVA variants outside the component:

// ❌ Recreated on every render
function Button({ variant }) {
  const buttonVariants = cva('...', { variants: {...} });
  return <button className={buttonVariants({ variant })} />;
}

// ✅ Defined once, reused
const buttonVariants = cva('...', { variants: {...} });

function Button({ variant }) {
  return <button className={buttonVariants({ variant })} />;
}`
        });
      }

      return violations;
    },
    example: {
      bad: `function Button({ variant }) {
  const buttonVariants = cva('base', { variants: {} });
  return <button className={buttonVariants({ variant })} />;
}`,
      good: `const buttonVariants = cva('base', { variants: {} });

function Button({ variant }) {
  return <button className={buttonVariants({ variant })} />;
}`
    }
  },

  {
    id: 'live-region-for-dynamic',
    name: 'Live Region for Dynamic Content',
    description: 'Dynamic content changes should use aria-live for screen reader announcements',
    category: 'accessibility',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for loading states without aria-live
      const hasLoadingState = /isLoading|loading|\.loading/i.test(code);
      const hasErrorState = /error|Error|isError/i.test(code);
      const hasAriaLive = /aria-live|role="alert"|role="status"/.test(code);

      if ((hasLoadingState || hasErrorState) && !hasAriaLive) {
        violations.push({
          ruleId: 'live-region-for-dynamic',
          message: 'Dynamic loading/error states should announce to screen readers',
          suggestion: `Add aria-live for dynamic content:

// Loading states
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "Loading..." : \`\${items.length} items\`}
</div>

// Error messages
<div role="alert" aria-live="assertive">
  {error && \`Error: \${error.message}\`}
</div>

// Status updates
<div role="status" aria-live="polite">
  {saved && "Changes saved"}
</div>`
        });
      }

      return violations;
    },
    example: {
      bad: `{isLoading && <span>Loading...</span>}
{error && <span className="text-red-500">{error}</span>}`,
      good: `<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "Loading..." : "Content loaded"}
</div>
<div role="alert">{error}</div>`
    }
  },

  {
    id: 'touch-target-size',
    name: 'Touch Target Size',
    description: 'Interactive elements should have minimum 44x44px touch targets',
    category: 'accessibility',
    severity: 'info',
    weight: 3,
    check: (code) => {
      const violations: RuleViolation[] = [];

      // Check for small size classes on interactive elements
      const smallInteractive = /(?:<button|<a\s|onClick)[^>]*(?:size-\d|w-\d|h-\d|p-1|p-0\.5)/g;
      const matches = code.match(smallInteractive);

      // Check for size utilities smaller than min touch target (44px ≈ h-11, w-11)
      const tooSmall = /(?:size-[1-9]|w-[1-9]|h-[1-9]|size-10|w-10|h-10)(?![0-9])/;

      if (matches && matches.some(m => tooSmall.test(m))) {
        violations.push({
          ruleId: 'touch-target-size',
          message: 'Interactive element may be too small for touch (min 44x44px)',
          suggestion: `Ensure minimum 44x44px touch targets:

// ❌ Too small for touch
<button className="size-6">
  <Icon />
</button>

// ✅ Minimum touch target
<button className="size-11 p-2">
  <Icon className="size-6" />
</button>

// ✅ Or use invisible touch area
<button className="relative size-6">
  <span className="absolute -inset-2" /> <!-- Extends touch area -->
  <Icon />
</button>`
        });
      }

      return violations;
    },
    example: {
      bad: `<button className="size-6" onClick={...}>
  <XIcon />
</button>`,
      good: `<button className="size-11 p-2" onClick={...}>
  <XIcon className="size-6" />
</button>`
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
