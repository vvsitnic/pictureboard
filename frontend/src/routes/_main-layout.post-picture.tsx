import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { baseAuthClient } from "../lib/auth-client";
import { postPicture } from "../lib/picture-requests";

export const Route = createFileRoute("/_main-layout/post-picture")({
  beforeLoad: async () => {
    const session = await baseAuthClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: RouteComponent,
});

export const Picture = z.object({
  picture: z.file().mime(["image/png", "image/jpeg"]).max(2_000_000), //2mb
  textForPicture: z.string().max(1024),
});

function RouteComponent() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: postPicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pictures-all"] });
      navigate({
        to: "/",
      });
    },
    onError: (error) => {
      if (error.cause === 401) {
        navigate({ to: "/auth/login" });
      }
    },
  });

  return (
    <>
      <form
        className="flex flex-col gap-2 px-3 max-w-xl mx-auto justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const picture = formData.get("picture") as File;
          const textForPicture = formData.get("text-for-picture") as string;

          const result = Picture.safeParse({
            picture,
            textForPicture,
          });

          if (result.success) {
            mutation.mutate(result.data);
            setError("");
          } else {
            setError(
              result.error.issues.map((issue) => issue.message).join("; "),
            );
          }
        }}
      >
        <label htmlFor="picture">Picture</label>
        <input
          type="file"
          id="picture"
          name="picture"
          accept="image/png, image/jpeg"
          className="px-2 outline-1 rounded-sm cursor-pointer"
        />
        <label htmlFor="text-for-picture">
          Speak out {"ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧"}
        </label>
        <textarea
          id="text-for-picture"
          name="text-for-picture"
          className="px-2 outline-1 rounded-sm h-40"
        />
        {error && <p className="text-red-500">{error}</p>}
        {mutation.error && (
          <p className="text-red-500">{mutation.error.message}</p>
        )}
        <button
          disabled={mutation.isPending}
          className="px-2 outline-1 rounded-sm cursor-pointer"
        >
          Submit
        </button>
      </form>
    </>
  );
}
