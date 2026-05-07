import z from "zod";
import type { Picture } from "../routes/_main-layout.post-picture";

export async function getAllPictures() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/api/pictures`,
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function getUserPictures() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/api/user-pictures`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function postPicture(pictureData: z.infer<typeof Picture>) {
  const pictureFormData = new FormData();
  pictureFormData.set("picture", pictureData.picture);
  pictureFormData.set("textForPicture", pictureData.textForPicture);

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/api/picture`,
    {
      method: "POST",
      credentials: "include",
      body: pictureFormData,
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Network response was not ok", {
      cause: response.status,
    });
  }
  return data;
}

export async function deletePicture(id: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/api/picture?id=${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}
