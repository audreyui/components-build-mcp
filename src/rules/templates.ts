/**
 * Component Templates
 * Pre-built templates that follow all component.build rules
 *
 * FRAMEWORK: React + TypeScript
 *
 * These templates are specifically for React/TypeScript projects.
 * The components.build specification is framework-agnostic, but these
 * templates implement the patterns in React.
 *
 * Future: Add Vue, Svelte, Angular templates as needed.
 */

export interface TemplateOptions {
  name: string;
  element?: string;
  hasVariants?: boolean;
  variants?: string[];
  sizes?: string[];
  isComposable?: boolean;
  hasState?: boolean;
  stateType?: 'open' | 'active' | 'value';
}

/**
 * Generate a basic component following all rules
 */
export function generateBasicComponent(options: TemplateOptions): string {
  const {
    name,
    element = 'div',
    hasVariants = false,
    variants = ['default', 'secondary'],
    sizes = ['default', 'sm', 'lg'],
  } = options;

  const propsName = `${name}Props`;
  const variantsName = `${name.toLowerCase()}Variants`;

  if (hasVariants) {
    return `import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const ${variantsName} = cva(
  // Base styles
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
${variants.map(v => `        ${v}: '',`).join('\n')}
      },
      size: {
${sizes.map(s => `        ${s}: '',`).join('\n')}
      },
    },
    defaultVariants: {
      variant: '${variants[0]}',
      size: '${sizes[0]}',
    },
  }
);

export type ${propsName} = React.ComponentProps<'${element}'> &
  VariantProps<typeof ${variantsName}>;

export const ${name} = forwardRef<HTML${element.charAt(0).toUpperCase() + element.slice(1)}Element, ${propsName}>(
  ({ className, variant, size, ...props }, ref) => (
    <${element}
      ref={ref}
      data-slot="${name.toLowerCase()}"
      className={cn(${variantsName}({ variant, size, className }))}
      {...props}
    />
  )
);

${name}.displayName = '${name}';
`;
  }

  return `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ${propsName} = React.ComponentProps<'${element}'>;

export const ${name} = forwardRef<HTML${element.charAt(0).toUpperCase() + element.slice(1)}Element, ${propsName}>(
  ({ className, ...props }, ref) => (
    <${element}
      ref={ref}
      data-slot="${name.toLowerCase()}"
      className={cn('', className)}
      {...props}
    />
  )
);

${name}.displayName = '${name}';
`;
}

/**
 * Generate a composable component with sub-components (Root, Trigger, Content pattern)
 */
export function generateComposableComponent(options: TemplateOptions): string {
  const { name, hasState = true, stateType = 'open' } = options;

  const stateProp = stateType === 'value' ? 'value' : stateType === 'active' ? 'active' : 'open';
  const setStateProp = stateType === 'value' ? 'setValue' : stateType === 'active' ? 'setActive' : 'setOpen';
  const stateValues = stateType === 'open' ? "'open' | 'closed'" : stateType === 'active' ? "'active' | 'inactive'" : 'T';

  return `'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type ReactNode,
} from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------------------------------*/

type ${name}ContextValue = {
  ${stateProp}: boolean;
  ${setStateProp}: (value: boolean) => void;
};

const ${name}Context = createContext<${name}ContextValue | undefined>(undefined);

function use${name}Context() {
  const context = useContext(${name}Context);
  if (!context) {
    throw new Error('${name} components must be used within a ${name}.Root');
  }
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------------------------------*/

export type ${name}RootProps = React.ComponentProps<'div'> & {
  /** Controlled ${stateProp} state */
  ${stateProp}?: boolean;
  /** Default ${stateProp} state for uncontrolled usage */
  default${stateProp.charAt(0).toUpperCase() + stateProp.slice(1)}?: boolean;
  /** Callback when ${stateProp} state changes */
  on${stateProp.charAt(0).toUpperCase() + stateProp.slice(1)}Change?: (${stateProp}: boolean) => void;
  children: ReactNode;
};

export const Root = forwardRef<HTMLDivElement, ${name}RootProps>(
  (
    {
      ${stateProp}: controlledState,
      default${stateProp.charAt(0).toUpperCase() + stateProp.slice(1)} = false,
      on${stateProp.charAt(0).toUpperCase() + stateProp.slice(1)}Change,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [${stateProp}, ${setStateProp}] = useControllableState({
      prop: controlledState,
      defaultProp: default${stateProp.charAt(0).toUpperCase() + stateProp.slice(1)},
      onChange: on${stateProp.charAt(0).toUpperCase() + stateProp.slice(1)}Change,
    });

    return (
      <${name}Context.Provider value={{ ${stateProp}: ${stateProp} ?? false, ${setStateProp} }}>
        <div
          ref={ref}
          data-slot="${name.toLowerCase()}"
          data-state={${stateProp} ? '${stateType === 'open' ? 'open' : 'active'}' : '${stateType === 'open' ? 'closed' : 'inactive'}'}
          className={cn('', className)}
          {...props}
        >
          {children}
        </div>
      </${name}Context.Provider>
    );
  }
);

Root.displayName = '${name}.Root';

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * -------------------------------------------------------------------------------------------------*/

export type ${name}TriggerProps = React.ComponentProps<'button'>;

export const Trigger = forwardRef<HTMLButtonElement, ${name}TriggerProps>(
  ({ className, ...props }, ref) => {
    const { ${stateProp}, ${setStateProp} } = use${name}Context();

    return (
      <button
        ref={ref}
        type="button"
        data-slot="${name.toLowerCase()}-trigger"
        data-state={${stateProp} ? '${stateType === 'open' ? 'open' : 'active'}' : '${stateType === 'open' ? 'closed' : 'inactive'}'}
        aria-expanded={${stateProp}}
        onClick={() => ${setStateProp}(!${stateProp})}
        className={cn('', className)}
        {...props}
      />
    );
  }
);

Trigger.displayName = '${name}.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Content
 * -------------------------------------------------------------------------------------------------*/

export type ${name}ContentProps = React.ComponentProps<'div'>;

export const Content = forwardRef<HTMLDivElement, ${name}ContentProps>(
  ({ className, ...props }, ref) => {
    const { ${stateProp} } = use${name}Context();

    if (!${stateProp}) return null;

    return (
      <div
        ref={ref}
        data-slot="${name.toLowerCase()}-content"
        data-state="${stateType === 'open' ? 'open' : 'active'}"
        className={cn('', className)}
        {...props}
      />
    );
  }
);

Content.displayName = '${name}.Content';

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------------------------------*/

export const ${name} = {
  Root,
  Trigger,
  Content,
};
`;
}

/**
 * Generate a button component with full accessibility
 */
export function generateButtonComponent(): string {
  return `import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render as child element instead of button */
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
`;
}

/**
 * Generate a card component with composable sub-components
 */
export function generateCardComponent(): string {
  return `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------------------------------
 * Card Root
 * -------------------------------------------------------------------------------------------------*/

export type CardProps = React.ComponentProps<'div'>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card Header
 * -------------------------------------------------------------------------------------------------*/

export type CardHeaderProps = React.ComponentProps<'div'>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

/* -------------------------------------------------------------------------------------------------
 * Card Title
 * -------------------------------------------------------------------------------------------------*/

export type CardTitleProps = React.ComponentProps<'h3'>;

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

/* -------------------------------------------------------------------------------------------------
 * Card Description
 * -------------------------------------------------------------------------------------------------*/

export type CardDescriptionProps = React.ComponentProps<'p'>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

/* -------------------------------------------------------------------------------------------------
 * Card Content
 * -------------------------------------------------------------------------------------------------*/

export type CardContentProps = React.ComponentProps<'div'>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

/* -------------------------------------------------------------------------------------------------
 * Card Footer
 * -------------------------------------------------------------------------------------------------*/

export type CardFooterProps = React.ComponentProps<'div'>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';
`;
}

/**
 * Generate an input component with accessibility
 */
export function generateInputComponent(): string {
  return `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.ComponentProps<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
`;
}

export const TEMPLATES = {
  basic: generateBasicComponent,
  composable: generateComposableComponent,
  button: generateButtonComponent,
  card: generateCardComponent,
  input: generateInputComponent,
};
