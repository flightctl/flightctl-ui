import type { FC } from 'react';

// OCP console provides react-router-dom v5 at runtime with Prompt; v6 types in the monorepo don't include it.
// We use require + type assertion to avoid augmenting the (untyped or v6) react-router-dom module.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Prompt = require('react-router-dom').Prompt as FC<{ message: string }>;
export { Prompt };
