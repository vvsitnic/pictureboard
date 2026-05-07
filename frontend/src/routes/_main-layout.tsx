import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { reactAuthClient } from "../lib/auth-client";

export const Route = createFileRoute("/_main-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = reactAuthClient.useSession();

  return (
    <>
      <div className="flex justify-between items-center p-3 md:px-12 sticky top-0 bg-white z-10">
        <Link to="/" className="[&.active]:font-bold hover:underline">
          Home
        </Link>
        <div className="flex gap-3 items-center">
          <Link
            to="/post-picture"
            className="[&.active]:font-bold hover:underline"
          >
            Post Picture
          </Link>
          {session.data ? (
            <Link to="/profile" className="[&.active]:font-bold">
              {session.data.user.image ? (
                <img
                  src={session.data.user.image}
                  className="rounded-full size-10 hover:brightness-90"
                />
              ) : (
                <p>Profile</p>
              )}
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="[&.active]:font-bold hover:underline"
            >
              Sigin
            </Link>
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
}
