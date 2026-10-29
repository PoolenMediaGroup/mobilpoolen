import { createFileRoute, redirect } from "@tanstack/react-router";

/** Sidan heter /studentabonnemang sedan 29 oktober 2026. Gamla länkar flyttas permanent. */
export const Route = createFileRoute("/ungdom")({
  beforeLoad: () => {
    throw redirect({ to: "/studentabonnemang", statusCode: 301 });
  },
});
