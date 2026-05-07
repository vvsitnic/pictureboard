import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { baseAuthClient, reactAuthClient } from "../lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { deletePicture, getUserPictures } from "../lib/picture-requests";

export const Route = createFileRoute("/_main-layout/profile")({
  beforeLoad: async () => {
    const session = await baseAuthClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [pictureToDelete, setPictureToDelete] = useState("");
  const dialogRef = useRef<any>(null);

  const navigate = useNavigate();
  const { data, isPending, error } = reactAuthClient.useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pictures-user"],
    queryFn: getUserPictures,
  });

  const mutation = useMutation({
    mutationFn: deletePicture,
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: ["pictures-user"],
      }),
  });

  if (isPending) return <p>Loading</p>;

  if (error) return <p>{error.message}</p>;

  return (
    <div className="px-3 md:px-5">
      {data && (
        <div>
          {data.user.image && <img src={data.user.image} />}
          <p>{data.user.name}</p>
          <p>{data.user.email}</p>
        </div>
      )}
      <button
        onClick={() =>
          reactAuthClient.signOut({
            fetchOptions: { onSuccess: () => navigate({ to: "/auth/login" }) },
          })
        }
        className="px-2 outline-1 rounded-sm cursor-pointer mb-14"
      >
        Sign Out
      </button>
      <p>{query.error?.message}</p>
      {!query.error && query.data && (
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full lg:max-w-7xl">
          {query.data.data.map(
            (picture: {
              picture_url: string;
              text_for_picture: string;
              id: string;
            }) => (
              <div key={picture.id}>
                <img
                  src={picture.picture_url}
                  alt={picture.text_for_picture}
                  className="cursor-pointer"
                ></img>
                <button
                  className="px-2 outline-1 rounded-sm cursor-pointer mt-2"
                  onClick={() => {
                    setPictureToDelete(picture.id);
                    dialogRef.current.open();
                  }}
                >
                  Delete
                </button>
              </div>
            ),
          )}
        </div>
      )}
      <Dialog
        title="Are you sure?"
        onClickHandle={() => mutation.mutate(pictureToDelete)}
        ref={dialogRef}
      />
    </div>
  );
}

type DialogProps = {
  title: string;
  description?: string;
  onClickHandle: () => void;
};

const Dialog = forwardRef(
  ({ title, description, onClickHandle }: DialogProps, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => {
      return {
        open() {
          dialogRef.current!.showModal();
        },
        close() {
          dialogRef.current!.close();
        },
      };
    }, []);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          dialogRef.current!.close();
        }
      };

      // const handleOnClick = (e: MouseEvent) => {
      //   const curTarget = e.target;

      //   console.log(curTarget);
      //   if (!curTarget.closest("dialog")) {
      //     dialogRef.current!.close();
      //   }
      // };

      document.addEventListener("keydown", handleKeyDown);
      // document.addEventListener("mouseup", handleOnClick);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // document.removeEventListener("mouseup", handleOnClick);
      };
    }, []);

    return createPortal(
      <dialog
        ref={dialogRef}
        className="m-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
      >
        <div className="w-[90vw] max-w-md rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => dialogRef.current!.close()}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClickHandle();
                dialogRef.current!.close();
              }}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      </dialog>,
      document.getElementById("dialog")!,
    );
  },
);
