import { useEffect, useRef, useState } from "react";
import Window from "../components/Window";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/MarkdownViewer.module.css";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import type { File, Dir } from "../features/file/FileTypes";
import CallbackStore from "../features/JamOS/CallbackStore";

import ReactMarkdown from "react-markdown";

const block = "```";
const content = ` # Title Content
${block}
  const codeblock = undefined;
${block}
*emphasis* as an example

### second header
another content.

### third header
another content.
`;

export default function MarkdownViewer(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Markdown viewer";
  proc.resize = "both";
  const initialNodePath =
    proc.node && proc.node.type === "text" ? proc.node.path : undefined;

  const isFront = JamOS.procmgr.isFront(proc.id);
  const colors = JamOS.theme.colors;
  const filemgr = JamOS.filemgr;
  const navButtonColors = {
    color: colors["2"],
    backgroundColor: `${colors["1"]}aa`,
  };

  const setFileIdx = (idx) => {
    JamOS.procmgr.set(proc.id, { fileIdx: idx });
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

  const handleDrop = (e) => {
    const path = e.dataTransfer.getData("text/plain");
    console.log("Drop path : ", path);
    if (!path || path.length === 0) {
      return;
    }

    // const refined = new Path(path);
    let errorMessage = `Cannot open on Markdown Viewer : '${path}'`;
    let found = false;
    const d: Dir = filemgr.dirValue(path);
    if (d) {
      const f: File = d.files.find((file) => file.node.type === "text");
      if (f) {
        setNodePath(f.node.path);
        found = true;
      } else {
        errorMessage = "No markdown found in " + path;
      }
    }

    const f: File = filemgr.fileValue(path);
    if (f && f.node.type === "text") {
      setNodePath(f.node.path);
      found = true;
    }

    if (!found) {
      JamOS.setNotif(errorMessage, "error");
    }
  };
  useEffect(() => {
    CallbackStore.register(`${proc.id}/MarkdownViewer/onDrop`, handleDrop);
    JamOS.procmgr.set(proc.id, {
      onDrop: `${proc.id}/MarkdownViewer/onDrop`,
    });
  }, []);

  const openLoadDirDialogue = () => {
    JamOS.procmgr.openFileDialogue(proc.id, "Load", {
      name: "Open Directory",
      pathHint: new Path(nodePathReadable).parent,
      includes: ["dir"],
      onOkay: (params) => {
        if (!params) {
          return;
        }
        if (typeof params === "string") {
          params = params.trim();
          const d = filemgr.dirValue(params);
          let errorMessage = null;
          if (d) {
            const f: File = d.files.find((file) => file.node.type === "text");
            if (f) {
              setNodePath(f.node.path);
            } else {
              errorMessage = "No markdown found in " + Path.fromFile(d).last;
            }
          } else {
            errorMessage = Path.fromFile(d).last + " is not a directory";
          }
          if (errorMessage) {
            JamOS.setNotif(errorMessage, "error");
          }
        }
      },
    });
  };

  const openLoadFileDialogue = () => {
    JamOS.procmgr.openFileDialogue(proc.id, "Load", {
      name: "Open Markdown",
      pathHint: new Path(nodePathReadable).parent,
      includes: ["text"],
      onOkay: (params) => {
        if (!params) {
          return;
        }
        if (typeof params === "string") {
          params = params.trim();
          const f = filemgr.fileValue(params);
          if (f && f.node.type === "text") {
            setNodePath(params);
          } else {
            JamOS.setNotif(`'${params}' is not a markdown.`, "error");
          }
        }
      },
    });
  };
  useEffect(() => {
    JamOS.procmgr.addToolbarItem(
      proc.id,
      "Markdown Viewer",
      "Open",
      openLoadFileDialogue
    );
  }, []);

  useEffect(() => {
    setNodePath(initialNodePath);
    const { fileIdx, fileCount } = getMeta();
    setFileIdx(fileIdx);

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  //states
  // const [nodePath, setNodePath] = useState("");
  // const [fileIdx, setFileIdx] = useState(null);
  const isImage = () => {
    const p = JamOS.procmgr.getReadable(proc.id, "nodePath");
    return JamOS.filemgr.fileValue(p)?.node.type === "image";
  };
  const nodePathReadable = JamOS.procmgr.getReadable(proc.id, "nodePath");
  const fileIdxReadable = JamOS.procmgr.getReadable(proc.id, "fileIdx");
  const [alt, setAlt] = useState("");
  const [mdContent, setMdContent] = useState(undefined);
  const textAreaValue = JamOS.procmgr.getReadable(proc.id, "textAreaValue");
  const setTextAreaValue = (val: string) => {
    JamOS.procmgr.set(proc.id, { textAreaValue: val });
  };
  const [pageNumber, setPageNumber] = useState("");
  const getMeta = (_nodePath?: string) => {
    const _path = _nodePath ?? JamOS.procmgr.getValue(proc.id, "nodePath");
    const files = filemgr
      .dirValue(new Path(_path).parent)
      ?.files.filter((file) => file.node.type === "text");
    const fileIdx = files?.findIndex((f) => f.node.path === _path);
    const fileCount = files?.length;
    return { fileIdx, fileCount, files };
  };

  //bindings
  const contElem = useRef<HTMLDivElement>(null);
  const navNext = useRef<HTMLDivElement>(null);
  const navPrev = useRef<HTMLDivElement>(null);
  const pathViewElem = useRef<HTMLDivElement>(null);

  const toNext = () => {
    const { fileIdx, fileCount } = getMeta();
    let nextIdx = fileIdx + 1;
    if (nextIdx >= fileCount) {
      nextIdx = 0;
    }
    const retval = typeof nextIdx === "number" ? nextIdx : undefined;
    JamOS.procmgr.set(proc.id, { fileIdx: retval });
  };

  const toPrev = () => {
    const { fileIdx, fileCount } = getMeta();
    let prevIdx = fileIdx - 1;
    if (prevIdx < 0) {
      prevIdx = fileCount - 1;
    }
    const retval = typeof prevIdx === "number" ? prevIdx : undefined;
    JamOS.procmgr.set(proc.id, { fileIdx: retval });
  };

  useEffect(() => {
    const { fileIdx, fileCount, files } = getMeta();
    const path = files?.at(fileIdxReadable)?.node.path;
    JamOS.procmgr.set(proc.id, { nodePath: path });
  }, [fileIdxReadable]);

  useEffect(() => {
    const _setContent = nodePathReadable?.length
      ? filemgr.fileValue(nodePathReadable)?.data?.["text"] ?? ""
      : "";
    setMdContent(_setContent);
    let windowName = "Markdown Viewer";
    let desc = null;
    if (nodePathReadable?.length) {
      // console.log("nodePathReadable.length: true");
      navNext.current.style.setProperty("display", "flex");
      navPrev.current.style.setProperty("display", "flex");

      const { fileIdx, fileCount } = getMeta();
      windowName =
        new Path(nodePathReadable).last + ` [${fileIdx + 1}/${fileCount}]`;
      desc = new Path(nodePathReadable).last;
    } else {
      // console.log("nodePathReadable.length: false");
      navNext.current.style.setProperty("display", "none");
      navPrev.current.style.setProperty("display", "none");
      // JamOS.setNotif("No image found", "error");
    }
    JamOS.procmgr.set(proc.id, {
      name: windowName,
      desc: desc,
    });
  }, [nodePathReadable]);

  const handleContext = (e) => {
    if (!JamOS.procmgr.isFrontValue(proc.id)) {
      return;
    }

    e.preventDefault();
    JamOS.openContextMenu(
      e.pageX,
      e.pageY,
      ["Open Markdown", "Open Directory"],
      [openLoadFileDialogue, openLoadDirDialogue]
    );
  };

  useEffect(() => {
    contElem.current.oncontextmenu = handleContext;
  }, []);

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container} ref={contElem}>
        <div className={styles.mdWrapper}>
          {nodePathReadable?.length === 0 ? (
            <div className="noImage">Click to open a markdown file</div>
          ) : (
            <ReactMarkdown>{mdContent}</ReactMarkdown>
          )}
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
