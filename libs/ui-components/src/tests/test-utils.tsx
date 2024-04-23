import { RenderResult, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

const customRender = (ui: React.ReactNode, options?: object): RenderResult =>
  // eslint-disable-next-line
  render(ui as any, { wrapper: BrowserRouter, ...options });

export const checkAccessibility = async (container: HTMLElement | string, options?: object) => {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
