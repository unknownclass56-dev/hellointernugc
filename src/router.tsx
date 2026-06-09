import { QueryClient } from "@tanstack/react-query";
import { createRouter, createBrowserHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const SKIP_SUBDOMAINS = new Set(["www", "api", "mail", "smtp", "ftp", "cdn", "static", "assets"]);

/** Returns the subdomain if one exists, e.g. "trainings" from "trainings.techlaunchpad.in" */
const getSubdomain = (hostname: string): string | null => {
  const parts = hostname.split(".");
  if (parts.length >= 3 && !SKIP_SUBDOMAINS.has(parts[0])) {
    return parts[0];
  }
  return null;
};

const SKIP_PATHS = ["/api", "/_build", "/_server", "/__vite_ping", "/@", "/src", "/node_modules"];
const isStaticOrApi = (pathname: string) =>
  SKIP_PATHS.some((p) => pathname.startsWith(p)) || /\.[a-zA-Z0-9]+$/.test(pathname);

/** Map browser path → internal router path (input rewrite) */
const rewriteIn = (pathname: string, subdomain: string): string => {
  if (isStaticOrApi(pathname)) return pathname;
  const base = `/${subdomain}`;
  if (pathname.startsWith(base)) return pathname;
  return pathname === "/" ? base : `${base}${pathname}`;
};

/** Map internal router path → browser URL path (output rewrite) */
const rewriteOut = (pathname: string, subdomain: string): string => {
  const base = `/${subdomain}`;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
  return pathname;
};

export const getRouter = () => {
  const queryClient = new QueryClient();

  let history;
  if (typeof window !== "undefined") {
    const subdomain = getSubdomain(window.location.hostname);

    if (subdomain) {
      history = createBrowserHistory({
        parseLocation: () => {
          const win = window;
          const rawPathname = win.location.pathname;
          const search = win.location.search;
          const hash = win.location.hash;
          const rewritten = rewriteIn(rawPathname, subdomain);
          return {
            href: `${rewritten}${search}${hash}`,
            pathname: rewritten,
            search,
            hash,
            state: win.history.state || { __TSR_index: 0, key: "initial", __TSR_key: "initial" },
          };
        },
        createHref: (path: string) => {
          const searchIndex = path.indexOf("?");
          const hashIndex = path.indexOf("#");
          const pathnameEnd =
            hashIndex > 0
              ? searchIndex > 0
                ? Math.min(hashIndex, searchIndex)
                : hashIndex
              : searchIndex > 0
                ? searchIndex
                : path.length;
          const pathname = path.substring(0, pathnameEnd);
          const search = searchIndex > -1 ? path.slice(searchIndex, hashIndex === -1 ? undefined : hashIndex) : "";
          const hash = hashIndex > -1 ? path.substring(hashIndex) : "";
          return `${rewriteOut(pathname, subdomain)}${search}${hash}`;
        },
      });
    }
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
