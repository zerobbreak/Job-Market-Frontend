import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { AuthProvider } from "@/context/AuthContext";
import { getSessionUserFn } from "@/lib/auth";
import type { RouterContext } from "@/router";
import appCss from "@/index.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Job Market Agent" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/vite.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@300;400;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  beforeLoad: async () => {
    const user = await getSessionUserFn();
    return { user };
  },
  errorComponent: RootErrorBoundary,
  component: RootComponent,
});

function RootErrorBoundary({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 max-w-md mb-6">
        We encountered an unexpected error while rendering this page.
        <span className="block mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
          Error: {message}
        </span>
      </p>
      <Button onClick={() => window.location.reload()}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Reload Page
      </Button>
    </div>
  );
}

function RootComponent() {
  const context = Route.useRouteContext();

  return (
    <RootDocument>
      <QueryClientProvider client={context.queryClient}>
        <AuthProvider>
          <ToastProvider>
            <Outlet />
            <ToastViewport />
          </ToastProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
