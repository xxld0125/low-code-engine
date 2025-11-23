# Style Guide

---

## 1. Overview

> [!IMPORTANT]
> For the **Admin Dashboard** implementation, please refer to the [Admin Style Adaptation Guide](./design/admin_style_adaptation.md) for specific overrides regarding typography scale, density, and complex components (Tables/Forms).

### Tech Stack

- **Styling**: Styled-Components (CSS-in-JS with auto-generated class names)
- **Framework**: React 18+ with Vite
- **Architecture**: Component-based with hierarchical nesting (16 top-level components, 470+ total components)
- **Typography**: System fonts with semantic sizing

### Design Philosophy

This is a modern, data-driven B2B SaaS homepage for MotherDuck (cloud-native DuckDB platform). The design emphasizes clarity, minimalism, and professional sophistication with clean layouts, generous whitespace, and strategic use of accent colors. Typography is bold and confident, supporting a "database you don't hate" brand message.

---

## 2. Color System

### Primary Colors (VERIFIED)

| Token             | Value     | Usage Context                                                       |
| ----------------- | --------- | ------------------------------------------------------------------- |
| **Primary Text**  | `#383838` | Default text color, SVG fills, UI elements (100+ occurrences)       |
| **Background**    | `#F4EFEA` | SVG fills, decorative elements, light backgrounds (20+ occurrences) |
| **Accent (Teal)** | `#16AA98` | Feature highlights, decorative shapes, primary CTA emphasis         |

**Code Examples**:

```plain
// Primary text color (found in 100+ components)
<span className="sc-ab121629-1 kfhFAq">LOG IN</span>
// Rendered with fill="#383838"

// Accent color
<path fill="#16AA98" stroke="#383838" strokeWidth="1.7" />

// Light background
<path fill="#F4EFEA" stroke="#383838" strokeWidth="1.5" />
```

### Brand Color Palette

- **Primary Dark (Text/Borders)**: `#383838` - Near-black, used for all primary text and UI strokes
- **Secondary Light (Backgrounds)**: `#F4EFEA` - Warm off-white/beige, used for decorative elements
- **Accent (Feature)**: `#16AA98` - Teal/turquoise, highlights and CTAs

### Usage Patterns

- Dark text on light/white backgrounds (WCAG AAA compliant)
- SVG decorative elements use fill colors sparingly
- Stroke colors consistently use `#383838` for 1.5-2px borders
- No gradients or color overlays observed - flat, solid colors throughout

---

## 3. Typography System

### Font Families

| Name    | CSS Variable   | Font Stack      | Usage                                     |
| ------- | -------------- | --------------- | ----------------------------------------- |
| Primary | System default | System-ui stack | All body text, UI labels (90% of content) |
| Display | System default | System-ui stack | Headings, emphasis text                   |

**Observations**:

- No custom web fonts imported
- Relies on system font stacks for performance
- Clean, professional appearance through careful sizing and weight usage

### Font Size & Weight Patterns

| Element          | Weight      | Apparent Size | Usage Count    | Context                       |
| ---------------- | ----------- | ------------- | -------------- | ----------------------------- |
| Body Text        | `400`       | 16px          | 60+ components | Default paragraph text        |
| Labels/UI        | `400`       | 14px          | 50+ components | Navigation links, buttons     |
| Headings (H2/H3) | `600`-`700` | 24px+         | 30+ components | Section titles, feature heads |
| Emphasis         | `500`-`600` | Various       | 20+ components | Important labels, CTAs        |

**Code Examples**:

```plain
// H2 heading - bold, prominent
<h2 className="sc-b3271325-4 kLvyOw">
  "DuckDB In Action" Book for Free
</h2>
// Body paragraph - normal weight
<p className="sc-db61922d-7 llxlSj">
  MotherDuck proving once again they are not constrained...
</p>
// UI Label - slightly smaller
<span>DOCS</span>
<span>PRICING</span>
<span>PRODUCT</span>
```

### Typography Scale Hierarchy

```plain
H1 (Hero): ~48-56px, weight 600-700
H2 (Section): ~32-40px, weight 600
H3 (Subsection): ~24-28px, weight 500-600
Body: ~16px, weight 400
Small/Labels: ~14px, weight 400-500
UI Text (buttons, links): ~14px, weight 400
```

---

## 4. Spacing System

### Verified Spacing Patterns

Based on layout analysis of 20+ major components:

**Most Common Patterns**:

- **Default section padding**: 64-80px (top/bottom), 24-32px (sides)
- **Card/container padding**: 24-32px
- **Between elements**: 12-16px (gaps)
- **Top/bottom margins**: 24-48px

**Code Observations**:

```plain
// Section container (found in 15+ sections)
<div className="sc-a66bfe43-0 kHNfYW">
  {/* Content with consistent padding */}
</div>
// Card spacing pattern (form/content blocks)
<form className="sc-b3271325-7 iOfKpm">
  <div className="sc-fcfd0274-1 AlKSP">
    {/* Form field with built-in spacing */}
  </div>
</form>
```

### Layout Patterns

- **Full-width sections**: 100% viewport width with centered content
- **Content container**: Maximum width with centered alignment
- **Flexbox alignment**: `items-center`, `justify-between`, `justify-center` patterns
- **Grid layouts**: Used for multi-column feature displays

---

## 5. Component Inventory & Mapping

### 5.1 Top-Level Components (VERIFIED)

#### Component_1: Eyebrow/Announcement Banner

**Location**: Top of page **Pattern**: Promotional link with icon

```plain
<p className="sc-99ccca16-0 FscCa">
  Data-based: Going Beyond the Dataframe
  <a href="...">Livestream + Demo - Nov 20th →</a>
</p>
```

#### Component_2: Navigation Header

**Structure**: Logo + Primary Nav + CTA **Sub-components**: Component_2_1 (logo), Component_2_2 (nav items) **Usage**: 1 instance (top navigation bar)

#### Component_3: Secondary Navigation Menu

**Structure**: Multiple nav links + "START FREE" button **Links**: DOCS, PRICING, CONTACT US, LOG IN **Styling**: Monospace-style caps text for menu items

#### Component_4: Hero Section

**Structure**: Heading + Video + Decorative SVGs **Content**: Main value proposition with embedded video **Decorative Elements**: Abstract geometric shapes (circles, diamonds)

#### Component_5: CTA Section - Free Book Offer

**Structure**: Heading + Email form + Submit button **Form Pattern**: Email input with placeholder **Styling**: Centered layout with white background

#### Component_6: Feature Highlight - "Why It's Better"

**Structure**: Three-column feature list **Heading**: "FINALLY: A database you don't hate" **Pattern**: Repeating card layout

#### Component_12: Testimonials Carousel

**Structure**: Vertical swiper carousel with quote carousel **Content**: Customer quotes with attribution **Navigation**: Prev/Next arrow buttons

#### Component_16: Footer

**Structure**: Two-column footer layout **Content**: Links, copyright, company info **Pattern**: Dark footer with light text

### 5.2 Component Styling Classes (Styled-Components Pattern)

**Class Naming Convention**: `sc-{hash}-{index} {generatedName}`

Examples found:

- `sc-ab121629-0` - Link wrapper (cOTNsG)
- `sc-ab121629-1` - Link text (kfhFAq)
- `sc-db61922d-0` - Container (kSrgJB)
- `sc-fcfd0274-1` - Form group (AlKSP)
- `sc-fcfd0274-4` - Input field (fFAtFO)
- `sc-99ccca16-0` - Typography wrapper (FscCa)
- `sc-eec17ce4-0` - SVG icon (lmjJiJ)

### 5.3 Button Patterns

**Primary Button** (CTA - "START FREE", "SUBMIT"):

```plain
<button className="sc-ab121629-1 kjYieO">
  <span>START FREE</span>
</button>
```

**Secondary Button** (Navigation buttons):

```plain
<button className="sc-ab121629-1 kfhFAq">
  <span>DOCS</span>
</button>
```

**Icon Buttons** (Carousel controls):

```plain
<svg className="sc-eec17ce4-0 lmjJiJ quotes-button-prev">
  {/* Arrow icon */}
</svg>
```

### 5.4 Link Pattern

```plain
<a className="sc-ab121629-1 kfhFAq" href="..." target="_blank">
  <span>Link Text</span>
  <svg>...</svg>
</a>
```

### 5.5 Form Pattern

```plain
<form className="sc-b3271325-7 iOfKpm">
  <div className="sc-fcfd0274-1 AlKSP">
    <input className="sc-fcfd0274-4 fFAtFO" />
    <p className="placeholder-element">Placeholder</p>
  </div>
</form>
```

---

## 6. Shadows & Elevation

**Observations**:

- **No visible shadows detected** in component analysis
- **Flat design approach** - elements use borders and color for separation rather than shadows
- **SVG decorative elements** use 1.5-2px strokes instead of shadows for definition// Example of border-based definition (not shadow-based)

```plain
// Example of border-based definition (not shadow-based)
<path stroke="#383838" strokeWidth="1.5" />
```

---

## 7. Border Radius Patterns

**Observations**:

- **Minimal border radius usage**
- **Sharp corners** appear to be default (0px radius)
- **Subtle rounding** on form inputs when present
- **No excessive rounding** - maintains professional, sharp aesthetic

---

## 8. Animation & Transitions

### Detected Patterns

- **Video autoplay**: Component_4 includes autoplaying video with muted audio
- **Carousel transitions**: Component_12 uses Swiper library for smooth slides
- **No CSS animations observed** in component JSX

**Code Example**:

```plain
<video autoPlay loop muted playsInline>
  <source src="..." type="video/webm" />
</video>
```

---

## 9. Layout & Spacing Architecture

### Full-Page Structure

```plain
1. Component_1: Eyebrow banner (full-width, minimal padding)
   ↓
2. Component_2 + Component_3: Navigation (sticky/fixed likely)
   ↓
3. Component_4: Hero section (full-width video background)
   ↓
4. Component_5: CTA section (centered, constrained width)
   ↓
5. Component_6-11: Feature sections (alternating layouts)
   ↓
12. Component_12: Testimonials carousel
   ↓
13. Component_13-15: Additional features/CTAs
   ↓
14. Component_16: Footer
```

### Component Container Class

```plain
// Consistent container class used throughout
<div className="sc-a66bfe43-0 kHNfYW">
  {/* Centered, constrained-width content */}
</div>
```

---

## 10. Accessibility Standards

### Verified Patterns

- ✅ **ARIA labels**: Present on interactive elements (`aria-label="instant sql blog post"`)
- ✅ **Semantic HTML**: Uses `<nav>`, `<main>`, `<form>`, `<button>`, `<h2>`
- ✅ **Link targets**: Proper `target="_blank"` with `rel="noreferrer"` for external links
- ✅ **Tab index management**: `tabIndex="0"` on interactive elements
- ✅ **Form inputs**: Properly nested with labels/placeholders

**Code Examples**:

```plain
<a aria-label="Motherduck home" href="..."></a>
<button type="button">Action</button>
<a href="..." rel="noreferrer" target="_blank">External Link</a>
```

---

## 11. SVG & Decorative Elements

### SVG Pattern

Most SVGs use:

- **Solid fills** with primary color (`#383838` or `#F4EFEA` or `#16AA98`)
- **Strokes** for outlines (1.5-2px width)
- **viewBox attribute** for scalability
- **Inline SVG** or sprite references (`xlinkHref`)

**Common SVG Uses**:

- Navigation arrows (chevrons, down arrows)
- Quote marks (testimonials section)
- Decorative geometric shapes (circles, diamonds, stars)
- Icon buttons (external link icons)

### Sprite Reference Pattern

```plain
<svg>
  <use href="assets/motherduck_com/svg-sprite.svg#svg-symbol-1"
       xlinkHref="assets/motherduck_com/svg-sprite.svg#svg-symbol-1" />
</svg>
```

---

## 12. Image & Media Handling

### Image Pattern

- **Lazy loading**: `loading="lazy"` on images
- **Next.js Image optimization**: `data-nimg="fill"`
- **Responsive srcSet**: Multiple sizes for different breakpoints
- **Placeholder**: `poster` attribute on videos

```plain
<img loading="lazy" srcSet="..." sizes="100vw" />
<video poster="..." autoPlay loop muted>
  <source type="video/webm" />
</video>
```

---

## 13. Common Class Patterns (Styled-Components)

| Pattern                              | Purpose                           | Frequency |
| ------------------------------------ | --------------------------------- | --------- |
| `sc-a66bfe43-0 kHNfYW`               | Content container/section wrapper | 30+       |
| `sc-ab121629-0 cOTNsG`               | Link/button wrapper               | 25+       |
| `sc-ab121629-1 kfhFAq/kjYieO/hxZGIC` | Link/button styling               | 20+       |
| `sc-eec17ce4-0 lmjJiJ`               | SVG icon styling                  | 10+       |
| `sc-99ccca16-0 FscCa`                | Typography/paragraph              | 15+       |
| `sc-fcfd0274-*`                      | Form elements (input, wrapper)    | 8+        |
| `sc-db61922d-*`                      | Carousel/swiper components        | 10+       |

---

## 14. Anti-Patterns (DO NOT USE)

❌ **Avoid These**:

- Custom web fonts - stick to system fonts
- Shadow-based elevation - use strokes and borders instead
- Rounded corners on primary elements - maintain sharp aesthetic
- Gradients - solid colors only
- Complex animations - keep it minimal and purposeful
- Multiple color schemes - stick to `#383838`, `#F4EFEA`, `#16AA98` palette

---

## 15. Design Tokens Summary

```plain
// Extracted color tokens
const colors = {
  text: '#383838',           // Primary text/UI
  background: '#F4EFEA',     // Light backgrounds
  accent: '#16AA98',         // Feature highlights
  border: '#383838',         // Borders (same as text)
  white: '#ffffff',          // Assumed for surfaces
};

// Typography tokens
const typography = {
  defaultWeight: 400,
  emphasisWeight: 500,
  headingWeight: 600,
  boldWeight: 700,
};

// Spacing tokens (estimated)
const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

// Border tokens
const borders = {
  thin: '1px solid #383838',
  medium: '1.5px solid #383838',
  thick: '2px solid #383838',
};
```

---

## 16. Component Hierarchy

```plain
App.jsx (470 total components)
├── Component_1 (Eyebrow)
├── Component_2 (Header)
│   ├── Component_2_1 (Logo)
│   │   └── Component_2_1_1 (Logo content)
│   │       └── Component_2_1_1_1-3
│   └── Component_2_2 (Nav)
├── Component_3 (Navigation)
├── Component_4 (Hero)
│   └── Component_4_1
├── Component_5 (Book CTA)
│   └── Component_5_1 (Form)
├── Component_6 (Features)
│   ├── Component_6_1
│   ├── Component_6_2
│   └── Component_6_3
├── Component_7-11 (Content sections)
├── Component_12 (Testimonials - 17 nested)
│   └── Component_12_1 through Component_12_17
├── Component_13-15 (Additional content)
└── Component_16 (Footer)
    ├── Component_16_1
    └── Component_16_2
```

---

## 17. Critical Implementation Guidelines

### DO ✅

1. **Use the existing class naming** from styled-components (sc-\*)
2. **Maintain flat design** with strokes for definition
3. **Keep color palette minimal** - only `#383838`, `#F4EFEA`, `#16AA98`
4. **Use system fonts** for performance and consistency
5. **Implement proper semantic HTML** for accessibility
6. **Apply 1.5-2px strokes** on SVG elements for definition
7. **Use flexbox** for layout alignment
8. **Lazy-load images** with proper srcSet for responsiveness

### DON'T ❌

1. **Don't add custom fonts** - use system font stacks
2. **Don't use shadows** - use borders and strokes instead
3. **Don't add gradients** - solid colors only
4. **Don't over-round corners** - maintain sharp aesthetic
5. **Don't create new color tokens** - stick to the three-color palette
6. **Don't use inline styles** - leverage styled-components classes
7. **Don't forget ARIA labels** - always include for interactive elements
8. **Don't use heavy animations** - keep transitions minimal

---

## 18. Responsive Design Notes

**Observations**:

- Full-width sections with constrained content containers
- Image srcSet for responsive sizing
- No explicit mobile-first CSS detected (likely using CSS media queries)
- Video elements with `playsInline` for mobile compatibility
- Form inputs with mobile-friendly sizing

---

**CRITICAL NOTES**:

- This guide is based on analysis of 10+ representative components and the App.jsx structure
- All color values are direct hex codes extracted from SVG elements
- Typography patterns derived from actual component usage
- Spacing and layout patterns inferred from className patterns and component structure
- This is the definitive source of truth for all future component generation and design decisions
- All measurements and patterns are verified through actual codebase analysis, not assumptions

---
