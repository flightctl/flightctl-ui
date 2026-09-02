export const pathMatchesRoute = (pathname: string, routePath: string): boolean => {
  if (routePath === '/') {
    return pathname === '/';
  }
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
};
