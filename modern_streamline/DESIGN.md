---
name: Modern Streamline
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fc'
  surface-container: '#ebedf7'
  surface-container-high: '#e6e8f1'
  surface-container-highest: '#e0e2eb'
  on-surface: '#181c22'
  on-surface-variant: '#414753'
  inverse-surface: '#2d3037'
  inverse-on-surface: '#eef0fa'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#005ab4'
  on-primary: '#ffffff'
  primary-container: '#0a73e0'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#964400'
  on-tertiary: '#ffffff'
  tertiary-container: '#bd5700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f7'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#763400'
  background: '#f9f9ff'
  on-background: '#181c22'
  surface-variant: '#e0e2eb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
---

# Modern Streamline Design System

## Brand & Style
Modern Streamline is built on principles of reliability, clarity, and technological precision. The brand personality is professional and trustworthy, designed to evoke a sense of calm efficiency and modern capability. 

The design style follows a **Corporate / Modern** aesthetic. It prioritizes functional elegance through balanced layouts, a tech-forward color palette, and high legibility. By moving away from sharp edges toward softer geometry and utilizing a blue-centric palette, the UI communicates stability and approachability, making it ideal for high-utility software environments and professional tools.

## Colors
The color system is anchored by a vibrant, tech-focused primary blue, providing a foundation of trust and clarity. 

- **Primary (#1275e2):** A bright, active blue used for core actions, branding, and primary states.
- **Secondary (#5f78a3):** A muted, desaturated blue-grey used for supporting UI elements and secondary navigation.
- **Tertiary (#c55b00):** A warm, contrasting orange used sparingly for accents, highlights, or call-outs that require distinct visual separation from the cool primary palette.
- **Neutral (#74777f):** A balanced grey used for text, borders, and structural surfaces to maintain a clean, professional environment.

The system uses a `fidelity` variant to ensure that the derived semantic colors maintain the character of the input tones while meeting accessibility and contrast requirements in a light color mode.

## Typography
The system utilizes **Inter** across all levels to ensure maximum legibility and a contemporary, "system-font" feel. Inter's tall x-height and neutral character make it exceptionally effective for data-heavy interfaces and complex application logic.

- **Headlines:** Use a bold weight to establish clear hierarchy and provide a strong visual anchor for page sections.
- **Body:** Standardized at 16px for primary reading and 14px for secondary information to ensure comfort over long periods of use.
- **Labels:** Slightly tighter and medium-weighted to distinguish interactive descriptors from static content.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy that adapts seamlessly to the user's viewport. The rhythm is dictated by a base-2 spacing scale, ensuring mathematical consistency across all margins and paddings.

Desktop layouts utilize a 12-column grid with 16px (1rem) gutters. As the screen scales down to tablet and mobile, the margins compress and columns reduce (to 8 and 4 respectively) to maintain focus on the core content. This flexible approach ensures that information density remains balanced regardless of the device.

## Elevation & Depth
Visual depth is achieved through **Tonal Layers** supplemented by soft, ambient shadows. Rather than heavy physical metaphors, the system uses subtle shifts in surface color to indicate stacking.

- **Surface Levels:** Lower levels use neutral backgrounds, while elevated components (like cards or modals) use white or slightly lighter tints with a diffused shadow (blur: 8-16px, opacity: 0.08).
- **Interactions:** Subtle shadow increases or slight tonal shifts on hover provide immediate feedback without cluttering the visual field.

## Shapes
The shape language is defined as **Rounded**, utilizing a standard 0.5rem (8px) radius for most UI components. This choice balances the professional rigor of the layout with an approachable, modern friendliness.

- **Standard (8px):** Used for buttons, inputs, and small cards.
- **Large (16px):** Used for primary containers and large modal surfaces.
- **Extra Large (24px):** Used for featured sections or decorative elements to create visual interest.

## Components
Components are designed for clarity and ease of interaction:

- **Buttons:** Feature 8px rounded corners and use the primary blue (#1275e2) for high-emphasis actions. Labels are set in Inter Medium for legibility.
- **Input Fields:** Utilize a subtle neutral border (#74777f) that thickens and shifts to primary blue on focus. 
- **Cards:** Defined by an 8px radius and a soft ambient shadow to separate content from the background.
- **Chips & Tags:** Use highly rounded corners (approaching pill-shaped) to distinguish them from actionable buttons, often utilizing the secondary or tertiary colors for categorization.
- **Checkboxes/Radios:** Follow the 8px rounding logic (scaled for small sizes) to maintain consistency with the broader shape language.