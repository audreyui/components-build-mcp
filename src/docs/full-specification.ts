/**
 * Full components.build Specification
 *
 * This module contains the COMPLETE documentation from components.build,
 * the open-source standard for building modern, composable, and accessible
 * UI components by Hayden Bleasel and shadcn.
 *
 * Source: https://components.build
 */

export const SPECIFICATION = {
  title: "components.build",
  description: "An open-source standard for building modern, composable, and accessible UI components. While examples use React/TypeScript, the core principles are framework-agnostic and applicable to Vue, Svelte, Angular, and other modern frameworks.",
  authors: ["Hayden Bleasel", "shadcn"],
  frameworkNote: "Examples use React/TypeScript, but principles apply to ALL frameworks.",

  sections: {
    overview: `# Overview

Modern web applications are built on reusable UI components and how we design, build, and share them is important. This specification aims to establish a formal, open standard for building open-source UI components for the modern web.

It is co-authored by Hayden Bleasel and shadcn, with contributions from the open-source community and informed by popular projects in the React ecosystem.

The goal is to help open-source maintainers and senior front-end engineers create components that are composable, accessible, and easy to adopt across projects.

## What is this specification?

This spec is not a tutorial or course on React, nor a promotion for any specific component library or registry. Instead, it provides high-level guidelines, best practices, and a common terminology for designing UI components.

By following this specification, developers can ensure their components are consistent with modern expectations and can integrate smoothly into any codebase.

## Who is this for?

We're writing this for open-source maintainers and experienced front-end engineers who build and distribute component libraries or design systems. We assume you are familiar with JavaScript/TypeScript and React.

All examples will use React (with JSX/TSX) for concreteness, but we hope the fundamental concepts apply to other frameworks like Vue, Svelte, or Angular.

In other words, we hope this spec's philosophy is framework-agnostic – whether you build with React or another library, you should emphasize the same principles of composition, accessibility, and maintainability.`,

    definitions: `# Definitions

This page establishes precise terminology used throughout the specification. Terms are intentionally framework agnostic, but we will use React for examples.

## 1. Artifact Taxonomy

### 1.1 Primitive

A primitive (or, unstyled component) is the **lowest-level building block** that provides behavior and accessibility without any styling.

Primitives are completely headless (i.e. unstyled) and encapsulate semantics, focus management, keyboard interaction, layering/portals, ARIA wiring, measurement, and similar concerns. They provide the behavioral foundation but require styling to become finished UI.

**Examples:**
- Radix UI Primitives (Dialog, Popover, Tooltip, etc.)
- React Aria Components
- Base UI
- Headless UI

**Expectations:**
- Completely unstyled (headless).
- Single responsibility; composable into styled components.
- Ships with exhaustive a11y behavior for its role.
- Versioning favors stability; breaking changes are rare and documented.

> Note: The terms primitive and component are typically used interchangeably across the web, but they are not the same.

### 1.2 Component

A component is a styled, reusable UI unit that adds visual design to primitives or composes multiple elements to create complete, functional interface elements.

Components are still relatively low-level but include styling, making them immediately usable in applications. They typically wrap unstyled primitives with default visual design while remaining customizable.

**Examples:**
- shadcn/ui components (styled wrappers of Radix primitives)
- Material UI components
- Ant Design components

**Expectations:**
- Clear props API; supports controlled and uncontrolled usage where applicable.
- Includes default styling but remains override-friendly (classes, tokens, slots).
- Fully keyboard accessible and screen-reader friendly (inherits from primitives).
- Composable (children/slots, render props, or compound subcomponents).
- May be built from primitives or implement behavior directly with styling.

### 1.3 Pattern

Patterns are a specific composition of primitives or components that are used to solve a specific UI/UX problem.

**Examples:**
- Form validation with inline errors
- Confirming destructive actions
- Typeahead search
- Optimistic UI

**Expectations:**
- Describes behavior, a11y, keyboard map, and failure modes.
- May include reference implementations in multiple frameworks.

### 1.4 Block

An opinionated, production-ready composition of components that solves a concrete interface use case (often product-specific) with content scaffolding. Blocks trade generality for speed of adoption.

**Examples:**
- Pricing table
- Auth screens
- Onboarding stepper
- AI chat panel
- Billing settings form

**Expectations:**
- Strong defaults, copy-paste friendly, easily branded/themed.
- Minimal logic beyond layout and orchestration; domain logic is stubbed via handlers.
- Accepts data via props; never hides data behind fetches without a documented adapter.

> Blocks are typically not reusable like a component. You don't import them, but they typically import components and primitives. This makes them good candidates for a Registry distribution method.

### 1.5 Page

A complete, single-route view composed of multiple blocks arranged to serve a specific user-facing purpose. Pages combine blocks into a cohesive layout that represents one destination in an application.

**Examples:**
- Landing page (hero block + features block + pricing block + footer block)
- Product detail page (image gallery block + product info block + reviews block)
- Dashboard page (stats block + chart block + activity feed block)

**Expectations:**
- Combines multiple blocks into a unified layout for a single route.
- Focuses on layout and block orchestration rather than component-level details.
- May include page-specific logic for data coordination between blocks.
- Self-contained for a single URL/route; not intended to be reused across routes.

### 1.6 Template

A multi-page collection or full-site scaffold that bundles pages, routing configuration, shared layouts, global providers, and project structure. Templates are complete starting points for entire applications or major application sections.

**Examples:**
- TailwindCSS Templates
- shadcnblocks Templates (full application shells)
- "SaaS starter" (auth pages + dashboard pages + settings pages + marketing pages)
- "E-commerce template" (storefront + product pages + checkout flow + admin pages)

**Expectations:**
- Includes multiple pages with routing/navigation structure.
- Provides global configuration (theme providers, auth context, layout shells).
- Opinionated project structure with clear conventions.
- Designed as a comprehensive starting point; fork and customize rather than import as dependency.
- May include build configuration, deployment setup, and development tooling.

### 1.7 Utility (Non-visual)

A helper exported for developer ergonomics or composition; not rendered UI.

**Examples:**
- React hooks (useControllableState, useId)
- Class utilities
- Keybinding helpers
- Focus scopes

**Expectations:**
- Side-effect free (except where explicitly documented).
- Testable in isolation; supports tree-shaking.

## 2. API and Composition Vocabulary

### 2.1 Props API

The public configuration surface of a component. Props are stable, typed, and documented with defaults and a11y ramifications.

### 2.2 Children / Slots

Placeholders for caller-provided structure or content.
- **Children (implicit slot):** JSX between opening/closing tags.
- **Named slots:** Props like icon, footer, or \`<Component.Slot>\` subcomponents.
- **Slot forwarding:** Passing DOM attributes/className/refs through to the underlying element.

### 2.3 Render Prop (Function-as-Child)

A function child used to delegate rendering while the parent supplies state/data.

\`\`\`tsx
<ParentComponent data={data}>
  {(item) => (
    <ChildComponent key={item.id} {...item} />
  )}
</ParentComponent>
\`\`\`

Use when the parent must own data/behavior but the consumer must fully control markup.

### 2.4 Controlled vs. Uncontrolled

**Controlled** and **uncontrolled** are terms used to describe the state of a component.

**Controlled** components have their value driven by props, and typically emit an \`onChange\` event (source of truth is the parent). **Uncontrolled** components hold internal state; and may expose a \`defaultValue\` and imperative reset.

Many inputs should support both.

### 2.5 Provider / Context

A top-level component that supplies shared state/configuration to a subtree (e.g., theme, locale, active tab id). Providers are explicitly documented with required placement.

### 2.6 Portal

Rendering UI outside the DOM hierarchy to manage layering/stacking context (e.g., modals, popovers, toasts), while preserving a11y (focus trap, aria-modal, inert background).

## 3. Styling and Theming Vocabulary

### 3.1 Headless

Implements behavior and accessibility without prescribing appearance. Requires the consumer to supply styling.

### 3.2 Styled

Ships with default visual design (CSS classes, inline styles, or tokens) but remains override-friendly (className merge, CSS vars, theming).

### 3.3 Variants

Discrete, documented style or behavior permutations exposed via props (e.g., \`size="sm|md|lg"\`, \`tone="neutral|destructive"\`). Variants are not separate components.

### 3.4 Design Tokens

Named, platform-agnostic values (e.g., \`--color-bg\`, \`--radius-md\`, \`--space-2\`) that parameterize visual design and support theming.

## 4. Accessibility Vocabulary

### 4.1 Role / State / Property

WAI-ARIA attributes that communicate semantics (\`role="menu"\`), state (\`aria-checked\`), and relationships (\`aria-controls\`, \`aria-labelledby\`).

### 4.2 Keyboard Map

The documented set of keyboard interactions for a widget (e.g., \`Tab\`, \`Arrow keys\`, \`Home/End\`, \`Escape\`). Every interactive component declares and implements a keyboard map.

### 4.3 Focus Management

Rules for initial focus, roving focus, focus trapping, and focus return on teardown.

## 5. Distribution Vocabulary

### 5.1 Package (Registry Distribution)

The component/library is published to a package registry (e.g., \`npm\`) and imported via a bundler. Favors versioned updates and dependency management.

### 5.2 Copy-and-Paste (Source Distribution)

Source code is integrated directly into the consumer's repository (often via a CLI). Favors ownership, customization, and zero extraneous runtime.

### 5.3 Registry (Catalog)

A curated index of artifacts (primitives, components, blocks, templates) with metadata, previews, and install/copy instructions. A registry is not necessarily a package manager.

## 6. Classification Heuristics

Use this decision flow to name and place an artifact:

1. Does it encapsulate a single behavior or a11y concern, with no styling? → **Primitive**
2. Is it a styled, reusable UI element that adds visual design to primitives or composes multiple elements? → **Component**
3. Does it solve a concrete product use case with opinionated composition and copy? → **Block**
4. Does it scaffold a page/flow with routing/providers and replaceable regions? → **Template**
5. Is it documentation of a recurring solution, independent of implementation? → **Pattern**
6. Is it non-visual logic for ergonomics/composition? → **Utility**

## 7. Non-Goals and Clarifications

- **Web Components vs. "Components."** In this spec, "component" refers to a reusable UI unit (examples in React). It does not imply the HTML Custom Elements standard unless explicitly stated. Equivalent principles apply across frameworks.
- **Widgets.** The term "widget" is avoided due to ambiguity; use component (general) or pattern (documentation-only solution).
- **Themes vs. Styles.** A theme is a parameterization of styles (via tokens). Styles are the concrete presentation. Components should support themes; blocks/templates may ship opinionated styles plus theming hooks.`,

    principles: `# Core Principles

When building modern UI components, it's important to keep these core principles in mind.

## Composability and Reusability

Favor composition over inheritance – build components that can be combined and nested to create more complex UIs, rather than relying on deep class hierarchies.

Composable components expose a clear API (via props/slots) that allows developers to customize behavior and appearance by plugging in child elements or callbacks.

This makes components highly reusable in different contexts. (React's design reinforces this: "Props and composition give you all the flexibility you need to customize a component's look and behavior in an explicit and safe way.")

## Accessible by Default

Components must be usable by all users. Use semantic HTML elements appropriate to the component's role (e.g. \`<button>\` for clickable actions, \`<ul>/<li>\` for lists, etc.) and augment with WAI-ARIA attributes when necessary.

Ensure keyboard navigation and focus management are supported (for example, arrow-key navigation in menus, focus traps in modals). Each component should adhere to accessibility standards and guidelines out of the box.

This means providing proper ARIA roles/states and testing with screen readers. Accessibility is not optional – it's a baseline feature of every component.

## Customizability and Theming

A component should be easy to restyle or adapt to different design requirements. Avoid hard-coding visual styles that cannot be overridden.

Provide mechanisms for theming and styling, such as CSS variables, clearly documented class names, or style props. Ideally, components come with sensible default styling but allow developers to customize appearance with minimal effort (for example, by passing a className or using design tokens).

This principle ensures components can fit into any brand or design system without "fighting" against default styles.

## Lightweight and Performant

Components should be as lean as possible in terms of assets and dependencies. Avoid bloating a component with large library dependencies or overly complex logic, especially if that logic isn't always needed.

Strive for good performance (both rendering and interaction) by minimizing unnecessary re-renders and using efficient algorithms for heavy tasks. If a component is data-intensive (like a large list or table), consider patterns like virtualization or incremental rendering, but keep such features optional.

Lightweight components are easier to maintain and faster for end users.

## Transparency and Code Ownership

In open-source, consumers often benefit from having full visibility and control of component code. This spec encourages an "open-source first" mindset: components should not be black boxes.

When developers import or copy your component, they should be able to inspect how it works and modify it if needed. This principle underlies the emerging "copy-and-paste" distribution model (discussed later) where developers integrate component code directly into their projects.

By giving users ownership of the code, you increase trust and allow deeper customization.

Even if you distribute via a package, embrace transparency by providing source maps, readable code, and thorough documentation.

## Well-documented and DX-Friendly

A great component is not just code – it comes with clear documentation and examples. From a developer experience (DX) perspective, your components should be easy to learn and integrate.

Document each component's purpose, props, and usage examples. Include notes on accessibility (like keyboard controls or ARIA attributes used) and any customization options.

Good documentation reduces misuse and lowers the barrier for adoption. We will cover documentation expectations in the Publish section, but it's listed here as a principle because planning for good documentation and DX should happen during the design/build phase.`,

    composition: `# Composition

Composition, or composability, is the foundation of building modern UI components. It is one of the most powerful techniques for creating flexible, reusable components that can handle complex requirements without sacrificing API clarity.

Instead of cramming all functionality into a single component with dozens of props, composition distributes responsibility across multiple cooperating components.

## Making a component composable

To make a component composable, you need to break it down into smaller, more focused components. For example, let's take this Accordion component:

\`\`\`tsx
import { Accordion } from '@/components/ui/accordion';

const data = [
  {
    title: 'Accordion 1',
    content: 'Accordion 1 content',
  },
  {
    title: 'Accordion 2',
    content: 'Accordion 2 content',
  },
  {
    title: 'Accordion 3',
    content: 'Accordion 3 content',
  },
];

return (
  <Accordion data={data} />
);
\`\`\`

While this Accordion component might seem simple, it's handling too many responsibilities. It's responsible for rendering the container, trigger and content; as well as handling the accordion state and data.

Customizing the styling of this component is difficult because it's tightly coupled. It likely requires global CSS overrides. Additionally, adding new functionality or tweaking the behavior requires modifying the component source code.

To solve this, we can break this down into smaller, more focused components.

### 1. Root Component

First, let's focus on the container - the component that holds everything together i.e. the trigger and content. This container doesn't need to know about the data, but it does need to keep track of the open state.

However, we also want this state to be accessible by child components. So, let's use the Context API to create a context for the open state.

Finally, to allow for modification of the \`div\` element, we'll extend the default HTML attributes.

We'll call this component the "Root" component.

\`\`\`tsx
type AccordionProps = React.ComponentProps<'div'> & {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AccordionContext = createContext<AccordionProps>({
  open: false,
  setOpen: () => {},
});

export type AccordionRootProps = React.ComponentProps<'div'> & {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Root = ({
  children,
  open,
  setOpen,
  ...props
}: AccordionRootProps) => (
  <AccordionContext.Provider value={{ open, setOpen }}>
    <div {...props}>{children}</div>
  </AccordionContext.Provider>
);
\`\`\`

### 2. Item Component

The Item component is the element that contains the accordion item. It is simply a wrapper for each item in the accordion.

\`\`\`tsx
export type AccordionItemProps = React.ComponentProps<'div'>;

export const Item = (props: AccordionItemProps) => <div {...props} />;
\`\`\`

### 3. Trigger Component

The Trigger component is the element that opens the accordion when activated. It is responsible for:

- Rendering as a button by default (can be customized with \`asChild\`)
- Handling click events to open the accordion
- Managing focus when accordion closes
- Providing proper ARIA attributes

\`\`\`tsx
export type AccordionTriggerProps = React.ComponentProps<'button'> & {
  asChild?: boolean;
};

export const Trigger = ({ asChild, ...props }: AccordionTriggerProps) => (
  <AccordionContext.Consumer>
    {({ open, setOpen }) => (
      <button onClick={() => setOpen(!open)} {...props} />
    )}
  </AccordionContext.Consumer>
);
\`\`\`

### 4. Content Component

The Content component is the element that contains the accordion content. It is responsible for:

- Rendering the content when the accordion is open
- Providing proper ARIA attributes

\`\`\`tsx
export type AccordionContentProps = React.ComponentProps<'div'> & {
  asChild?: boolean;
};

export const Content = ({ asChild, ...props }: AccordionContentProps) => (
  <AccordionContext.Consumer>
    {({ open }) => <div {...props} />}
  </AccordionContext.Consumer>
);
\`\`\`

### 5. Putting it all together

Now that we have all the components, we can put them together in our original file.

\`\`\`tsx
import * as Accordion from '@/components/ui/accordion';

const data = [
  {
    title: 'Accordion 1',
    content: 'Accordion 1 content',
  },
  {
    title: 'Accordion 2',
    content: 'Accordion 2 content',
  },
  {
    title: 'Accordion 3',
    content: 'Accordion 3 content',
  },
];

return (
  <Accordion.Root open={false} setOpen={() => {}}>
    {data.map((item) => (
      <Accordion.Item key={item.title}>
        <Accordion.Trigger>{item.title}</Accordion.Trigger>
        <Accordion.Content>{item.content}</Accordion.Content>
      </Accordion.Item>
    ))}
  </Accordion.Root>
);
\`\`\`

## Naming Conventions

When building composable components, consistent naming conventions are crucial for creating intuitive and predictable APIs. Both shadcn/ui and Radix UI follow established patterns that have become the de facto standard in the React ecosystem.

### Root Components

The \`Root\` component serves as the main container that wraps all other sub-components. It typically manages shared state and context by providing a context to all child components.

\`\`\`tsx
<AccordionRoot>{/* Child components */}</AccordionRoot>
\`\`\`

### Interactive Elements

Interactive components that trigger actions or toggle states use descriptive names:

- \`Trigger\` - The element that initiates an action (opening, closing, toggling)
- \`Content\` - The element that contains the main content being shown/hidden

\`\`\`tsx
<CollapsibleTrigger>Click to expand</CollapsibleTrigger>
<CollapsibleContent>
  Hidden content revealed here
</CollapsibleContent>
\`\`\`

### Content Structure

For components with structured content areas, use semantic names that describe their purpose:

- \`Header\` - Top section containing titles or controls
- \`Body\` - Main content area
- \`Footer\` - Bottom section for actions or metadata

\`\`\`tsx
<DialogHeader>
  {/* Dialog title */}
</DialogHeader>
<DialogBody>
  {/* Dialog content */}
</DialogBody>
<DialogFooter>
  {/* Dialog footer */}
</DialogFooter>
\`\`\`

### Informational Components

Components that provide information or context use descriptive suffixes:

- \`Title\` - Primary heading or label
- \`Description\` - Supporting text or explanatory content

\`\`\`tsx
<CardTitle>Project Statistics</CardTitle>
<CardDescription>
  View your project's performance over time
</CardDescription>
\`\`\``,

    accessibility: `# Accessibility

Accessibility (a11y) is not an optional feature—it's a fundamental requirement for modern web components. Every component must be usable by everyone, including people with visual, motor, auditory, or cognitive disabilities.

This guide is a non-exhaustive list of accessibility principles and patterns that you should follow when building components.

## Core Principles

### 1. Semantic HTML First

Always start with the most appropriate HTML element. Semantic HTML provides built-in accessibility features that custom implementations often miss.

\`\`\`tsx
// ❌ Don't reinvent the wheel
<div onClick={handleClick} className="button">
  Click me
</div>

// ✅ Use semantic elements
<button onClick={handleClick}>
  Click me
</button>
\`\`\`

Semantic elements come with proper role announcements, keyboard interaction, focus management, and form participation.

### 2. Keyboard Navigation

Every interactive element must be keyboard accessible. Users should be able to navigate, activate, and interact with all functionality using only a keyboard.

\`\`\`tsx
// ✅ Complete keyboard support
function Menu() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch(e.key) {
      case 'ArrowDown':
        focusNextItem();
        break;
      case 'ArrowUp':
        focusPreviousItem();
        break;
      case 'Home':
        focusFirstItem();
        break;
      case 'End':
        focusLastItem();
        break;
      case 'Escape':
        closeMenu();
        break;
    }
  };

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {/* menu items */}
    </div>
  );
}
\`\`\`

### 3. Screen Reader Support

Ensure all content and interactions are announced properly to screen readers using ARIA attributes when necessary.

\`\`\`tsx
// ✅ Proper ARIA labeling
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ✅ Dynamic content announcements
<div aria-live="polite" aria-atomic="true">
  {isLoading && <span>Loading results...</span>}
  {results && <span>{results.length} results found</span>}
</div>
\`\`\`

### 4. Visual Accessibility

Support users with visual impairments through proper contrast, focus indicators, and responsive text sizing.

\`\`\`css
/* ✅ Visible focus indicators */
button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* ✅ Sufficient color contrast (4.5:1 for normal text, 3:1 for large text) */
.text {
  color: #333; /* Against white: 12.6:1 ratio */
  background: white;
}

/* ✅ Responsive text sizing */
.text {
  font-size: 1rem; /* Respects user preferences */
}
\`\`\`

## ARIA Patterns

### Understanding ARIA

ARIA (Accessible Rich Internet Applications) provides semantic information about elements to assistive technologies. Use ARIA to enhance, not replace, semantic HTML.

It has a few rules that you should follow:

1. Don't use ARIA if you can use semantic HTML
2. Don't change native semantics unless necessary
3. All interactive elements must be keyboard accessible
4. Don't hide focusable elements from assistive technologies
5. All interactive elements must have accessible names

### Common ARIA Attributes

#### Roles

Define what an element is:

\`\`\`tsx
// Widget roles
<div role="button" tabIndex={0} onClick={handleClick}>
  Custom Button
</div>

// Landmark roles
<div role="navigation" aria-label="Breadcrumb">
  {/* breadcrumb items */}
</div>

// Live region roles
<div role="alert">
  Error: Invalid email address
</div>
\`\`\`

#### States

Describe the current state of an element:

\`\`\`tsx
// Checked state
<div
  role="checkbox"
  aria-checked={isChecked}
  tabIndex={0}
>
  Accept terms
</div>

// Expanded state
<button
  aria-expanded={isOpen}
  aria-controls="panel-1"
>
  Toggle Panel
</button>
<div id="panel-1" hidden={!isOpen}>
  Panel content
</div>

// Selected state
<li
  role="option"
  aria-selected={isSelected}
>
  Option 1
</li>
\`\`\`

#### Properties

Provide additional information:

\`\`\`tsx
// Labels and descriptions
<input
  aria-label="Search"
  aria-describedby="search-help"
  type="search"
/>
<span id="search-help">Press Enter to search</span>

// Relationships
<button aria-controls="modal-1">Open Modal</button>
<div id="modal-1" role="dialog">{/* modal content */}</div>

// Required and invalid
<input
  aria-required="true"
  aria-invalid={hasError}
  aria-errormessage="email-error"
/>
<span id="email-error">Please enter a valid email</span>
\`\`\`

## Component Patterns

### Modal/Dialog

Modals require careful focus management and keyboard trapping:

\`\`\`tsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement;

      // Focus first focusable element in modal
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousFocus.current?.focus();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <button
        onClick={onClose}
        aria-label="Close dialog"
      >
        ×
      </button>
      {children}
    </div>
  );
}
\`\`\`

### Tabs

Tab interfaces require specific ARIA patterns and keyboard navigation:

\`\`\`tsx
function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch(e.key) {
      case 'ArrowLeft':
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveTab(newIndex);
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={\`tab-\${index}\`}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={\`panel-\${index}\`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          id={\`panel-\${index}\`}
          role="tabpanel"
          aria-labelledby={\`tab-\${index}\`}
          hidden={activeTab !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
\`\`\`

## Focus Management

### Focus Visible

Show focus indicators only for keyboard navigation:

\`\`\`css
/* Remove default outline */
*:focus {
  outline: none;
}

/* Show outline only for keyboard focus */
*:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
\`\`\`

### Focus Trapping

Keep focus within a specific region (like modals).

### Focus Restoration

Return focus to the appropriate element after interactions close.

## Color and Contrast

### Contrast Requirements

Follow WCAG guidelines for color contrast:
- Normal text (< 18pt or < 14pt bold): 4.5:1 ratio minimum
- Large text (≥ 18pt or ≥ 14pt bold): 3:1 ratio minimum
- Non-text elements (icons, borders): 3:1 ratio minimum

### Color Independence

Never convey information through color alone:

\`\`\`tsx
// ❌ Color only
<span className="text-red-500">Error</span>

// ✅ Color with text/icon
<span className="text-red-500">
  <ErrorIcon aria-hidden="true" />
  <span>Error: Invalid input</span>
</span>
\`\`\`

## Mobile Accessibility

### Touch Targets

Ensure touch targets are large enough:
- Minimum 44x44px for iOS
- Minimum 48x48dp for Android

### Viewport and Zoom

Allow users to zoom - never use \`user-scalable=no\` or \`maximum-scale=1\`.

## Common Pitfalls

### Placeholder Text as Labels
Don't use placeholders as the only label - they disappear when typing.

### Empty Buttons
Always provide accessible text for icon buttons with \`aria-label\` or visually hidden text.

### Disabled Form Elements
Use \`aria-disabled\` instead of \`disabled\` when you need users to understand why something is disabled.`,

    designTokens: `# Design Tokens

One of the core foundations of modern component libraries lies in their thoughtful approach to styling. Rather than hardcoding colors or creating rigid class systems, we can employ a semantic naming convention that separates the concerns of theme, context, and usage.

This semantic naming convention is known as design tokens. This architectural decision creates a maintainable, flexible system that scales beautifully across applications.

## The Philosophy of Semantic CSS Variables

Traditional CSS approaches often couple color values directly to their usage contexts, creating brittle systems that are difficult to maintain. Design tokens take a different approach by creating layers of abstraction that separate what something is from how it looks.

## Understanding the Variable Architecture

Let's examine how we can structure our CSS variables to create this flexible system:

\`\`\`css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
}
\`\`\`

In the above example, we have four design tokens:

- \`--background\`, which is used for background colors (primarily the background of the page)
- \`--foreground\`, which is used for foreground colors (the general text color)
- \`--primary\`, which is used for primary colors (the main color of the brand)
- \`--primary-foreground\`, which is used for primary foreground colors (the text color, as seen against the primary color)`,

    state: `# State

Building flexible components that work in both controlled and uncontrolled modes is a hallmark of professional components.

## Uncontrolled State

Uncontrolled state is when the component manages its own state internally. This is the default usage pattern for most components.

For example, here's a simple \`Stepper\` component that manages its own state internally:

\`\`\`tsx
import { useState } from 'react';

export const Stepper = () => {
  const [value, setValue] = useState(0);

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue(value + 1)}>Increment</button>
    </div>
  );
};
\`\`\`

## Controlled State

Controlled state is when the component's state is managed by the parent component. Rather than keeping track of the state internally, we delegate this responsibility to the parent component.

Let's rework the \`Stepper\` component to be controlled by the parent component:

\`\`\`tsx
type StepperProps = {
  value: number;
  setValue: (value: number) => void;
};

export const Stepper = ({ value, setValue }: StepperProps) => (
  <div>
    <p>{value}</p>
    <button onClick={() => setValue(value + 1)}>Increment</button>
  </div>
);
\`\`\`

## Merging states

The best components support both controlled and uncontrolled state. This allows the component to be used in a variety of scenarios, and to be easily customized.

Radix UI maintains an internal utility for merging controllable and uncontrolled state called \`use-controllable-state\`.

Let's install the hook:

\`\`\`bash
npm install @radix-ui/react-use-controllable-state
\`\`\`

This lightweight hook gives you the same state management patterns used internally by Radix UI's component library, ensuring your components behave consistently with industry standards.

The hook accepts three main parameters and returns a tuple with the current value and setter. Let's use it to merge the controlled and uncontrolled state of the \`Stepper\` component:

\`\`\`tsx
import { useControllableState } from '@radix-ui/react-use-controllable-state';

type StepperProps = {
  value: number;
  defaultValue: number;
  onValueChange: (value: number) => void;
};

export const Stepper = ({ value: controlledValue, defaultValue, onValueChange }: StepperProps) => {
  const [value, setValue] = useControllableState({
    prop: controlledValue,        // The controlled value prop
    defaultProp: defaultValue,    // Default value for uncontrolled mode
    onChange: onValueChange,      // Called when value changes
  });

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue(value + 1)}>Increment</button>
    </div>
  );
}
\`\`\``,

    styling: `# Styling

Modern component libraries need flexible styling systems that can handle complex requirements without sacrificing developer experience. The combination of Tailwind CSS with intelligent class merging has emerged as a powerful pattern for building customizable components.

This approach solves the fundamental tension between providing sensible defaults and allowing complete customization - a challenge that has plagued component libraries for years.

## The problem with traditional styling

Traditional CSS approaches often lead to specificity wars, style conflicts, and unpredictable overrides. When you pass \`className="bg-blue-500"\` to a component that already has \`bg-red-500\`, which one wins?

Without proper handling, both classes apply and the result depends on a lot of factors - CSS source order, the specificity of the classes, the bundler's class merging algorithm, etc.

## Merging classes intelligently

The \`tailwind-merge\` library solves this by understanding Tailwind's class structure and intelligently resolving conflicts. When two classes target the same CSS property, it keeps only the last one.

\`\`\`tsx
// Without tailwind-merge
// Both bg-red-500 and bg-blue-500 apply - unpredictable result
<Button className="bg-blue-500" />
// Renders: className="bg-red-500 bg-blue-500"

// With tailwind-merge
import { twMerge } from 'tailwind-merge';

// bg-blue-500 wins as it comes last
const className = twMerge('bg-red-500', 'bg-blue-500');
// Returns: "bg-blue-500"
\`\`\`

## Conditional classes

Often you need to apply classes conditionally based on props or state. The \`clsx\` library provides a clean API for this:

\`\`\`tsx
import clsx from 'clsx';

// Basic conditionals
clsx('base', isActive && 'active');
// Returns: "base active" (if isActive is true)

// Object syntax
clsx('base', {
  'active': isActive,
  'disabled': isDisabled,
});

// Arrays
clsx(['base', isLarge ? 'text-lg' : 'text-sm']);
\`\`\`

## The \`cn\` utility function

The \`cn\` function, popularized by shadcn/ui, combines \`clsx\` and \`tailwind-merge\` to give you both conditional logic and intelligent merging:

\`\`\`tsx
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
\`\`\`

The power comes from the ordering - base styles first, conditionals second, user overrides last. This ensures predictable behavior while maintaining full customization.

## Class Variance Authority (CVA)

For complex components with many variants, manually managing conditional classes becomes unwieldy. Class Variance Authority (CVA) provides a declarative API for defining component variants.

\`\`\`tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
\`\`\`

## Best practices

### 1. Order matters

Always apply classes in this order:
1. Base styles (always applied)
2. Variant styles (based on props)
3. Conditional styles (based on state)
4. User overrides (className prop)

\`\`\`tsx
className={cn(
  'base-styles',            // 1. Base
  variant && variantStyles, // 2. Variants
  isActive && 'active',     // 3. Conditionals
  className                 // 4. User overrides
)}
\`\`\`

### 2. Document your variants

Use TypeScript and JSDoc to document what each variant does.

### 3. Extract repeated patterns

If you find yourself writing the same conditional logic repeatedly, extract it:

\`\`\`tsx
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
export const disabled = 'disabled:pointer-events-none disabled:opacity-50';

// Use in components
className={cn(focusRing, disabled, className)}
\`\`\`

## Performance considerations

1. **Define variants outside components** - CVA variants should be defined outside the component to avoid recreation on every render.

2. **Memoize complex computations** - If you have expensive conditional logic, consider memoizing.

3. **Use CSS variables for dynamic values** - Instead of generating classes dynamically, use CSS variables.`,

    types: `# Types

When building reusable components, proper typing is essential for creating flexible, customizable, and type-safe interfaces. By following established patterns for component types, you can ensure your components are both powerful and easy to use.

## Single Element Wrapping

Each exported component should ideally wrap a single HTML or JSX element. This principle is fundamental to creating composable, customizable components.

When a component wraps multiple elements, it becomes difficult to customize specific parts without prop drilling or complex APIs. Consider this anti-pattern:

\`\`\`tsx
const Card = ({ title, description, footer, ...props }) => (
  <div {...props}>
    <div className="card-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <div className="card-footer">
      {footer}
    </div>
  </div>
);
\`\`\`

This approach creates several problems:
- You can't customize the header styling without adding more props
- You can't control the HTML elements used for title and description
- You're forced into a specific DOM structure

Instead, each layer should be its own component.

The benefits of this approach are:
- **Maximum customization** - Users can style and modify each layer independently
- **No prop drilling** - Props go directly to the element that needs them
- **Semantic HTML** - Users can see and control the exact DOM structure
- **Better accessibility** - Direct control over ARIA attributes and semantic elements
- **Simpler mental model** - One component = one element

## Extending HTML Attributes

Every component should extend the native HTML attributes of the element it wraps. This ensures users have full control over the underlying HTML element.

### Basic Pattern

\`\`\`tsx
export type CardRootProps = React.ComponentProps<'div'> & {
  // Add your custom props here
  variant?: 'default' | 'outlined';
};

export const CardRoot = ({ variant = 'default', ...props }: CardRootProps) => (
  <div {...props} />
);
\`\`\`

### Common HTML Attribute Types

React provides type definitions for all HTML elements. Use the appropriate one for your component:

\`\`\`tsx
// For div elements
type DivProps = React.ComponentProps<'div'>;

// For button elements
type ButtonProps = React.ComponentProps<'button'>;

// For input elements
type InputProps = React.ComponentProps<'input'>;

// For form elements
type FormProps = React.ComponentProps<'form'>;

// For anchor elements
type LinkProps = React.ComponentProps<'a'>;
\`\`\`

## Exporting Types

Always export your component prop types. This makes them accessible to consumers for various use cases.

Exporting types enables several important patterns:

\`\`\`tsx
// 1. Extracting specific prop types
import type { CardRootProps } from '@/components/ui/card';
type variant = CardRootProps['variant'];

// 2. Extending components
export type ExtendedCardProps = CardRootProps & {
  isLoading?: boolean;
};

// 3. Creating wrapper components
const MyCard = (props: CardRootProps) => (
  <CardRoot {...props} className={cn('my-custom-class', props.className)} />
);
\`\`\`

Your exported types should be named \`<ComponentName>Props\`.

## Best Practices

### 1. Always Spread Props Last

Ensure users can override any default props:

\`\`\`tsx
// ✅ Good - user props override defaults
<div className="default-class" {...props} />

// ❌ Bad - defaults override user props
<div {...props} className="default-class" />
\`\`\`

### 2. Avoid Prop Name Conflicts

Don't use prop names that conflict with HTML attributes unless intentionally overriding:

\`\`\`tsx
// ❌ Bad - conflicts with HTML title attribute
export type CardProps = React.ComponentProps<'div'> & {
  title: string; // This conflicts with the HTML title attribute
};

// ✅ Good - use a different name
export type CardProps = React.ComponentProps<'div'> & {
  heading: string;
};
\`\`\`

### 3. Document Custom Props

Add JSDoc comments to custom props for better developer experience:

\`\`\`tsx
export type DialogProps = React.ComponentProps<'div'> & {
  /** Whether the dialog is currently open */
  open: boolean;
  /** Callback when the dialog requests to be closed */
  onOpenChange: (open: boolean) => void;
  /** Whether to render the dialog in a portal */
  modal?: boolean;
};
\`\`\``,

    polymorphism: `# Polymorphism

The \`as\` prop is a fundamental pattern in modern React component libraries that allows you to change the underlying HTML element or component that gets rendered.

Popularized by libraries like Styled Components, Emotion, and Chakra UI, this pattern provides flexibility in choosing semantic HTML while maintaining component styling and behavior.

The \`as\` prop enables polymorphic components - components that can render as different element types while preserving their core functionality:

\`\`\`tsx
<Button as="a" href="/home">
  Go Home
</Button>

<Button as="button" type="submit">
  Submit Form
</Button>

<Button as="div" role="button" tabIndex={0}>
  Custom Element
</Button>
\`\`\`

## Understanding \`as\`

The \`as\` prop allows you to override the default element type of a component. Instead of being locked into a specific HTML element, you can adapt the component to render as any valid HTML tag or even another React component.

## Implementation Methods

There are two main approaches to implementing polymorphic components: a manual implementation and using Radix UI's \`Slot\` component.

### Manual Implementation

\`\`\`tsx
// Simplified implementation
function Component({
  as: Element = 'div',
  children,
  ...props
}) {
  return <Element {...props}>{children}</Element>;
}

// More complete implementation with TypeScript
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<E>;

function Component<E extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Element = as || 'div';
  return <Element {...props}>{children}</Element>;
}
\`\`\`

### Using Radix UI Slot

Radix UI provides a \`Slot\` component that offers a more powerful alternative to the \`as\` prop pattern. Instead of just changing the element type, \`Slot\` merges props with the child component, enabling composition patterns.

\`\`\`tsx
import { Slot } from "@radix-ui/react-slot"

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}
\`\`\`

### Comparison: \`as\` vs \`asChild\`

| Feature | \`as\` prop | \`asChild\` + Slot |
|---------|-----------|------------------|
| **API Style** | \`<Button as="a">\` | \`<Button asChild><a /></Button>\` |
| **Element Type** | Specified in prop | Inferred from child |
| **Component Composition** | Limited | Full support |
| **Prop Merging** | Basic spread | Intelligent merging |
| **Ref Forwarding** | Manual setup needed | Built-in |
| **Event Handlers** | May conflict | Composed correctly |

### When to Use Each Approach

**Use \`as\` prop when:**
- You want a simpler API surface
- You're primarily switching between HTML elements
- You want to avoid additional dependencies

**Use \`asChild\` + Slot when:**
- You need to compose with other components
- You want automatic prop merging behavior
- You're building a component library similar to Radix UI or shadcn/ui
- You need reliable ref forwarding across different component types

## Key Benefits

### 1. Semantic HTML Flexibility

The \`as\` prop ensures you can always use the most semantically appropriate HTML element.

### 2. Component Reusability

One component can serve multiple purposes without creating variants.

### 3. Accessibility Improvements

Choose elements that provide the best accessibility for each context.

### 4. Style System Integration

Maintain consistent styling while changing elements.

## Best Practices

### 1. Default to Semantic Elements

Choose meaningful defaults that represent the most common use case.

### 2. Document Valid Elements

Clearly specify which elements are supported.

### 3. Validate Element Appropriateness

Warn when inappropriate elements are used.

### 4. Handle Event Handlers Properly

Ensure event handlers work across different elements.

## Common Pitfalls

### Invalid HTML Nesting

Be careful about HTML nesting rules.

### Missing Accessibility Attributes

Remember to add appropriate ARIA attributes.

### Type Safety Loss

Avoid using overly permissive types.

### Performance Considerations

Be aware of re-render implications - define custom components outside of render.`,

    asChild: `# asChild

The \`asChild\` prop is a powerful pattern in modern React component libraries. Popularized by Radix UI and adopted by shadcn/ui, this pattern allows you to replace default markup with custom elements while maintaining the component's functionality.

## Understanding \`asChild\`

At its core, \`asChild\` changes how a component renders. When set to \`true\`, instead of rendering its default DOM element, the component merges its props, behaviors, and event handlers with its immediate child element.

### Without \`asChild\`

\`\`\`tsx
<Dialog.Trigger>
  <button>Open Dialog</button>
</Dialog.Trigger>
\`\`\`

This renders nested elements:
\`\`\`html
<button data-state="closed">
  <button>Open Dialog</button>
</button>
\`\`\`

### With \`asChild\`

\`\`\`tsx
<Dialog.Trigger asChild>
  <button>Open Dialog</button>
</Dialog.Trigger>
\`\`\`

This renders a single, merged element:
\`\`\`html
<button data-state="closed">Open Dialog</button>
\`\`\`

The Dialog.Trigger's functionality is composed onto your button, eliminating unnecessary wrapper elements.

## How It Works

Under the hood, \`asChild\` uses React's composition capabilities to merge components:

\`\`\`tsx
// Simplified implementation
function Component({ asChild, children, ...props }) {
  if (asChild) {
    // Clone child and merge props
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      // Merge event handlers
      onClick: (e) => {
        props.onClick?.(e);
        children.props.onClick?.(e);
      }
    });
  }

  // Render default element
  return <button {...props}>{children}</button>;
}
\`\`\`

The component:
1. Checks if \`asChild\` is true
2. Clones the child element
3. Merges props from both parent and child
4. Combines event handlers
5. Returns the enhanced child

## Key Benefits

### 1. Semantic HTML

\`asChild\` lets you use the most appropriate HTML element for your use case.

### 2. Clean DOM Structure

Traditional composition often creates deeply nested DOM structures. \`asChild\` eliminates this "wrapper hell".

### 3. Design System Integration

\`asChild\` enables seamless integration with your existing design system components.

### 4. Component Composition

You can compose multiple behaviors onto a single element.

## Best Practices

### 1. Maintain Accessibility

When changing element types, ensure accessibility is preserved.

### 2. Document Component Requirements

Clearly document when components support \`asChild\`.

### 3. Test Child Components

Verify that custom components work correctly with \`asChild\`.

### 4. Handle Edge Cases

Consider edge cases like conditional rendering.

## Common Pitfalls

### Not Spreading Props

Custom components MUST spread props to receive trigger behavior:

\`\`\`tsx
// ❌ Won't receive trigger behavior
const BadButton = ({ children }) => <button>{children}</button>;

// ✅ Properly receives all props
const GoodButton = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);
\`\`\`

### Multiple Children

Don't pass multiple children to a component that supports \`asChild\`.

### Fragment Children

Don't pass a fragment to a component that supports \`asChild\` - fragments are not valid elements.`,

    dataAttributes: `# Data Attributes

Data attributes provide a powerful way to expose component state and structure to consumers, enabling flexible styling without prop explosion. Modern component libraries use two primary patterns: \`data-state\` for visual states and \`data-slot\` for component identification.

## Styling state with data-state

One of the most common anti-patterns in component styling is exposing separate className props for different states.

In less modern components, you'll often see APIs like this:

\`\`\`tsx
<Dialog
  openClassName="bg-black"
  closedClassName="bg-white"
  classes={{
    open: "opacity-100",
    closed: "opacity-0"
  }}
/>
\`\`\`

This approach has several problems:
- It couples the component's internal state to its styling API
- It creates an explosion of props as components grow more complex
- It makes the component harder to use and maintain
- It prevents styling based on state combinations

### The solution: data-state attributes

Instead, use \`data-*\` attributes to expose component state declaratively. This allows consumers to style components based on state using standard CSS selectors:

\`\`\`tsx
const Dialog = ({ className, ...props }: DialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className={cn('transition-all', className)}
      {...props}
    />
  );
};
\`\`\`

Now consumers can style the component based on state from the outside:

\`\`\`tsx
<Dialog className="data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />
\`\`\`

### Benefits of this approach

1. **Single className prop** - No need for multiple state-specific className props
2. **Composable** - Combine multiple data attributes for complex states
3. **Standard CSS** - Works with any CSS-in-JS solution or plain CSS
4. **Type-safe** - TypeScript can infer data attribute values
5. **Inspectable** - States are visible in DevTools as HTML attributes

### Common state patterns

Use data attributes for all kinds of component state:

\`\`\`tsx
// Open/closed state
<Accordion data-state={isOpen ? 'open' : 'closed'} />

// Selected state
<Tab data-state={isSelected ? 'active' : 'inactive'} />

// Disabled state (in addition to disabled attribute)
<Button data-disabled={isDisabled} disabled={isDisabled} />

// Loading state
<Button data-loading={isLoading} />

// Orientation
<Slider data-orientation="horizontal" />

// Side/position
<Tooltip data-side="top" />
\`\`\`

### Integration with Radix UI

This pattern is used extensively by Radix UI, which automatically applies data attributes to its primitives:

- \`data-state\` - open/closed, active/inactive, on/off
- \`data-side\` - top/right/bottom/left (for positioned elements)
- \`data-align\` - start/center/end (for positioned elements)
- \`data-orientation\` - horizontal/vertical
- \`data-disabled\` - present when disabled
- \`data-placeholder\` - present when showing placeholder

## Component identification with data-slot

While \`data-state\` tracks visual states, \`data-slot\` identifies component types within a composition. This pattern, popularized by shadcn/ui, allows parent components to target and style specific child components without relying on fragile class names or element selectors.

### The problem with child targeting

Traditional approaches to styling child components have significant limitations:

\`\`\`tsx
// Relies on element types - breaks if implementation changes
<form className="[&_input]:rounded-lg [&_button]:mt-4" />

// Relies on class names - breaks if classes change
<form className="[&_.text-input]:rounded-lg" />
\`\`\`

### The solution: data-slot attributes

Use \`data-slot\` to give components stable identifiers that can be targeted by parents:

\`\`\`tsx
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        // Target specific child slots
        "has-[>[data-slot=checkbox-group]]:gap-3",
        "has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  );
}
\`\`\`

### Benefits of data-slot

1. **Stable identifiers** - Won't break when implementation details change
2. **Semantic targeting** - Target based on component purpose, not structure
3. **Encapsulation** - Internal classes remain private
4. **Composable** - Works with arbitrary nesting and composition
5. **Type-safe** - Can be validated and documented

### Naming conventions

Follow these conventions for consistent \`data-slot\` naming:

1. **Use kebab-case** - \`data-slot="form-field"\` not \`data-slot="formField"\`
2. **Be specific** - \`data-slot="submit-button"\` not \`data-slot="button"\`
3. **Match component purpose** - Name reflects what it does, not how it looks
4. **Avoid implementation details** - \`data-slot="user-avatar"\` not \`data-slot="rounded-image"\`

## When to use data attributes vs props

### \`data-state\` use cases
- Visual states - open/closed, active/inactive, loading, etc.
- Layout states - orientation, side, alignment
- Interaction states - hover, focus, disabled

### \`data-slot\` use cases
- Component identification - Stable identifiers for targeting
- Composition patterns - Parent-child relationships
- Global styling - Theme-wide component styling
- Variant-independent targeting - Target any variant of a component

### \`props\` use cases
- Variants - Different visual designs (primary, secondary, destructive)
- Sizes - sm, md, lg
- Behavioral configuration - controlled/uncontrolled, default values
- Event handlers - onClick, onChange, etc.`,

    docs: `# Docs

Good documentation is essential for making your components accessible and easy to use. This guide outlines the key elements every component documentation page should include.

## Documentation Framework

To scale your documentation, you can use a documentation framework. Popular options include:

- **Fumadocs** - Fast, feature-rich documentation framework for Next.js
- **Nextra** - Markdown-based documentation with built-in search and theming
- **Content Collections** - Type-safe content management for documentation
- **Docusaurus** - Feature-rich documentation sites with versioning support
- **VitePress** - Vue-powered static site generator optimized for documentation

Preferably, your framework choice should support syntax highlighting, custom components and be generally well designed.

## Essential Documentation Sections

### Overview

Start with a brief introduction explaining what the component does and when to use it.

### Demo, Source Code, and Preview

For a great first impression for developers, you should include a demo that shows the component in action, as well as the code used to create the demo.

### Installation

Include a clear instruction on how to install the component. Preferably this should be a single command you can copy and paste into your terminal.

### Features

List the key features of your component to help users quickly understand its capabilities and advantages. For example:

- **Customizable** – Easily adjust styles, sizes, and behavior to fit your needs.
- **Accessible by default** – Follows best practices for keyboard navigation, ARIA roles, and screen reader support.
- **Composable** – Designed to work seamlessly with other components and patterns.
- **Type-safe** – Ships with comprehensive TypeScript types for maximum safety and autocomplete.
- **Theming support** – Integrates with your design tokens or theme system.
- **Lightweight** – Minimal dependencies and optimized for performance.
- **SSR/SSG ready** – Works with server-side and static rendering frameworks.
- **Well-documented** – Includes clear usage examples and API reference.

### Examples

Demonstrate the component's flexibility with practical examples:

- **Variants** - Different visual styles or sizes available
- **States** - Loading, disabled, error, or success states
- **Advanced Usage** - Complex scenarios and edge cases
- **Composition** - How the component works with other components
- **Responsive Behavior** - How it adapts to different screen sizes

### Props and API Reference

Document all available props, methods, and configuration options. For each prop, include:

- **Name** - The prop identifier
- **Type** - TypeScript type definition
- **Default** - Default value if not specified
- **Required** - Whether the prop is mandatory
- **Description** - What the prop does and when to use it

### Accessibility

Document how your component supports accessibility features:

- Keyboard navigation patterns
- ARIA attributes and roles
- Screen reader support
- Focus management
- Color contrast considerations

### Changelog and Versioning

Maintain a changelog covering:

- Version numbers following semantic versioning
- New features and enhancements
- Bug fixes
- Breaking changes
- Migration guides for major version updates

## Best Practices

- Keep documentation up-to-date with code changes
- Use real-world examples that solve actual problems
- Include common pitfalls and troubleshooting tips
- Provide performance considerations when relevant
- Link to related components and patterns
- Make all code examples runnable and tested`,

    registry: `# Registry

Component registries are a way to share and discover UI components. Popularized by shadcn/ui, they allow you to discover and copy components directly into your projects.

Registries represent a fundamental shift in how developers share and discover UI components. Unlike traditional npm packages, registries rely on an open source model and work through downloading the source code to your project.

## What Makes a Registry?

### 1. Source Code Distribution

Unlike npm packages that distribute compiled code, registries distribute source code:

\`\`\`typescript
// Traditional npm package
import { Button } from 'some-ui-library';

// Registry-based component
// Copy source from registry into your project
// src/components/ui/button.tsx contains the full source
import { Button } from '@/components/ui/button';
\`\`\`

### 2. Metadata and Configuration

Good registries include rich metadata about components like the name, description, dependencies, and category.

### 3. Preview and Documentation

Registry websites typically provide:
- Live component previews
- Interactive examples
- Detailed documentation
- Code snippets ready to copy

## Registry Architecture Benefits

### For Authors

- **Easy Distribution** - Once created, components are instantly accessible
- **Version Control** - Track versions, changelogs, and compatibility
- **Community Engagement** - Receive feedback, issues, and contributions

### For Consumers

- **Discovery** - Browse by category, search, view metrics
- **Preview** - Try components before adopting
- **True Ownership** - Copy source code directly, no dependencies

## Creating a Registry

You need 3 core elements:

### 1. Components
Create well-documented components with source code.

### 2. A public endpoint
Create a public endpoint that serves the components (JSON file or website).

### 3. CLI
Create a CLI for installation (e.g., \`npx myregistry add button\`).

## Using the shadcn Registry

You can publish components using Vercel's static hosting in under 5 minutes:

1. Create a folder with \`public/\` containing your component JSON
2. Add a \`vercel.json\` with CORS headers
3. Deploy with \`vercel --prod\`
4. Install with \`npx shadcn@latest add https://your-project.vercel.app/component.json\``,

    marketplaces: `# Marketplaces

Component marketplaces represent another new paradigm in how developers share and discover UI components. Platforms like 21st.dev have emerged as centralized hubs where creators can publish components and consumers can discover, preview, and install them seamlessly.

## How Marketplaces Work

When you publish to a marketplace, the platform typically:

1. **Hosts your component code** - No need to manage your own infrastructure
2. **Provides a unified CLI** - Users install components through the marketplace's tooling
3. **Generates previews** - Live demos and interactive examples are created automatically
4. **Handles discovery** - Search, categories, and recommendations surface relevant components

## Benefits of Component Marketplaces

### For Component Authors

- **Distribution Without Infrastructure** - No hosting or CDN management
- **Built-in Audience** - Organic discovery through search and recommendations
- **Monetization Opportunities** - Premium tiers, sponsorships, usage-based pricing
- **Community Feedback** - Ratings, comments, analytics, issue tracking

### For Component Consumers

- **Curated Discovery** - Browse by category (Marketing, Application, E-commerce, etc.)
- **Quality Assurance** - Review processes, code quality checks, accessibility audits
- **Unified Tooling** - Single CLI for all marketplace components

## Challenges of Marketplaces

### For Authors

- **Competition and Visibility** - Standing out requires great demos and documentation
- **Platform Dependency** - Subject to platform terms and policies
- **Quality Pressure** - Users expect polished, production-ready components

### For Consumers

- **Variable Quality** - Quality varies despite review processes
- **Lock-in Concerns** - Proprietary formats may make migration difficult
- **Discovery Paradox** - Too much choice can be paralyzing`,

    npm: `# NPM

NPM packages represent the traditional approach to distributing component libraries. While registries have gained popularity for their flexibility, npm publishing remains a powerful option with distinct advantages for certain use cases.

## Package Model

When you publish components as an npm package, you're distributing pre-built, versioned code that users install as a dependency:

\`\`\`bash
npm install @acme/ui-components
\`\`\`

### Advantages

- **Version Management** - You control versioning and updates
- **Simplified Installation** - Single command adds entire library
- **Dependency Resolution** - NPM handles transitive dependencies
- **TypeScript Support** - Pre-built type definitions included

## Limitations of NPM Packages

- **Source Code Ownership** - Users cannot modify code directly
- **Customization Constraints** - Must work within exposed API
- **Bundle Size** - All components included, even if unused

## CSS and Tailwind Configuration

For Tailwind-based components, users need to add a \`@source\` directive:

\`\`\`css
@import "tailwindcss";

/* Tell Tailwind to look for classes in your package */
@source "../node_modules/@acme/ui-components";
\`\`\`

Always document this requirement prominently.

## Publishing Your Component Library

Configure \`package.json\` with proper exports:

\`\`\`json
{
  "name": "@acme/ui-components",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
\`\`\`

NPM packages remain vital for stability, version management, and ease of use. Choose the distribution method that best serves your users' needs.`
  }
};

/**
 * Get the full specification as a single markdown document
 */
export function getFullSpecification(): string {
  let markdown = `# ${SPECIFICATION.title}

${SPECIFICATION.description}

**Authors:** ${SPECIFICATION.authors.join(', ')}

---

`;

  const sectionOrder = [
    'overview',
    'definitions',
    'principles',
    'composition',
    'accessibility',
    'designTokens',
    'state',
    'styling',
    'types',
    'polymorphism',
    'asChild',
    'dataAttributes',
    'docs',
    'registry',
    'marketplaces',
    'npm'
  ];

  for (const key of sectionOrder) {
    const content = SPECIFICATION.sections[key as keyof typeof SPECIFICATION.sections];
    if (content) {
      markdown += content + '\n\n---\n\n';
    }
  }

  return markdown;
}

/**
 * Get a specific section
 */
export function getSection(sectionName: string): string | undefined {
  return SPECIFICATION.sections[sectionName as keyof typeof SPECIFICATION.sections];
}

/**
 * Get all section names
 */
export function getSectionNames(): string[] {
  return Object.keys(SPECIFICATION.sections);
}

/**
 * Search the specification for a term
 */
export function searchSpecification(term: string): Array<{ section: string; matches: string[] }> {
  const results: Array<{ section: string; matches: string[] }> = [];
  const lowerTerm = term.toLowerCase();

  for (const [sectionName, content] of Object.entries(SPECIFICATION.sections)) {
    const lines = content.split('\n');
    const matches: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes(lowerTerm)) {
        matches.push(line.trim());
      }
    }

    if (matches.length > 0) {
      results.push({ section: sectionName, matches: matches.slice(0, 5) }); // Limit to 5 matches per section
    }
  }

  return results;
}
