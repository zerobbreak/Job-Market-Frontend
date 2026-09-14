import { createFileRoute, redirect } from "@tanstack/react-router";
import RootLayout from "@/components/layout/RootLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: RootLayout,
});
