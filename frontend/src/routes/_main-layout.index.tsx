import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getAllPictures } from "../lib/picture-requests";
import { useEffect, useRef, useState } from "react";
import { useRateLimit } from "../lib/hooks";

export const Route = createFileRoute("/_main-layout/")({
  component: Index,
});

const MIN_PIC_WIDTH_BIG = 220;
const MIN_PIC_WIDTH_SMALL = 140;
const GAP_RELATIVE_SIZE_TO_PICTURE_WIDTH = 0.05;

interface Picture {
  picture_url: string;
  text_for_picture: string;
  id: string;
  width: number;
  height: number;
}

// My cursed child of a grid %_%
function Index() {
  const query = useQuery({
    queryKey: ["pictures-all"],
    queryFn: getAllPictures,
  });

  const heightsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pictureboardParams, setPictureboardParams] = useState<{
    cols: number;
    pictureWidth: number;
    containerWidth: number;
    gapSize: number;
  } | null>(null);

  const onContainerResize = useRateLimit(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    let cols = 1;
    if (containerWidth < MIN_PIC_WIDTH_BIG * 2)
      cols = containerWidth / MIN_PIC_WIDTH_SMALL;
    else cols = containerWidth / MIN_PIC_WIDTH_BIG;
    cols = Math.floor(cols);

    const predictedPictureWidth = containerWidth / cols;
    const gapSize = predictedPictureWidth * GAP_RELATIVE_SIZE_TO_PICTURE_WIDTH;
    const pictureWidth = (containerWidth - gapSize * (cols - 1)) / cols;
    heightsRef.current = new Array(cols).fill(0);
    setPictureboardParams({ cols, pictureWidth, containerWidth, gapSize });
  }, 500);

  useEffect(() => {
    onContainerResize();
    window.addEventListener("resize", onContainerResize);

    return () => {
      window.removeEventListener("resize", onContainerResize);
    };
  }, []);

  let containerHeight = 0;
  if (pictureboardParams && query.isSuccess) {
    containerHeight = query.data.data
      .filter((_: any, i: number) => i % pictureboardParams.cols === 0)
      .reduce(
        (acc: number, cur: Picture) =>
          acc + cur.height * (pictureboardParams.pictureWidth / cur.width),
        0,
      );
  }

  return (
    <div
      ref={containerRef}
      className="w-[calc(100%-1rem)] md:w-[calc(100%-4rem)] mx-auto relative"
      style={{
        height: `${containerHeight}px`,
      }}
    >
      {pictureboardParams &&
        query.isSuccess &&
        query.data.data.map(
          (
            {
              id,
              picture_url,
              width: widthRaw,
              height: heightRaw,
              text_for_picture,
            }: Picture,
            i: number,
          ) => {
            const {
              cols,
              pictureWidth: relativeWidth,
              gapSize,
            } = pictureboardParams;

            const posX = i % cols;
            const scale = relativeWidth / widthRaw;
            const relativeHeight = heightRaw * scale;

            if (i - cols >= 0) {
              heightsRef.current[posX] += relativeHeight + gapSize;
            } else {
              heightsRef.current[posX] = relativeHeight;
            }

            return (
              <div
                key={id}
                style={{
                  height: heightRaw,
                  width: widthRaw,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  scale: scale,
                  translate: `${posX * (relativeWidth + gapSize)}px ${heightsRef.current[posX] - relativeHeight}px`,
                  transition: "translate 0.15s, scale 0.15s",
                  transformOrigin: "top left",
                  borderRadius: `${16 / scale}px`,
                  overflow: "hidden",
                }}
              >
                <img
                  src={picture_url}
                  alt={text_for_picture}
                  className="hover:brightness-90 cursor-pointer"
                ></img>
              </div>
            );
          },
        )}
    </div>
  );
}
