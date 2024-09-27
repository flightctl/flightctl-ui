import * as React from 'react';

import './ScrollablePage.css';

const ScrollablePage = ({ children }: React.PropsWithChildren) => {
  return <div className="fctl-scrollable-page">{children}</div>;
};

export default ScrollablePage;
