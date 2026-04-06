# Design System Document

## 1. Overview & Creative North Star: "The Resonant Sanctuary"
This design system moves away from the "clinical" or "tech-heavy" feel of traditional wellness apps. Our Creative North Star is **The Resonant Sanctuary**. 

Instead of a rigid, boxed-in interface, we treat the screen as a fluid, breathable environment. The system breaks the "standard template" look through **intentional asymmetry** and **atmospheric depth**. We prioritize the user's cognitive load by using "Environmental Nesting"—where content isn't forced into a grid, but rather rests naturally on layered, tonal surfaces. The goal is a digital experience that feels as quiet and intentional as a high-end editorial journal.

---

## 2. Colors: Tonal Atmosphere
The palette is rooted in nature, utilizing bright teal (Primary), soft aqua tints (Secondary), and warm parchment (Surface).

### Primary Color Ramp
Built from the brand primary `#1AABBA`:
- **primary:** `#1AABBA` — Brand teal. Used for CTAs, icons, active states, links.
- **primary-dark:** `#0e918c` — Darker teal for pressed states, text-on-light-teal, and high-contrast needs.
- **primary-container:** `#d4f4f4` — Very light teal tint. Used for subtle teal backgrounds (badges, chips, selected card fills).
- **primary-fixed-dim:** `#a8e4e0` — Mid-light teal. Used for the progress ring track highlight and soft emphasis fills.
- **on-primary:** `#ffffff` — Text/icons placed on top of primary-filled surfaces.
- **on-primary-container:** `#0a5e5c` — Dark teal for text on primary-container backgrounds.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. Use the surface-container tiers to create depth:
- **surface:** `#fbf9f2` — Base parchment layer. Screen backgrounds.
- **surface-container-low:** `#f4f4eb` — Subtle grouping. Card backgrounds on surface.
- **surface-container-high:** `#dcdece` — Elevated containers needing more distinction.
- **surface-container-highest:** `#e2e3d8` — Most prominent cards, active toggles, evening CTA.
- **surface-container-lowest:** `#ffffff` — Floating overlays, frosted glass base.

### Text & Outline Colors
- **on-surface:** `#31332b` — Primary text. Use instead of pure black (#000000), always.
- **on-surface-variant:** `#5e6057` — Secondary/muted text, metadata labels, placeholders.
- **outline-variant:** `#b1b3a8` — Ghost borders only (at 15% opacity max). Never use solid outlines.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be created through background color shifts. For example, a `surface-container-low` (#f4f4eb) content block should sit on a `surface` (#fbf9f2) background. If you feel the need for a line, you have failed to use the spacing scale or tonal shifts effectively.

### The "Glass & Gradient" Rule
To avoid a "flat" or "cheap" appearance, main CTAs and hero headers should utilize a subtle linear gradient transitioning from `primary` (#1AABBA) to `primary-fixed-dim` (#a8e4e0) at a 135-degree angle. Floating elements (like navigation bars) should use a backdrop-blur (12px–20px) with a semi-transparent `surface-container-lowest` (#ffffff) at 80% opacity to create a "frosted glass" effect.

---

## 3. Typography: Editorial Clarity
We pair the architectural stability of **Manrope** for displays with the hyper-legibility of **Inter** for utility and body text.

- **Display (Manrope):** Use `display-lg` (3.5rem) with `-0.04em` tracking for a high-end editorial look. Headlines should be "Optical Center" aligned—often slightly higher than the geometric center to create a sense of lightness.
- **Body (Inter):** `body-lg` (1rem) is the standard for long-form reflection text. Ensure a generous line-height (1.6) to maintain the "spacious" feel requested.
- **Labels (Inter):** Use `label-md` (0.75rem) in `on-surface-variant` (#5e6057) with all-caps and `0.1em` letter spacing for small metadata to differentiate from body text without adding visual weight.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden unless used for floating "Active" states.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" that mimics paper on a desk.

### Ambient Shadows
If a floating effect is required (e.g., a modal), use an **Ambient Shadow**:
- **Blur:** 40px
- **Spread:** -10px
- **Color:** `on-surface` (#31332b) at 6% opacity.
- *Result:* A soft, atmospheric glow that feels like a shadow cast in a sunlit room, not a digital effect.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**: `outline-variant` (#b1b3a8) at 15% opacity. Never use 100% opaque outlines.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` #1AABBA to `primary-fixed-dim` #a8e4e0 at 135°), `on-primary` text, `full` (9999px) roundedness. No shadow.
- **Secondary:** `surface-container-highest` fill with `on-surface` text.
- **Tertiary:** No fill. `primary` (#1AABBA) text weight 600.
- **Interaction:** On hover, primary buttons should subtly scale to 102% rather than changing color harshly. On press (mobile), scale to 97%.

### Cards & Lists
**Forbid divider lines.** Separate list items using the spacing scale (e.g., `spacing-4` or 1.4rem) or by alternating background tones between `surface` and `surface-container-low`. Cards should use `rounded-xl` (1.5rem) to feel organic and soft to the touch.

### Input Fields
Inputs should be "Minimalist Underlines" or "Soft Wells." Avoid boxes. Use a `surface-container-high` background with a `rounded-md` corner. The label should always persist in `label-sm` to ensure the user feels "grounded."

### Specialized Component: The "Progress Ring Player"
The activity player uses a minimal circular play/pause button (72–80px diameter) surrounded by a thin progress ring arc that fills as the session progresses.

**Structure:**
- **Progress ring:** An SVG circle (stroke-only, 4px width) surrounding the play button. The track uses `primary` (#1AABBA) at 12% opacity. The active arc uses a gradient from `primary` (#1AABBA) to `primary-fixed-dim` (#a8e4e0), with `stroke-linecap: round`.
- **Play/Pause button:** Centered inside the ring. Gradient fill from `primary` (#1AABBA) to a lighter teal (#3bbfb2) at 135°. Icon is `on-primary` (#ffffff). 72px diameter, fully rounded.
- **Phase label:** Text above the ring showing the current breathing phase ("Inhale", "Hold", "Exhale"). Uses `label-md` style in `on-surface-variant`. Crossfades between states with a 500ms transition.
- **Timer pill:** Sits above the phase label. `surface-container-low` background (or `primary` at 8% opacity), pill-shaped (9999px radius), no border. Clock icon in `primary`, time text in `on-surface`.

**Behavior:**
- Idle: Gentle pulse on the play button (scale 1.0 ↔ 1.02 over 3s, sinusoidal easing).
- Active: Arc fills proportionally to elapsed time. Phase label crossfades every 4 seconds (for box breathing 4-4-4-4 pattern).
- All transitions ≥300ms, easing: `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 6. Do's and Don'ts

### Do
- **Do** embrace white space. If a layout feels "empty," leave it. It creates "mental room."
- **Do** use asymmetrical spacing. Align text to the left but place illustrative elements slightly off-center to create a bespoke, non-templated feel.
- **Do** use the `24` (8.5rem) spacing token for top-of-page margins to let headers breathe.

### Don't
- **Don't** use pure black (#000000). Use `on-surface` (#31332b) for all "black" text.
- **Don't** use sharp corners. Everything must have at least a `rounded-sm` (0.25rem) radius to maintain the "soft" brand promise.
- **Don't** use "Pop" animations. All transitions must be slow (300ms+) and utilize soft fades or slides.
- **Don't** use the old sage green (#4e6450) — the brand primary is teal (#1AABBA).
