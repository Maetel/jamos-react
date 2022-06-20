import ProcMgr from "../features/procmgr/ProcMgr";
import Path from "../scripts/Path";
import styles from "../styles/PromptGridView.module.css";

export interface PromptFileViewGroup {
  type: string;
  color: string;
  items: string[];
}

export default function PromptGridView(props) {
  const pwd: Path = new Path(props.pwd);
  const onItemClick = (e, path: string) => {
    // console.log(`p / pwd.p  :${path} / ${pwd.path}`);
    ProcMgr.getInstance().exeFile(new Path(pwd.path + "/" + path));
  };

  const groups = props.groups;
  return groups && groups.length > 0 ? (
    <div className={styles.container}>
      {groups.map((group, i) => {
        return (
          <div className={styles.gridContainer} key={i}>
            {group.items.map((item, j) => {
              return (
                <span className="item-container" key={j}>
                  <span
                    className={styles.item}
                    // bind:this={items[i][j].elem}
                    onClick={(e) => {
                      onItemClick(e, item);
                    }}
                  >
                    {item}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  ) : undefined;
}
