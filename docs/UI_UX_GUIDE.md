# Travel-Doc — UI/UX Design System Guide

## 1. Design Philosophy
Travel-Doc is designed as a serene, modern, and inspiring travel companion. The aesthetic rejects harsh neon gradients or generic enterprise dashboard styling in favor of organic, travel-inspired warmth:
- **Tone**: Exploratory, calm, reliable, refined.
- **Visuals**: Clean card-based layouts, natural earth tones, high-clarity typography, and crisp map visualizations.

---

## 2. Color Palette
Built directly into the Tailwind configuration:

| Semantic Token | Tailwind / Hex | Description & Usage |
|---|---|---|
| **Primary (Forest Green)** | `emerald-800` (`#065f46`) / `forest-800` | Navigation highlights, primary CTA buttons, active markers |
| **Primary Light** | `emerald-600` (`#059669`) | Button hover states, secondary highlights |
| **Accent (Warm Terracotta)**| `amber-700` (`#b45309`) / `rose-700` | Badges, high priority labels, farthest stop marker |
| **Background (Warm White)** | `#fdfbf7` / `stone-50` | Body and card background canvas, avoiding clinical harsh white |
| **Surface (Card & Modal)** | `#ffffff` | Pure white for elevated cards and dropdown panels |
| **Muted Earth (Slate/Stone)**| `stone-600` / `stone-400` | Body text, subtle borders, captions |
| **Text Primary** | `stone-900` (`#1c1917`) | Main heading and high-contrast text |
| **Status Visited (Teal/Sage)** | `teal-600` (`#0d9488`) | Visited destinations, completed journey markers |

---

## 3. Typography
- **Primary Body & Headings**: Inter or system sans-serif stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Hierarchy**:
  - `h1`: `text-3xl font-bold tracking-tight text-stone-900`
  - `h2`: `text-2xl font-semibold tracking-tight text-stone-800`
  - `h3`: `text-xl font-medium text-stone-800`
  - `Body`: `text-base text-stone-700 leading-relaxed`
  - `Caption / Meta`: `text-xs text-stone-500`

---

## 4. Layout Structure & Responsive Breakpoints
1. **Sidebar Navigation**:
   - Desktop (`>= 1024px`): Fixed 260px wide sidebar with icons, app brand, and page links.
   - Mobile (`< 1024px`): Collapsible drawer and bottom navigation bar for quick thumb-reach.
2. **Main Application Content**:
   - Scrollable container with padding `p-4 sm:p-6 lg:p-8`.
   - Max container width: `max-w-7xl mx-auto`.
3. **Map Split Views**:
   - Desktop: Side-by-side split (e.g. 40% list / 60% Leaflet map).
   - Mobile: Tabbed toggle between List and Map views, or stacked layout.

---

## 5. Standard Component Guidelines
- **Buttons**:
  - Primary: `bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition`
  - Secondary: `bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 px-4 py-2 rounded-lg transition`
  - Danger: `bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition`
- **Cards**:
  - `bg-white rounded-xl border border-stone-200/80 shadow-sm hover:shadow-md transition p-5`
- **Badges**:
  - High Priority: `bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded-full`
  - Visited: `bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full`
  - Farthest Stop: `bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full`

---

## 6. Accessibility & Usability (WCAG 2.1 AA)
- Minimum contrast ratio >= 4.5:1 for all text.
- Interactive controls have visible `:focus-visible` ring outlines.
- Clear ARIA labels for icon-only buttons (e.g., "Delete photo", "Close modal").
- Form inputs have explicit `<label>` bindings and descriptive error helpers.
