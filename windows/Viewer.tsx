import { useEffect, useRef, useState } from "react";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import { ToolbarControl } from "../grounds/Toolbar";
import Path from "../scripts/Path";
import styles from "../styles/Viewer.module.css";

const fallbackOnLoad = "/imgs/imageerror.svg";

export default function Viewer(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Image viewer";
  proc.resize = proc.resize ?? "none";
  const initialNodePath = proc.node?.path ?? fallbackOnLoad;

  const isFront = JamOS.procmgr.isFront(proc.id);
  const colors = JamOS.theme.colors;
  const filemgr = JamOS.filemgr;
  const navButtonColors = {
    color: colors["2"],
    backgroundColor: `${colors["1"]}aa`,
  };

  const setImageIdx = (idx) => {
    JamOS.procmgr.set(proc.id, { imageIdx: idx });
  };
  const setNodePath = (path) => {
    JamOS.procmgr.set(proc.id, { nodePath: path });
  };

  const handleKey = (e) => {
    const isFront = JamOS.procmgr.getValue(proc.id, "zIndex") === "0";
    if (!isFront) {
      return;
    }
    const keyMap = {
      ArrowLeft: toPrev,
      ArrowRight: toNext,
    };
    keyMap[e.key]?.();
  };

  useEffect(() => {
    ToolbarControl.RegisterBuilder(proc.id).register(
      "Image viewer",
      "Open",
      () => {
        JamOS.procmgr.openFileDialogue(proc.id, "Load", {
          includes: ["image"],
          onOkay: (params) => {
            if (!params) {
              return;
            }
            if (typeof params === "string") {
              params = params.trim();
              const f = filemgr.fileValue(params);
              if (f && f.node.type === "image") {
                setNodePath(params);
              } else {
                JamOS.setNotif(`'${params}' is not an image file.`, "error");
              }
            }
          },
        });
      }
    );
  }, []);

  useEffect(() => {
    console.log("Set intiial node path :", initialNodePath);
    setNodePath(initialNodePath);
    // const { imageIdx, imageCount } = getMeta(initialNodePath);
    const { imageIdx, imageCount } = getMeta();
    setImageIdx(imageIdx);
    // console.log("imageIdx:", imageIdx, ", imageCount:", imageCount);

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  //states
  // const [nodePath, setNodePath] = useState("");
  // const [imageIdx, setImageIdx] = useState(null);
  const nodePathReadable = JamOS.procmgr.getReadable(proc.id, "nodePath");
  const imageIdxReadable = JamOS.procmgr.getReadable(proc.id, "imageIdx");
  const [alt, setAlt] = useState("");
  const [src, setSrc] = useState(fallbackOnLoad);
  const [pageNumber, setPageNumber] = useState("");
  const getMeta = (_nodePath?: string) => {
    const _path = _nodePath ?? JamOS.procmgr.getValue(proc.id, "nodePath");
    const images = filemgr
      .dirValue(new Path(_path).parent)
      ?.files.filter((file) => file.node.type === "image");
    const imageIdx = images?.findIndex((f) => f.node.path === _path);
    const imageCount = images?.length;
    return { imageIdx, imageCount, images };
  };

  //bindings
  const contElem = useRef<HTMLDivElement>(null);
  const navNext = useRef<HTMLDivElement>(null);
  const navPrev = useRef<HTMLDivElement>(null);
  const pathViewElem = useRef<HTMLDivElement>(null);

  const onImageLoad = function (e) {
    const _w = e.naturalWidth;
    const _h = e.naturalHeight;

    if (0) {
      const rect = {
        width: _w + 30,
        height: _h,
      };
      JamOS.procmgr.set(proc.id, { rect: rect });
    } else {
      //fit to 80% of screen

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
      JamOS.procmgr.set(proc.id, { rect: rect });
    }
  };

  const toNext = () => {
    const { imageIdx, imageCount } = getMeta();
    let nextIdx = imageIdx + 1;
    if (nextIdx >= imageCount) {
      nextIdx = 0;
    }
    const retval = typeof nextIdx === "number" ? nextIdx : undefined;
    JamOS.procmgr.set(proc.id, { imageIdx: retval });
  };

  const toPrev = () => {
    const { imageIdx, imageCount } = getMeta();
    let prevIdx = imageIdx - 1;
    if (prevIdx < 0) {
      prevIdx = imageCount - 1;
    }
    const retval = typeof prevIdx === "number" ? prevIdx : undefined;
    JamOS.procmgr.set(proc.id, { imageIdx: retval });
  };

  useEffect(() => {
    const { imageIdx, imageCount, images } = getMeta();
    const path = images?.at(imageIdxReadable)?.node.path;
    JamOS.procmgr.set(proc.id, { nodePath: path });
  }, [imageIdxReadable]);

  useEffect(() => {
    const _setsrc = nodePathReadable?.length
      ? filemgr.fileValue(nodePathReadable)?.data?.["src"] ?? fallbackOnLoad
      : fallbackOnLoad;
    setSrc(_setsrc);
    let windowName = "Image viewer";
    if (nodePathReadable?.length) {
      // console.log("nodePathReadable.length: true");
      navNext.current.style.setProperty("display", "flex");
      navPrev.current.style.setProperty("display", "flex");

      const { imageIdx, imageCount } = getMeta();
      windowName =
        "Image viewer - " +
        nodePathReadable +
        ` [${imageIdx + 1}/${imageCount}]`;
    } else {
      // console.log("nodePathReadable.length: false");
      navNext.current.style.setProperty("display", "none");
      navPrev.current.style.setProperty("display", "none");
      JamOS.procmgr.set(proc.id, { rect: { width: 200, height: 200 } });
      // JamOS.setNotif("No image found", "error");
    }
    JamOS.procmgr.set(proc.id, {
      name: windowName,
    });
  }, [nodePathReadable]);

  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`} ref={contElem}>
        <div className={`${styles.imgWrapper}`}>
          {src.length === 0 ? (
            <div className="noImage">No image found!</div>
          ) : (
            <ShimmerImage
              src={src}
              alt={alt}
              layout="fill"
              className="image"
              onLoadingComplete={(e) => {
                // onLoad={(e) => {
                onImageLoad(e);
              }}
            />
          )}

          {/* {#if src.length === 0}
          <div className="no-image">No image found!</div>
        {/if} */}
        </div>
        <div
          className={`${styles.nav} ${styles.next}`}
          style={navButtonColors}
          ref={navNext}
          onClick={() => {
            toNext();
          }}
        >
          {/* &gtcc; */}
          &#10919;
        </div>
        <div
          className={`${styles.nav} ${styles.prev}`}
          style={navButtonColors}
          ref={navPrev}
          onClick={() => {
            toPrev();
          }}
        >
          {/* &ltcc; */}
          &#10918;
        </div>
        <span className={`${styles.pathView}`} ref={pathViewElem}>
          {nodePathReadable}&nbsp;{pageNumber}
        </span>
      </div>
    </Window>
  );
}
