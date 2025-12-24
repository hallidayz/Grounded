# Grounded App - Master Style Guide

This document serves as the complete reference for all UI patterns, components, and styling conventions used throughout the Grounded application.

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Buttons](#buttons)
4. [Cards & Containers](#cards--containers)
5. [Inputs & Forms](#inputs--forms)
6. [Spacing](#spacing)
7. [Borders & Dividers](#borders--dividers)
8. [Usage Examples](#usage-examples)

---

## Color System

### Core Brand Colors

- **Navy Primary** (`navy-primary`): `#2c5282` - Main brand color, primary buttons
- **Navy Dark** (`navy-dark`): `#1e3a5f` - Headers, emphasis
- **Navy Light** (`navy-light`): `#5b7c99` - Secondary elements

### Accent Colors

- **Yellow Warm** (`yellow-warm`): `#f7c948` - Primary accent, CTAs, highlights
- **Yellow Light** (`yellow-light`): `#ffd166` - Lighter highlights
- **Gold Muted** (`gold-muted`): `#e6b84d` - Subtle accents

### Mood-Driven Colors

- **Calm Sage** (`calm-sage`): `#a8c5a0` - Success states, positive indicators
- **Calm Lavender** (`calm-lavender`): `#c4b5d5` - Mindfulness, peace
- **Warm Coral** (`warm-coral`): `#ffb088` - Compassion, warmth
- **Energized Mint** (`energized-mint`): `#90e0b6` - Energy, vitality

### Neutrals

- **Background Primary** (`bg-primary`): `#fafaf9` - Main background
- **Background Secondary** (`bg-secondary`): `#f8f7f4` - Cards, sections
- **Background Tertiary** (`bg-tertiary`): `#f0eeeb` - Subtle depth
- **Border Soft** (`border-soft`): `#e5e3df` - Gentle dividers
- **Text Primary** (`text-primary`): `#4a5568` - Body text
- **Text Secondary** (`text-secondary`): `#6b7280` - Secondary text
- **Text Tertiary** (`text-tertiary`): `#9ca3af` - Placeholder text

### Dark Mode

- **Dark BG Primary** (`dark-bg-primary`): `#1b3448` - Main dark background
- **Dark BG Secondary** (`dark-bg-secondary`): `#243b53` - Cards in dark mode
- **Dark BG Tertiary** (`dark-bg-tertiary`): `#2d4a5f` - Elevated surfaces
- **Dark Border** (`dark-border`): `#334e68` - Dark borders

---

## Typography

### Headings

```tsx
// H1 - Main headings
<h1 className="text-heading-1">Welcome</h1>
// or
<h1 className={StyleGuide.typography.h1}>Welcome</h1>

// H2 - Section headings
<h2 className="text-heading-2">Section Title</h2>

// H3 - Subsection headings
<h3 className="text-heading-3">Subsection</h3>
```

### Body Text

```tsx
// Primary body text
<p className="text-body">Main content text</p>

// Secondary body text (lighter)
<p className="text-body-secondary">Supporting text</p>
```

### Labels

```tsx
<label className="text-label">Field Label</label>
```

---

## Buttons

### Primary Button (Navy)

Main actions, confirmations, primary CTAs.

```tsx
// Using Tailwind component class
<button className="btn-primary">Save</button>

// Using StyleGuide
<button className={StyleGuide.buttons.primary.full}>Save</button>

// Using helper function
<button className={getButtonClass('primary')}>Save</button>
```

### Accent Button (Yellow)

Important actions, secondary CTAs, highlights.

```tsx
<button className="btn-accent">Accept</button>
<button className={StyleGuide.buttons.accent.full}>Accept</button>
```

### Secondary Button

Cancel, less important actions.

```tsx
<button className="btn-secondary">Cancel</button>
<button className={StyleGuide.buttons.secondary.full}>Cancel</button>
```

### Icon Button

Settings, help, logout (circular).

```tsx
<button className="btn-icon" aria-label="Settings">
  <SettingsIcon />
</button>
```

### Small Button

Compact spaces, inline actions.

```tsx
<button className="btn-small bg-yellow-warm text-text-primary">
  Quick Action
</button>
```

---

## Cards & Containers

### Standard Card

Most common card style for content sections.

```tsx
<div className="card-standard">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Elevated Card

Modals, important content, overlays.

```tsx
<div className="card-elevated">
  <h2>Important Content</h2>
</div>
```

### Subtle Card

Backgrounds, nested content.

```tsx
<div className="card-subtle">
  <p>Subtle background content</p>
</div>
```

---

## Inputs & Forms

### Text Input

```tsx
<input 
  type="text"
  className="input-text"
  placeholder="Enter text..."
/>
```

### Textarea

```tsx
<textarea 
  className="input-textarea"
  placeholder="Write your thoughts..."
/>
```

### Checkbox

```tsx
<input 
  type="checkbox"
  className={StyleGuide.inputs.checkbox.full}
/>
```

---

## Spacing

### Section Spacing

```tsx
<div className="section-spacing">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Card Padding

- Standard: `p-4 sm:p-5`
- Large: `p-6 sm:p-8`
- Small: `p-3 sm:p-4`

---

## Borders & Dividers

### Divider

```tsx
<div className="divider"></div>
```

### Card Border

```tsx
<div className="border border-border-soft dark:border-dark-border">
  Content
</div>
```

---

## Usage Examples

### Complete Form Example

```tsx
import { StyleGuide, getButtonClass, getInputClass } from '../services/styleGuide';

const MyForm = () => {
  return (
    <div className="card-standard section-spacing">
      <h2 className={StyleGuide.typography.h2}>Form Title</h2>
      
      <div className="space-y-4">
        <div>
          <label className={StyleGuide.typography.label}>
            Name
          </label>
          <input 
            type="text"
            className={getInputClass('text')}
            placeholder="Enter your name"
          />
        </div>
        
        <div>
          <label className={StyleGuide.typography.label}>
            Message
          </label>
          <textarea 
            className={getInputClass('textarea')}
            placeholder="Write your message..."
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button className={getButtonClass('secondary')}>
          Cancel
        </button>
        <button className={getButtonClass('accent')}>
          Submit
        </button>
      </div>
    </div>
  );
};
```

### Quick Reference

**Always use:**
- ✅ `text-text-primary dark:text-white` for main text
- ✅ `bg-white dark:bg-dark-bg-secondary` for cards
- ✅ `border-border-soft dark:border-dark-border` for borders
- ✅ `font-black uppercase tracking-widest` for buttons
- ✅ Mobile-first responsive classes (`sm:`, `lg:`)

**Never use:**
- ❌ Old color names (`authority-navy`, `brand-accent`, `pure-foundation`)
- ❌ Hardcoded colors (use Tailwind classes)
- ❌ Inconsistent font weights
- ❌ Missing dark mode variants

---

## File Locations

- **TypeScript Style Guide**: `services/styleGuide.ts`
- **Tailwind Component Classes**: `index.css` (in `@layer components`)
- **Color Definitions**: `tailwind.config.js` and `index.css` (CSS variables)
- **Branding Config**: `services/brandingMaster.ts`

---

## Quick Class Reference

| Component | Tailwind Class | StyleGuide Path |
|-----------|---------------|-----------------|
| Primary Button | `btn-primary` | `StyleGuide.buttons.primary.full` |
| Accent Button | `btn-accent` | `StyleGuide.buttons.accent.full` |
| Secondary Button | `btn-secondary` | `StyleGuide.buttons.secondary.full` |
| Standard Card | `card-standard` | `StyleGuide.cards.standard` |
| Heading 1 | `text-heading-1` | `StyleGuide.typography.h1` |
| Text Input | `input-text` | `StyleGuide.inputs.text.full` |
| Textarea | `input-textarea` | `StyleGuide.inputs.textarea.full` |

---

*Last Updated: Based on current codebase patterns*
*Maintained by: Development Team*

