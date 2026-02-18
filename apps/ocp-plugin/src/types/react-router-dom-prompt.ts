import 'react-router-dom';
import type { FC } from 'react';
// OCP console provides react-router-dom v5 at runtime, which exports Prompt.
// v6 types in the monorepo don't, so we declare it for this app.
declare module 'react-router-dom' {
  export const Prompt: FC<{ message: string }>;
}
