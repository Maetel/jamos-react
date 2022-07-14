import React, { useEffect, useRef, useState } from "react";
import { FileDialProps } from "../components/FileDialogue";
import FinderIcon, { FinderIconProps } from "../components/FinderIcon";
import Window from "../components/Window";
import { Node } from "../features/file/FileTypes";
import CallbackStore from "../features/JamOS/CallbackStore";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import Path from "../scripts/Path";

import styles from "../styles/Finder.module.css";

//generalize to re-use in Desktop component
export function handleFinderIconDrop(procId: string) {
  return (e) => {
    const path = e.dataTransfer.getData("text/plain");
    if (path) {
      const refined = new Path(path);
      const to =
        procId === "system"
          ? "~"
          : JamOS.procmgr.getValue(procId, "currentPath");

      const dest = path.replace(refined.parent, to);
      if (path === dest || path === to) {
        return;
      }
      JamOS.filemgr.mv(path, dest);
      JamOS.setNotif(`Moved ${path} to ${dest}`);
    }
  };
}

export interface NodesViewProps {
  owner: string;
  nodes: Node[];
  excls?: string[];
  incls?: string[];

  onIconClick?: (node) => void;
  // onNodeDrag?: (node: Node) => (e) => void;
  // onNodeDrop?: (node: Node) => (e) => void;
}
export function NodesView(props) {
  const nodesViewProps: NodesViewProps = props.nodesViewProps;
  const { owner, nodes, excls, incls } = nodesViewProps;
  const { onIconClick } = nodesViewProps;

  return (
    <>
      {nodes.map((node, i) => {
        if (excls?.includes(node.type)) {
          return;
        }

        if (!incls || incls?.includes(node.type) || node.type === "dir") {
          const _props: FinderIconProps = {
            node: node,
            owner: owner,
            onClick: onIconClick,
          };
          return React.createElement(FinderIcon, {
            key: node.id,
            finderIconProps: _props,
          });
        }
      })}
    </>
  );
}

export function FinderCore(props) {
  const proc: Process = props.proc;
  const callbackId = proc.callbackId;
  const blockExeFile = proc.blockExeFile;
  const backBtn = useRef(null);
  // const initialPath = JamOS.filemgr.dirExists(proc.path) ? proc.path : proc.node.path;
  const initialPath = proc.node?.path ?? proc.path ?? "~";

  const updateNode = () => {
    const node: Node = JamOS.procmgr.getValue(proc.id, "node");
    const curPath = JamOS.procmgr.getValue(proc.id, "currentPath");
    const copied: Node = { ...node, path: curPath };
    JamOS.procmgr.set(proc.id, { node: copied });
  };

  useEffect(() => {
    //prior
    let curPath = initialPath;
    if (JamOS.filemgr.dirExists(curPath)) {
      JamOS.procmgr.set(proc.id, { currentPath: curPath });
      updateNode();
    }
  }, []);
  const currentPath =
    JamOS.procmgr.getReadable(proc.id, "currentPath") ?? initialPath;
  const disableBack = currentPath === "~";
  const setCurrentPath = (path) => {
    JamOS.procmgr.set(proc.id, { currentPath: path });
    updateNode();
  };
  const fileDialProps: FileDialProps = proc.fileDialProps;
  const incls = fileDialProps?.includes;
  const excls = fileDialProps?.excludes;
  const onIconClick = (_node: Node) => {
    const nodeIsDir = () => _node.type === "dir";
    setCurrentPath(nodeIsDir() ? _node.path : currentPath);

    if (!nodeIsDir() && !blockExeFile) {
      procmgr.exeFile(new Path(_node.path));
    }
    CallbackStore.getById(callbackId)?.(_node);
  };
  const browseBack = (e) => {
    const _path = JamOS.procmgr.getValue(proc.id, "currentPath");
    setCurrentPath(new Path(_path).parent);
    return;

    // setCurrentPath(pathList.at(pathList.length - 2) ?? currentPath);
    // setPathList((l) => l.slice(0, -1));
  };

  useEffect(() => {
    if (backBtn?.current) {
      (backBtn.current as HTMLButtonElement).disabled = disableBack;
    }
  });

  const procmgr = JamOS.procmgr;
  const filemgr = JamOS.filemgr;
  const colors = JamOS.theme.colors;
  const [btnHovered, setBtnHovered] = useState(false);
  const buildButtonStyle = () => {
    return btnHovered
      ? {
          color: colors["2"],
          backgroundColor: colors["1"],
        }
      : {
          color: colors["1"],
          backgroundColor: colors["2"],
        };
  };
  const btnStyle = buildButtonStyle();
  ////////////// browse back and forth
  const nodesFromNode = (path: string) => {
    const retval: Node[] = [];
    const d = JamOS.filemgr.dirValue(path);
    if (!d) {
      return undefined;
    }
    d.dirs.forEach((dir) => retval.push(dir.node));
    d.files.forEach((file) => retval.push(file.node));
    return retval;
  };
  const nodes =
    filemgr.nodesReadable(currentPath) ?? nodesFromNode(initialPath);
  const nodesViewProps: NodesViewProps = {
    nodes: nodes,
    owner: proc.id,
    excls: excls,
    incls: incls,
    onIconClick: onIconClick,
  };

  useEffect(() => {
    if (!nodes && !filemgr.dirExists(initialPath)) {
      procmgr.kill(proc.id);
    }
    if (proc.hideOnToolbar) {
      return;
    }
    JamOS.procmgr
      .removeAllToolbarItems(proc.id)
      .addToolbarItem(proc.id, "Finder", "New directory", () => {
        filemgr.mkdir(Path.join(currentPath, "New directory").path);
      });
    procmgr.set(proc.id, { desc: currentPath });
  }, [currentPath]);

  const handleDragLeave = (e) => {};
  const handleDragEnter = (e) => {
    const isDragging = procmgr.getValue("system", "finderIconDragging");
    procmgr.setFront(proc.id);
    procmgr.blink(proc.id);
  };
  // const handleDrop = (e) => {
  //   const path = e.dataTransfer.getData("text/plain");
  //   if (path) {
  //     const refined = new Path(path);
  //     const dest = path.replace(refined.parent, currentPath);
  //     if (path === dest) {
  //       return;
  //     }
  //     filemgr.mv(path, dest);
  //     JamOS.setNotif(`Moved ${path} to ${dest}`);
  //   }
  // };
  const handleDrop = handleFinderIconDrop(proc.id);

  useEffect(() => {
    //drag action delegate to window
    CallbackStore.register(
      `${proc.id}/FinderIcon/onDragEnter`,
      handleDragEnter
    );
    CallbackStore.register(
      `${proc.id}/FinderIcon/onDragLeave`,
      handleDragLeave
    );
    CallbackStore.register(`${proc.id}/FinderIcon/onDrop`, handleDrop);

    procmgr.set(proc.id, {
      onDragEnter: `${proc.id}/FinderIcon/onDragEnter`,
      onDragLeave: `${proc.id}/FinderIcon/onDragLeave`,
      onDrop: `${proc.id}/FinderIcon/onDrop`,
    });
  }, []);

  return (
    nodes && (
      <div
        className={styles.container}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        // onDragEnter={handleDragEnter}
        // onDragLeave={handleDragLeave}
        // onDrop={handleDrop}
      >
        <div className={styles.browser}>
          <button
            className={`${styles.browserContent} ${styles.button}`}
            ref={backBtn}
            onClick={browseBack}
            onMouseEnter={() => {
              setBtnHovered(true && !disableBack);
            }}
            onPointerLeave={() => {
              //TODO
              //note : onMouseLeave event is not triggered when disabled, react bug
              setBtnHovered(false && !disableBack);
            }}
            style={btnStyle}
          >
            &larr;
            {/* <div className={styles.iconWrapper}>
            <ShimmerImage
              src={"/imgs/back.svg"}
              width={20}
              height={20}
            ></ShimmerImage>
          </div> */}
          </button>
          {/* <button
            className={`${styles.browserContent} ${styles.button}`}
            ref={forwardBtn}
            onClick={browseForward}
          >
            &rarr;
          </button> */}
          <span className={`${styles.browserContent} ${styles.path}`}>
            {currentPath}
          </span>
        </div>
        <div className={styles.iconContainer}>
          <NodesView nodesViewProps={nodesViewProps}></NodesView>
        </div>
      </div>
    )
  );
}

export default function Finder(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Finder";
  proc.resize = proc.resize ?? "both";
  // const currentPath = JamOS.procmgr.getReadable(proc.id, 'currentPath');
  // useEffect(()=>{},[currentPath]);

  return (
    <Window {...props} proc={proc}>
      <FinderCore proc={proc}></FinderCore>
    </Window>
  );
}
