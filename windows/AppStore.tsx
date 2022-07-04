import { useEffect, useRef, useState } from "react";
import AppStoreIcon from "../components/AppStoreIcon";
import Window from "../components/Window";
import FileMgr from "../features/file/FileMgr";
import { File } from "../features/file/FileTypes";
import Path from "../scripts/Path";
import styles from "../styles/AppStore.module.css";

export default function AppStore(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "AppStore";
  proc.rect = proc.rect ?? {
    top: "10%",
    left: "15%",
    width: "70%",
    height: "80%",
  };
  const filemgr = FileMgr.getInstance();
  const makeFile = filemgr.makeFile;
  const [_id, _setId] = useState(1);
  let __id = 1;
  const fetchAndIncrementId = () => {
    return __id++;

    let retval: number;
    _setId((id) => {
      retval = id;
      return id + 1;
    });
    return retval;
  };

  interface FileState {
    id: number;
    file: File;
    show: boolean;
  }
  const initialFileState: FileState[] = [
    // makeFile("~/JamHub", "hub"),
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Terminal", "terminal"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/System Info", "systeminfo"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Notepad", "notepad"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Postman", "postman"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Atelier", "atelier"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Logger", "logger"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/About", "about"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Settings", "settings"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: makeFile("~/Styler", "styler"),
      show: true,
    },
    {
      id: fetchAndIncrementId(),
      file: filemgr.makeFile("~/Finder", "finder", { exeCmd: "finder ~" }),
      show: true,
    },
  ];

  const foundAny = () => {
    return files.some((f) => f.show);
  };

  const [files, setFiles] = useState(initialFileState);
  const [searchValue, setSearchValue] = useState("");

  const dictionary = () => {
    const retval = [];
    files.map((file: FileState) => {
      retval.push([file.file.node.type, file.id]);
      retval.push([new Path(file.file.node.path).last, file.id]);
    });
    return retval;
  };

  const handleInput = (e) => {
    // console.log("searchValue in handleInput:", searchValue);
    const onEscape = e.key === "Escape";
    const val = onEscape ? "" : e.target.value;
    if (val === "") {
      setFiles((files) =>
        files.map((file) => {
          file.show = true;
          return file;
        })
      );
      return;
    }
    const dic = dictionary();
    const found = dic.reduce((prev, cur) => {
      if ((cur[0] as string).includes(val)) {
        prev.push(cur[1]);
      }
      return prev;
    }, []);
    setFiles((_files) => {
      return _files.map((file) => {
        if (found.includes(file.id)) {
          file.show = true;
        } else {
          file.show = false;
        }
        return file;
      });
    });
  };

  const searchElem = useRef(null);
  useEffect(() => {
    searchElem.current?.focus();
  }, []);
  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`}>
        <h1 className="title">JamOS AppStore</h1>
        <textarea
          spellCheck={false}
          rows={1}
          className={`${styles["input-box"]} ${styles["ver-center"]}`}
          ref={searchElem}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleInput(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchValue("");
              handleInput(e);
            }
          }}
          placeholder="Search Apps"
        />
        <p className={`${styles.paragraph} ${styles.desc}`}>
          Add/Remove apps on your desktop💻
        </p>
        {foundAny() ? (
          <div className={`${styles["icon-container"]}`}>
            {files
              .map((file, id) => {
                if (file.show) {
                  return <AppStoreIcon file={file.file} key={id} />;
                } else {
                  return undefined;
                }
              })
              .filter((f) => f !== undefined)}
          </div>
        ) : (
          <div className={`${styles["not-found"]}`}>
            No app found🥲 : {searchValue}
          </div>
        )}
      </div>
    </Window>
  );
}
