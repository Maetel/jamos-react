import React, { useEffect, useRef } from "react";
import styles from "../styles/Desktop.module.css";
import JamOS from "../features/JamOS/JamOS";
import {
  handleFinderIconDrop,
  NodesView,
  NodesViewProps,
} from "../windows/Finder";
import Path from "../scripts/Path";
import { Dir } from "../features/file/FileTypes";
import ShimmerImage from "../components/ShimmerImage";

const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  const filemgr = JamOS.filemgr;
  const homeNodes = JamOS.filemgr.nodesReadable("~");

  const _colors = JamOS.theme.colors;
  // const proc = JamOS.procmgr.processValue("desktop");

  const nodesViewProps: NodesViewProps = {
    owner: "system",
    nodes: homeNodes,
  };
  const handleDrop = handleFinderIconDrop("system");
  const curPath = "~";

  const handleContext = (e) => {
    if ((e.target as HTMLElement).classList.contains(styles.iconContainer)) {
      e.preventDefault();
      JamOS.closeAllContextMenus();
      JamOS.openContextMenu(
        e.pageX,
        e.pageY,
        ["New directory", "New text file", "__separator__", "Properties"],
        [
          () => {
            JamOS.filemgr.mkdir(Path.join(curPath, "New directory").path);
          },
          () => {
            JamOS.filemgr.touch(Path.join(curPath, "New textfile.txt").path);
          },
          () => {
            const dir = JamOS.filemgr.dirValue("~");
            let totalDirs = 0;
            let totalFiles = 0;
            const dirsInDir = (dir: Dir) => {
              dir.files.forEach((_file) => {
                totalFiles += 1;
              });
              dir.dirs.forEach((_dir) => {
                //exclude self
                totalDirs += 1;
                dirsInDir(_dir);
              });
            };
            dirsInDir(dir);

            JamOS.procmgr.openModal("system", {
              title: `Directory properties`,
              descs: [
                `Path : '~/'`,
                `${dir.dirs.length > 1 ? "Directories" : "Directory"} : ${
                  dir.dirs.length
                }`,
                `${dir.files.length > 1 ? "Files" : "File"} : ${
                  dir.files.length
                }`,
                `${
                  totalDirs > 1 ? "Total directories" : "Total directory"
                } : ${totalDirs}`,
                `${
                  totalFiles > 1 ? "Total files" : "Total file"
                } : ${totalFiles}`,
              ],
              buttons: ["Close"],
              rect: { width: "480px", height: "480px" },
            });
          },
        ]
      );
    }
  };
  const contElem = useRef<HTMLDivElement>(null);
  const jamUser = JamOS.userReadable();
  const signedin = jamUser.signedin;
  useEffect(() => {
    if (contElem.current) {
      contElem.current.oncontextmenu = handleContext;
    }
  }, []);

  const isLoading = JamOS.getReadable("isLoading");
  const colors = JamOS.theme.colors;

  return (
    <div
      id="desktop"
      className={styles.container}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={handleDrop}
      ref={contElem}
    >
      <div className={styles.bgImageWrapper}>
        <img
          className={styles.bgImage}
          src={backgroundImg}
          alt="Desktop background"
        />
        <div
          className={styles.behindImage}
          style={{ backgroundColor: _colors["1"] }}
        />
      </div>
      <div className={styles.iconContainer}>
        <NodesView nodesViewProps={nodesViewProps}></NodesView>
      </div>
      <div
        className={styles.loadingWrapper}
        style={{
          display: isLoading ? "block" : "none",
          boxShadow: colors.boxShadow,
        }}
      >
        <ShimmerImage
          priority
          src={"/imgs/loading.svg"}
          layout="fill"
        ></ShimmerImage>
      </div>
    </div>
  );
}
