import type * as React from 'react';

export type QuickStartGuideStep = {
  // If true, the step is only available if the user is on the corresponding list page.
  mustBeOnListPage?: boolean;
  render: () => React.ReactNode;
};
