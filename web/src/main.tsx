import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/globals.css";
import Landing from "./routes/landing";

// Code-split: three.js + AsciiEffect only load when /console is visited.
const Console = lazy(() => import("./routes/console"));

function ConsoleSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center font-mono text-secondary text-sm">
          ▮ booting console...
        </div>
      }
    >
      <Console />
    </Suspense>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const consoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/console",
  component: ConsoleSuspense,
});

const routeTree = rootRoute.addChildren([indexRoute, consoleRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
