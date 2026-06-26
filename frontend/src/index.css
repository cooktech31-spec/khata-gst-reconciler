@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  background-color: #080b12;
  font-feature-settings: "tnum" 1; /* tabular numerals everywhere numbers appear */
}

body {
  font-family: "IBM Plex Sans", sans-serif;
}

::selection {
  background: rgba(74, 99, 232, 0.35);
}

/* Thin ledger-rule horizontal lines, used as a section divider texture */
.ledger-rules {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(139, 147, 167, 0.08) 28px
  );
}

/* The red vertical margin rule found on Indian accounting registers */
.margin-rule {
  position: relative;
}
.margin-rule::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, #7a2e26 8%, #7a2e26 92%, transparent);
  opacity: 0.55;
}

.glass-card {
  background: linear-gradient(160deg, rgba(28, 36, 51, 0.85), rgba(20, 27, 40, 0.85));
  border: 1px solid rgba(139, 147, 167, 0.12);
  backdrop-filter: blur(6px);
}

.tabular {
  font-family: "IBM Plex Mono", monospace;
  font-feature-settings: "tnum" 1;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* Custom scrollbar — subtle, matches dark ledger theme */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #0e131d;
}
::-webkit-scrollbar-thumb {
  background: #28324d;
  border-radius: 6px;
}
