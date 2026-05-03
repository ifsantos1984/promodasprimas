# DESIGN.md - Promo das Primas (Pinterest Inspired)

## Visual Theme & Atmosphere
The design is focused on **visual discovery** and **effortless browsing**. It feels friendly, curated, and premium. The interface recedes to let product imagery take center stage.

- **Atmosphere:** Clean, airy, photography-driven.
- **Density:** High but organized (masonry grid).
- **Corner Radius:** Generous (24px or 32px for main elements).

## Color Palette
Primary brand color is a vibrant Red, used sparingly for calls to action and critical highlights.

| Name | Hex | Role |
|------|-----|------|
| Primary Red | `#E60023` | Branding, Primary CTAs, Notifications |
| Background | `#FFFFFF` | Main surface |
| Surface Light | `#EFEFEF` | Secondary surfaces, Search bar background |
| Text Dark | `#111111` | Main headings and text |
| Text Muted | `#767676` | Secondary labels, metadata |
| Border | `#DDDDDD` | Subtle separators (rarely used) |

## Typography
Clean, geometric sans-serif for readability and modern feel.

- **Headings:** Inter or system-ui, Bold (700).
- **Body:** Inter or system-ui, Medium (500) for UI, Regular (400) for descriptions.
- **Micro-copy:** Monospace for prices/coupons.

## Component Stylings

### Product Cards (The "Pin")
- **Layout:** Vertical stack (Image -> Content).
- **Radius:** `32px` on the top corners of the image, `16px` overall.
- **Shadow:** None by default. Soft elevation on hover.
- **Hover:** Darken overlay on image (10%) + display action buttons (Save/Go).

### Primary Button
- **Shape:** Pill (rounded-full).
- **Background:** Primary Red.
- **Text:** White, Bold.
- **Hover:** Darken (`#AD081B`).

### Search Bar
- **Style:** Wide, pill-shaped.
- **Background:** Surface Light (`#EFEFEF`).
- **Icon:** Muted search icon on the left.

## Layout Principles
- **Grid:** Masonry layout with 2 to 6 columns depending on screen size.
- **Gap:** `16px` between cards.
- **Whitespace:** Large margins on the container to breathe.

## Do's and Don'ts
- **DO:** Use high-quality images.
- **DO:** Keep card labels short (1-2 lines max).
- **DON'T:** Use sharp corners.
- **DON'T:** Use heavy borders or drop shadows on cards.
