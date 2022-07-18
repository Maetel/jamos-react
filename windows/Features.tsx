import { useEffect, useRef } from "react";
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
  items: FeatItem[];
  title: string;
  desc: string;
}
interface FeatData {
  [key: string]: FeatDatum;
}
const data: FeatData = {
  window: {
    items: [
      { name: "Drag", type: "drag" },
      { name: "File Dialogue", type: "filedialogue" },
    ],
    title: "Window",
    desc: "Base window component.",
  },
  system: {
    items: [
      { name: "Drag", type: "drag" },
      { name: "File Dialogue", type: "filedialogue" },
    ],
    title: "System",
    desc: "Base System component.",
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

  const SectionCore = (props) => {
    const scrollTo = JamOS.procmgr.getReadable(proc.id, "scrollTo");
    const doScroll = JamOS.procmgr.getReadable(proc.id, "doScroll");
    useEffect(() => {
      if (scrollTo) {
        (document.getElementById(scrollTo) as HTMLElement)?.scrollIntoView(
          true
        );
        JamOS.procmgr.set(proc.id, {});
      }
    }, [doScroll]);

    return (
      <div className={styles.sectionCore}>
        {Object.keys(data).map((key, i) => (
          <SectionComp key={i} section={key}></SectionComp>
        ))}
      </div>
    );
  };
  const buildId = (category, ty) => `features-${category}-${ty}`;

  // const arrayOfRefs = useRef([])
  const SectionComp = (props: { section: string }) => {
    const src = (type: string) => `/clips/${type}.webp`;
    const category = props.section;
    const _buildId = (ty: string) => buildId(category, ty);
    return (
      <section className={styles.section}>
        <h1>{category}</h1>
        {data[category]?.items.map((item) => (
          <article
            key={_buildId(item.type)}
            className={styles.article}
            id={_buildId(item.type)}
          >
            <h3>
              {item.name} ({category}/{item.type})
            </h3>
            <div className={styles.imageWrapper}>
              <ShimmerImage
                src={src(item.type)}
                alt={item.name}
                layout="fill"
              ></ShimmerImage>
            </div>

            <span className={styles.desc}>
              description of {category}/{item.type}
            </span>
          </article>
        ))}
      </section>
    );
  };

  const doScrollTo = (id: string) => {
    JamOS.procmgr.set(proc.id, { scrollTo: id });
    JamOS.toggle(proc.id, "doScroll");
  };

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <button
          onClick={(e) => {
            doScrollTo("features-system-drag");
          }}
        >
          to system-drag
        </button>
        <SectionCore></SectionCore>
      </div>
    </Window>
  );
}
