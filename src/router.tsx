import { QueryClient } from "@tanstack/react-query";
import { createRouter, createBrowserHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const isTrainingsSubdomain = (hostname: string) => {
  return hostname.toLowerCase().split(".").includes("trainings");
};

const rewritePathnameIn = (pathname: string, hostname: string) => {
  if (!isTrainingsSubdomain(hostname)) return pathname;
  
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_build") ||
    pathname.startsWith("/_server") ||
    pathname.startsWith("/__vite_ping") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/src") ||
    pathname.startsWith("/node_modules") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return pathname;
  }
  
  if (pathname.startsWith("/trainings")) {
    return pathname;
  }
  
  if (pathname === "/") {
    return "/trainings";
  }
  
  return `/trainings${pathname}`;
};

const rewritePathnameOut = (pathname: string, hostname: string) => {
  if (!isTrainingsSubdomain(hostname)) return pathname;
  
  if (pathname === "/trainings") {
    return "/";
  }
  
  if (pathname.startsWith("/trainings/")) {
    return pathname.slice("/trainings".length);
  }
  
  return pathname;
};

export const getRouter = () => {
  const queryClient = new QueryClient();

  let history;
  if (typeof window !== "undefined") {
    history = createBrowserHistory({
      parseLocation: () => {
        const win = window;
        const rawHref = `${win.location.pathname}${win.location.search}${win.location.hash}`;
        const searchIndex = rawHref.indexOf("?");
        const hashIndex = rawHref.indexOf("#");
        const pathnameEnd = hashIndex > 0
          ? searchIndex > 0
            ? Math.min(hashIndex, searchIndex)
            : hashIndex
          : searchIndex > 0
            ? searchIndex
            : rawHref.length;
            
        const rawPathname = rawHref.substring(0, pathnameEnd);
        const rewrittenPathname = rewritePathnameIn(rawPathname, win.location.hostname);
        
        const hash = hashIndex > -1 ? rawHref.substring(hashIndex) : "";
        const search = searchIndex > -1
          ? rawHref.slice(searchIndex, hashIndex === -1 ? undefined : hashIndex)
          : "";
          
        return {
          href: `${rewrittenPathname}${search}${hash}`,
          pathname: rewrittenPathname,
          search,
          hash,
          state: win.history.state || { __TSR_index: 0, key: "initial", __TSR_key: "initial" },
        };
      },
      createHref: (path: string) => {
        const searchIndex = path.indexOf("?");
        const hashIndex = path.indexOf("#");
        const pathnameEnd = hashIndex > 0
          ? searchIndex > 0
            ? Math.min(hashIndex, searchIndex)
            : hashIndex
          : searchIndex > 0
            ? searchIndex
            : path.length;
            
        const pathname = path.substring(0, pathnameEnd);
        const search = searchIndex > -1
          ? path.slice(searchIndex, hashIndex === -1 ? undefined : hashIndex)
          : "";
        const hash = hashIndex > -1 ? path.substring(hashIndex) : "";
        
        const win = window;
        const rewrittenPathname = rewritePathnameOut(pathname, win.location.hostname);
        return `${rewrittenPathname}${search}${hash}`;
      },
    });
  }

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history,
  });

  return router;
};
