import Image from "next/image";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";

const fallbackOnLoad = "/imgs/imageerror.svg";

export default function Viewer(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Image viewer";
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000));
  const [src, setSrc] = useState<string>("https://picsum.photos/400");
  useEffect(() => {}, [seed]);
  const colors = JamOS.theme.colors;

  return (
    <Window {...props} proc={proc}>
      <Image
        onLoad={() => {
          JamOS.setNotif("Loading image...");
          setLoading(true);
        }}
        onLoadingComplete={() => {
          setLoading(false);
          JamOS.setNotif("Image successfully loaded");
        }}
        onError={() => {
          setSrc(fallbackOnLoad);
          JamOS.setNotif("Failed to load image", "error");
          setLoading(false);
        }}
        src={src}
        objectFit="cover"
        layout="fill"
      ></Image>
      {loading && (
        <Loading barHeight={"30px"} background={colors["2"] + "88"}></Loading>
      )}
    </Window>
  );
}
