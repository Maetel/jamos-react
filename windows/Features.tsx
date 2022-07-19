import { useEffect, useRef, useState } from "react";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Features.module.css";

interface FeatItem {
  name: string;
  type: string;
  // src:string,
  desc?: string;
  comp?: JSX.Element;
}

interface FeatDatum {
  items?: FeatItem[];
  title: string;
  desc: string;
}
interface FeatData {
  [key: string]: FeatDatum;
}
const data: FeatData = {
  system: {
    title: "JamOS",
    desc: "Basic functions of JamOS",
    items: [
      {
        type: "toolbar",
        name: "Toolbar",
        desc: "Toolbar is where you can find the most basic functions of JamOS. Even when there are no apps on the desktop, you can still find the most essential functions on the toolbar.",
      },
      {
        type: "dock",
        name: "Dock",
        desc: "Dock is where you can place favorite apps and find minimized apps. You can toggle dock either by right-clicking on the Dock menu or via Toolbar menu.",
      },
    ],
  },
  jamhub: {
    title: "JamHub",
    desc: "Sign in and Sign up",
  },
  worldeditor: {
    title: "World Editor",
    desc: "You can create/update/delete your worlds here.",
  },
  appstore: {
    title: "AppStore",
    desc: "Add/Remove apps on your desktop.",
  },
  terminal: {
    title: "Terminal",
    desc: "Command Line Interface(CLI) for JamOS",
    items: [
      {
        type: "toolbar",
        name: "Toggle toolbar",
      },
      {
        type: "dock",
        name: "Toggle dock",
      },
    ],
  },
  finder: {
    title: "Finder",
    desc: "File system explorer",
    items: [
      {
        type: "browse",
        name: "Browse",
        desc: "Browse back and forth using browse button.",
      },
      {
        type: "drag",
        name: "Drag",
        desc: "Drag files and directories to move.",
      },
    ],
  },
  styler: {
    title: "Styler",
    desc: "Set OS theme",
  },
  notepad: {
    title: "Notepad",
    desc: "A texteditor where you can edit and save text files.",
  },
  viewer: {
    title: "Image viewer",
    desc: "JamOS image viewer",
  },
  atelier: {
    title: "Atelier",
    desc: "Generative art canvas",
  },
  comments: {
    title: "Comments",
    desc: "A board where visitors can leave a comment.",
  },
};

export default function Features(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "";
  proc.rect = proc.rect ?? {
    width: "800px",
    height: "600px",
  };
  proc.resize = proc.resize ?? "both";

  const scrollTo = JamOS.procmgr.getReadable(proc.id, "scrollTo");
  const doScroll = JamOS.procmgr.getReadable(proc.id, "doScroll");
  useEffect(() => {
    if (scrollTo) {
      (document.getElementById(scrollTo) as HTMLElement)?.scrollIntoView(true);
      JamOS.procmgr.set(proc.id, {});
    }
  }, [doScroll]);

  const buildId = (category: string, ty?: string) => {
    const retval = `jamos-features-${category}${ty ? `-${ty}` : ""}`;
    return retval;
  };

  const colors = JamOS.theme.colors;

  // const arrayOfRefs = useRef([])
  const src = (category: string, type: string) =>
    `/clips/${category}-${type}.webp`;

  const doScrollTo = (id: string) => {
    JamOS.procmgr.set(proc.id, { scrollTo: id });
    JamOS.toggle(proc.id, "doScroll");
  };

  const searchElem = useRef<HTMLTextAreaElement>(null);
  const searchValue = JamOS.procmgr.getReadable(proc.id, "searchValue");
  const setSearchValue = (val: string) =>
    JamOS.procmgr.set(proc.id, { searchValue: val });
  // const [searchValue, setSearchValue] = useState("");
  const invisibilityMap = JamOS.procmgr.getReadable(proc.id, "invisibilityMap");

  useEffect(() => {
    const destVal = searchValue?.trim() ?? "";
    let retval: boolean[] = [];
    if (destVal.length === 0) {
      retval = Object.keys(data).map((el) => false);
    } else {
      const buildSublistDictionary = (key): string => {
        const category = data[key];
        let retval = category.title.toLowerCase();
        retval += category.desc.toLowerCase();
        if (category.items) {
          retval +=
            " " +
            category.items
              .map((subitem) => subitem.name.toLowerCase())
              .join(" ");
        }
        return retval;
      };
      retval = Object.keys(data)
        .map((key) => buildSublistDictionary(key))
        .map((title) => {
          return !title.toLowerCase().includes(destVal.toLowerCase());
        });
    }

    JamOS.procmgr.set(proc.id, { invisibilityMap: [...retval] });
  }, [searchValue]);

  const isInvisible = (idx) => {
    // const val = JamOS.procmgr.getValue(proc.id, `isInvisible${idx}`);
    const val = invisibilityMap?.at(idx);
    if (val) {
      return styles.invisible;
    }
    return "";
  };

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={styles.sectionListContainer}>
          <div className={styles.search}>
            <textarea
              spellCheck={false}
              rows={1}
              className={`${styles["input-box"]}`}
              ref={searchElem}
              value={searchValue}
              onChange={(e) => {
                // e.preventDefault();
                setSearchValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchValue("");
                }
              }}
              placeholder="Search Features"
            />
          </div>
          <ol className={styles.sectionList}>
            {Object.keys(data).map((key, i) => (
              <li
                key={i}
                style={
                  {
                    // fontWeight: thisHovered(i) ? "500" : "300",
                    // textDecoration: thisHovered(i) ? "underline" : "none",
                  }
                }
                className={`${styles.listItem} ${isInvisible(i)}`}
              >
                <span
                  className={styles.liTitle}
                  onClick={(e) => {
                    doScrollTo(buildId(key));
                  }}
                >
                  {i + 1}. {data[key].title}
                </span>

                {data[key].items && (
                  <ol className={styles.subList}>
                    {data[key].items.map((_item, j) => (
                      <li
                        key={j}
                        className={styles.subListItem}
                        onClick={(e) => {
                          doScrollTo(buildId(key, _item.type));
                        }}
                      >
                        {_item.name}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.sectionCore}>
          {Object.keys(data).map((key, i) => {
            const category = data[key];
            return (
              <section
                key={i}
                className={styles.section}
                id={buildId(key)}
                style={{
                  boxShadow: colors.boxShadow,
                }}
              >
                <h1 className={styles.categoryTitle}>{category.title}</h1>
                <div className={styles.categoryDesc}>{category.desc}</div>
                <div className={styles.imageWrapper}>
                  <ShimmerImage
                    src={`/clips/${key}-overall.webp`}
                    alt={key}
                    layout="fill"
                  ></ShimmerImage>
                </div>
                {category?.items?.map((item: FeatItem) => (
                  <article
                    key={buildId(key, item.type)}
                    className={styles.article}
                    id={buildId(key, item.type)}
                  >
                    <div
                      className={styles.separator}
                      style={{ borderBottom: `1px solid ${colors[1]}44` }}
                    ></div>
                    <h4>{item.name}</h4>
                    {item.desc && (
                      <span className={styles.desc}>{item.desc}</span>
                    )}
                    <div className={styles.imageWrapper}>
                      <ShimmerImage
                        src={src(key, item.type)}
                        alt={item.name}
                        layout="fill"
                      ></ShimmerImage>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </Window>
  );
}
