import Image from "next/image";
import JamOS from "../features/JamOS/JamOS";

export default function ShimmerImage(props) {
  const colors = JamOS.theme.colors;

  const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="${colors["1"]}" offset="20%" />
      <stop stop-color="${colors["3"]}" offset="50%" />
      <stop stop-color="${colors["2"]}" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${colors["1"]}" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite"  />
</svg>`;

  const toBase64 = (str) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return (
    <Image
      {...props}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(
        shimmer(props.width ?? 90, props.height ?? 90)
      )}`}
    ></Image>
  );
}
