# Admin Style Adaptation Guide

This document serves as a **supplement** to the main [DesignStyleGuide.md](../DesignStyleGuide.md). It defines specific overrides and component specifications required for the high-density "Admin Dashboard" context.

**Core Principle**: Maintain the Brand Identity (Colors, Sharpness) while increasing Information Density.

---

## 1. Typography Adaptation (Compact)

The marketing site uses large, airy typography. The Admin UI requires compact, readable text for data-heavy views.

| Element   | Marketing Size | **Admin Size**  | Weight | Color     | Usage                        |
| :-------- | :------------- | :-------------- | :----- | :-------- | :--------------------------- |
| **H1**    | ~48-56px       | **24px**        | 600    | `#383838` | Page Titles                  |
| **H2**    | ~32-40px       | **18px**        | 600    | `#383838` | Section Headers, Card Titles |
| **H3**    | ~24-28px       | **16px**        | 500    | `#383838` | Subsection Headers           |
| **Body**  | 16px           | **13px / 14px** | 400    | `#383838` | Table content, Form inputs   |
| **Label** | 14px           | **12px**        | 500    | `#383838` | Form labels, Metadata        |

**Rule**: Default to `13px` for data tables and `14px` for form inputs to prevent auto-zoom on mobile (though this is a PC app, it's a good practice).

---

## 2. Spacing Scale (High Density)

Reduce whitespace to fit more controls and data on the screen without feeling cluttered.

| Token         | Marketing Value | **Admin Value**               | Usage                        |
| :------------ | :-------------- | :---------------------------- | :--------------------------- |
| `p-page`      | 64px-80px       | **24px**                      | Main page container padding  |
| `p-card`      | 32px            | **16px / 20px**               | Card/Panel internal padding  |
| `gap-section` | 48px            | **24px**                      | Space between major sections |
| `gap-item`    | 16px            | **8px / 12px**                | Space between form elements  |
| `h-input`     | N/A             | **32px** (sm) / **36px** (md) | Input/Button height          |

---

## 3. Component Specifications

### 3.1 Table Component (New)

Structure based on `shadcn/ui` Table, styled with Brand Tokens.

- **Container**:
  - Border: `1px solid #383838`
  - Radius: `0px` (Sharp)
- **Header (`thead`)**:
  - Background: `#F4EFEA` (Secondary Light)
  - Text: `#383838`, 13px, Weight 600
  - Height: `40px`
  - Border Bottom: `1px solid #383838`
- **Row (`tr`)**:
  - Background: `transparent`
  - Border Bottom: `1px solid #e5e5e5` (Lighter internal borders for reduced noise) OR `1px solid #383838` (Strict Brand Mode - **Recommended for MVP**)
  - Hover: `rgba(22, 170, 152, 0.05)` (5% Accent Teal)
- **Cell (`td`)**:
  - Padding: `8px 16px`
  - Text: 13px, `#383838`

### 3.2 Form Component (Complex)

- **Input Fields**:
  - Background: `#FFFFFF`
  - Border: `1.5px solid #383838`
  - Radius: `0px`
  - Height: `36px`
  - Padding: `0px 12px`
  - Focus: Ring `2px` solid `#16AA98` (Accent), Offset `1px`
- **Labels**:
  - Size: `12px`
  - Weight: `500`
  - Margin Bottom: `6px`
- **Validation Error**:
  - Text Color: `#D32F2F` (Standard Error) or `#383838` with bold weight + Icon.
  - Border: `#D32F2F`

### 3.3 Buttons (Admin Variants)

- **Primary**:
  - Bg: `#383838`
  - Text: `#FFFFFF`
  - Hover: Lighten 10%
  - Radius: `0px`
- **Secondary / Outline**:
  - Bg: `transparent`
  - Border: `1.5px solid #383838`
  - Text: `#383838`
  - Hover: Bg `#F4EFEA`
- **Ghost**:
  - Bg: `transparent`
  - Text: `#383838`
  - Hover: Bg `#F4EFEA`

---

## 4. Implementation Checklist

- [ ] Configure Tailwind `fontSize` theme to support 13px (`text-[13px]`).
- [ ] Create `components/ui/table.tsx` with these specific styles overrides.
- [ ] Create `components/ui/input.tsx` forcing `rounded-none` and `border-[1.5px]`.

---

## 5. Iconography

- **Library**: Use `lucide-react` (Standard shadcn/ui icon set) for all Admin UI and Editor interfaces.
- **Style**:
  - **Stroke Width**: `1.5px` (Matches the sharp/thin border aesthetic).
  - **Color**: Inherit current text color (usually `#383838` or `#16AA98` for active states).
  - **Size**: Default to `16px` (w-4 h-4) for buttons/actions, `14px` for metadata.
