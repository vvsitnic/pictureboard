import { createFileRoute, redirect } from "@tanstack/react-router";
import { baseAuthClient, reactAuthClient } from "../../lib/auth-client";

export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    const session = await baseAuthClient.getSession();

    if (session.data) {
      throw redirect({ to: "/profile" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen flex justify-center items-center">
      <button
        onClick={() => reactAuthClient.signIn.social({ provider: "google" })}
        className="px-4 py-2 outline-1 rounded-sm cursor-pointer"
      >
        Auth with Google
      </button>
    </div>
  );
}
