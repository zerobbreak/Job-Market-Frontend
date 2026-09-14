import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import ResetPassword from "@/components/ResetPassword";

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/_guest/reset-password")({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const { token } = Route.useSearch();
  return <ResetPassword token={token} />;
}
