import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

const GlobalStyles = createGlobalStyle`
  ${normalize}

  /* Box sizing rules */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Remove default margin and padding */
  body,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
    padding: 0;
  }

  /* Set core body defaults */
  body {
    min-height: 100vh;
    text-rendering: optimizeSpeed;
    line-height: 1.5;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.gray[800]};
    background-color: ${({ theme }) => theme.colors.gray[100]};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Make images easier to work with */
  img,
  picture {
    max-width: 100%;
    display: block;
  }

  /* Inherit fonts for inputs and buttons */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* Remove all animations, transitions and smooth scroll for people that prefer not to see them */
  @media (prefers-reduced-motion: reduce) {
    html:focus-within {
      scroll-behavior: auto;
    }
    
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[200]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[400]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gray[500]};
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    color: ${({ theme }) => theme.colors.dark};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    }
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    }
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
    }
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.DEFAULT};
    
    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
      text-decoration: underline;
    }
  }

  /* Form elements */
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button,
  input {
    overflow: visible;
  }

  button,
  select {
    text-transform: none;
  }

  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }

  button:focus {
    outline: 1px dotted;
    outline: 5px auto -webkit-focus-ring-color;
  }
`;

export default GlobalStyles;
