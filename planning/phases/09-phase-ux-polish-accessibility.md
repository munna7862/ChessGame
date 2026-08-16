# Phase 09: UX Polish & Accessibility

## Objective

Transform the functional chess application into a polished Windows
desktop product.

## Outcome

ChessForge looks intentional, feels responsive and supports users with
different interaction needs.

## Scope

-   Visual design system
-   Board themes
-   Piece themes
-   Animations
-   Sound
-   Reduced motion
-   Keyboard accessibility
-   Focus management
-   High contrast
-   Error UX
-   Loading states
-   Empty states
-   Responsive desktop layouts

## Visual principles

The board should dominate the experience.

Avoid:

-   excessive panels
-   unnecessary gradients
-   noisy animations
-   ambiguous buttons
-   tiny controls

Prioritize:

-   board clarity
-   turn visibility
-   clock visibility
-   move history
-   obvious game controls

## Accessibility

Support:

-   keyboard navigation
-   visible focus
-   meaningful labels
-   high contrast
-   reduced motion
-   non-color-only state indicators

Important states such as check should not rely only on color.

## Audio

Optional:

-   move
-   capture
-   check
-   promotion
-   game over

Allow sounds to be disabled.

## Animation

Animation should communicate state, not decorate everything.

Never let animation delay authoritative game state.

## Browser/visual verification

Use Antigravity browser capabilities where useful for UI iteration and
verification. Store important visual artifacts as review checkpoints.

## Testing

-   keyboard flow
-   focus behavior
-   reduced motion
-   high contrast
-   visual regression for major states
-   sound toggle
-   animation toggle
-   different Windows scaling settings

## Acceptance criteria

-   UI feels consistent.
-   Major states are visually understandable.
-   Keyboard navigation works for supported controls.
-   Reduced-motion mode works.
-   Sound can be disabled.
-   High-contrast behavior is acceptable.
-   No critical visual defects on supported desktop sizes.

## Exit criteria

A first-time user can understand and operate the application without
documentation.

## Sprint decomposition candidates

-   Design tokens
-   Board themes
-   Piece themes
-   Animation
-   Audio
-   Accessibility
-   Keyboard support
-   Error states
-   Visual regression
-   UX review
