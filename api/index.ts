/**
 * Vercel Serverless API for Component Rules
 *
 * This provides an HTTP API that can be used:
 * 1. Directly via fetch/curl
 * 2. Via MCP with an HTTP transport (coming soon)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  gradeComponent,
  getAllRules,
  getRulesByCategory,
  getRule,
  getRulesMarkdown,
  type Rule,
} from '../src/rules/component-rules.js';
import {
  generateBasicComponent,
  generateComposableComponent,
  generateButtonComponent,
  generateCardComponent,
  generateInputComponent,
} from '../src/rules/templates.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'rules':
        return handleGetRules(req, res);
      case 'rule':
        return handleGetRule(req, res);
      case 'grade':
        return handleGrade(req, res);
      case 'generate':
        return handleGenerate(req, res);
      case 'check':
        return handleCheck(req, res);
      case 'list':
        return handleList(res);
      case 'template':
        return handleTemplate(req, res);
      case 'quick-reference':
        return handleQuickReference(res);
      default:
        return res.status(200).json({
          name: 'components-build-mcp API',
          version: '1.0.0',
          endpoints: [
            { path: '/?action=rules', method: 'GET', description: 'Get all rules' },
            { path: '/?action=rule&id=<ruleId>', method: 'GET', description: 'Get specific rule' },
            { path: '/?action=grade', method: 'POST', description: 'Grade component code' },
            { path: '/?action=generate', method: 'POST', description: 'Generate component' },
            { path: '/?action=check', method: 'POST', description: 'Check compliance' },
            { path: '/?action=list', method: 'GET', description: 'List all rules' },
            { path: '/?action=template&name=<template>', method: 'GET', description: 'Get template' },
            { path: '/?action=quick-reference', method: 'GET', description: 'Get quick reference' },
          ],
        });
    }
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function handleGetRules(req: VercelRequest, res: VercelResponse) {
  const { category, format } = req.query;

  let rules: Rule[];
  if (category && category !== 'all') {
    rules = getRulesByCategory(category as Rule['category']);
  } else {
    rules = getAllRules();
  }

  if (format === 'markdown') {
    res.setHeader('Content-Type', 'text/markdown');
    return res.status(200).send(getRulesMarkdown());
  }

  return res.status(200).json({
    count: rules.length,
    rules: rules.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      severity: r.severity,
      weight: r.weight,
    })),
  });
}

function handleGetRule(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing rule id' });
  }

  const rule = getRule(id);

  if (!rule) {
    return res.status(404).json({
      error: `Rule not found: ${id}`,
      availableRules: getAllRules().map((r) => r.id),
    });
  }

  return res.status(200).json({
    ...rule,
    check: undefined, // Don't expose function
    fix: undefined,
  });
}

async function handleGrade(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  const { code, verbose } = req.body || {};

  if (!code) {
    return res.status(400).json({ error: 'Missing code in request body' });
  }

  const result = gradeComponent(code);

  return res.status(200).json({
    score: result.score,
    grade: result.grade,
    summary: result.summary,
    isCompliant: result.score >= 80,
    violations: result.violations,
    passes: result.passes,
    ...(verbose && {
      violationDetails: result.violations.map((v) => ({
        ...v,
        rule: getRule(v.ruleId),
      })),
    }),
  });
}

async function handleGenerate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  const { name, template, element, hasVariants, variants, sizes } = req.body || {};

  if (!name || !template) {
    return res.status(400).json({ error: 'Missing name or template' });
  }

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
        element: element || 'div',
        hasVariants: hasVariants || false,
        variants,
        sizes,
      });
      break;
  }

  const grade = gradeComponent(code);

  return res.status(200).json({
    name,
    template,
    code,
    compliance: {
      score: grade.score,
      grade: grade.grade,
      passes: grade.passes,
    },
  });
}

async function handleCheck(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  const { code } = req.body || {};

  if (!code) {
    return res.status(400).json({ error: 'Missing code in request body' });
  }

  const result = gradeComponent(code);
  const isCompliant = result.score >= 80;

  return res.status(200).json({
    compliant: isCompliant,
    score: result.score,
    grade: result.grade,
    issueCount: result.violations.length,
    issues: result.violations.map((v) => v.message),
  });
}

function handleList(res: VercelResponse) {
  const rules = getAllRules();

  const byCategory: Record<string, typeof rules> = {};
  for (const rule of rules) {
    if (!byCategory[rule.category]) {
      byCategory[rule.category] = [];
    }
    byCategory[rule.category].push(rule);
  }

  return res.status(200).json({
    totalRules: rules.length,
    byCategory: Object.fromEntries(
      Object.entries(byCategory).map(([cat, rules]) => [
        cat,
        rules.map((r) => ({
          id: r.id,
          name: r.name,
          severity: r.severity,
          weight: r.weight,
        })),
      ])
    ),
  });
}

function handleTemplate(req: VercelRequest, res: VercelResponse) {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing template name' });
  }

  let code: string;
  let description: string;

  switch (name) {
    case 'button':
      code = generateButtonComponent();
      description = 'Button with variants, sizes, and asChild support';
      break;
    case 'card':
      code = generateCardComponent();
      description = 'Composable Card with Header, Title, Description, Content, Footer';
      break;
    case 'input':
      code = generateInputComponent();
      description = 'Accessible input component';
      break;
    case 'composable':
      code = generateComposableComponent({ name: 'Example' });
      description = 'Root/Trigger/Content pattern with Context';
      break;
    case 'basic':
    default:
      code = generateBasicComponent({ name: 'Example', hasVariants: true });
      description = 'Basic component with CVA variants';
      break;
  }

  return res.status(200).json({
    template: name,
    description,
    code,
  });
}

function handleQuickReference(res: VercelResponse) {
  const reference = `# Component Rules Quick Reference

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
- Root: Main container with context
- Trigger: Opens/toggles something
- Content: Main content area
- Item: Individual item wrapper
- Header/Footer: Top/bottom sections
- Title/Description: Text elements

## Class Order
\`\`\`tsx
className={cn(
  'base-styles',           // 1. Base
  variantStyles,           // 2. Variants
  isActive && 'active',    // 3. Conditionals
  className                // 4. User overrides LAST
)}
\`\`\`

## Data Attributes
- data-slot="button" - Component identification
- data-state="open" - Visual state
- data-variant={variant} - Current variant

## Accessibility Must-Haves
- Button type: <button type="button">
- Icon buttons: aria-label="Description"
- Expandable: aria-expanded={isOpen} aria-controls="id"
- Interactive divs: role="button" tabIndex={0} onKeyDown

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

  res.setHeader('Content-Type', 'text/markdown');
  return res.status(200).send(reference);
}
