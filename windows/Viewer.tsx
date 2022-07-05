import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Loading from "../components/Loading";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import styles from "../styles/Viewer.module.css";

const fallbackOnLoad = "/imgs/imageerror.svg";

export default function Viewer(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Image viewer";
  proc.resize = proc.resize ?? "none";
  const initalNodePath = proc.node?.path ?? fallbackOnLoad;

  const colors = JamOS.theme.colors;
  const filemgr = JamOS.filemgr;
  const navButtonColors = {
    color: colors["2"],
    backgroundColor: `${colors["1"]}aa`,
  };

  //states
  const [loading, setLoading] = useState(false);
  const [nodePath, setNodePath] = useState(initalNodePath ?? "");
  const [path, setPath] = useState("");
  const [alt, setAlt] = useState("");
  const [src, setSrc] = useState(fallbackOnLoad);
  const [pageNumber, setPageNumber] = useState("");
  const _dir = filemgr.dirReadable(new Path(nodePath).parent);

  //bindings
  const contElem = useRef<HTMLDivElement>(null);
  const navNext = useRef<HTMLDivElement>(null);
  const navPrev = useRef<HTMLDivElement>(null);
  const pathViewElem = useRef<HTMLDivElement>(null);

  const onImageLoad = function (e) {
    const _w = e.naturalWidth;
    const _h = e.naturalHeight;
    // console.log("Image nw / nh : ", _w, "/", _h);
    let h = 80;
    const viewH = innerHeight * (h / 100.0) - 30;
    const viewW = viewH * (_w / _h);
    let w = (viewW * 100.0) / innerWidth;
    if (w > 80) {
      //horizontal
      // console.log("Is hor");
      const w = 80;
      const viewW = innerWidth * (w / 100.0);
      const viewH = viewW * (_h / _w);
      h = (viewH * 100.0) / innerHeight;
      console.log("H : ", h);
    }
    let top, left, width, height;
    top = `${Math.floor((100 - h) / 2.0)}%`;
    left = `${Math.floor((100 - w) / 2.0)}%`;
    width = `${w}%`;
    height = `${h}%`;

    const rect = {
      top: top,
      left: left,
      width: width,
      height: height,
    };
    console.log("Rect : ", rect);
    JamOS.procmgr.set(proc.id, { rect: rect });
    // setWindowRect(rect);
  };

  const toNext = () => {
    // const nextIdx =
    //   thisIndex() >= dirWatcher.imgs.length - 1 ? 0 : thisIndex() + 1;
    // setPath(dirWatcher.imgs.at(nextIdx));
  };
  const toPrev = () => {
    // const prevIdx =
    //   thisIndex() <= 0 ? dirWatcher.imgs.length - 1 : thisIndex() - 1;
    // setPath(dirWatcher.imgs.at(prevIdx));
  };

  const setSrcPath = (path: string) => {
    setNodePath(path ?? "");
    setSrc(
      path.length
        ? filemgr.fileValue(nodePath)?.data?.["src"] ?? fallbackOnLoad
        : fallbackOnLoad
    );
    if (path.length) {
      navNext.current.style.setProperty("display", "normal");
      navPrev.current.style.setProperty("display", "normal");
    } else {
      navNext.current.style.setProperty("display", "none");
      navPrev.current.style.setProperty("display", "none");
    }

    // setPageNo();
  };

  useEffect(() => {
    setSrcPath(initalNodePath);
  }, []);

  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`} ref={contElem}>
        <div className={`${styles.imgWrapper}`}>
          <Image
            src={src}
            alt={alt}
            layout="fill"
            className="image"
            onLoad={(e) => {
              setLoading(true);
            }}
            onLoadingComplete={(e) => {
              onImageLoad(e);
              setLoading(false);
            }}
          />
          {/* {#if src.length === 0}
          <div className="no-image">No image found!</div>
        {/if} */}
        </div>
        <div
          className={`${styles.nav} ${styles.next}`}
          style={navButtonColors}
          ref={navNext}
          onClick={toNext}
        >
          {/* &gtcc; */}
          &#10919;
        </div>
        <div
          className={`${styles.nav} ${styles.prev}`}
          style={navButtonColors}
          ref={navPrev}
          onClick={toPrev}
        >
          {/* &ltcc; */}
          &#10918;
        </div>
        <span className={`${styles.pathView}`} ref={pathViewElem}>
          {nodePath}&nbsp;{pageNumber}
        </span>
      </div>
      {loading && <Loading></Loading>}
    </Window>
  );
}
