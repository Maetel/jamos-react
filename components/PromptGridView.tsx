import { useAppSelector } from "../app/hooks";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import Path from "../scripts/Path";
import styles from "../styles/PromptGridView.module.css";

export interface PromptFileViewGroup {
  type: string;
  color?: string;
  bgColor?: string;
  items: string[];
  cmds?: string[];
}

export default function PromptGridView(props) {
  const sel = useAppSelector;
  const theme = SetMgr.getInstance().themeReadable(sel);
  const _colors = theme.colors;
  const buildColor = (type, color?: string, bgColor?: string) => {
    const retval = {
      color: _colors["1"],
    };
    switch (type) {
      case "Directory":
        retval["color"] = _colors["2"];
        retval["backgroundColor"] = _colors["1"];
        break;
      case "Application":
        retval["color"] = _colors["3"];
        retval["backgroundColor"] = _colors["2"];
        break;
      case "Text file":
        retval["color"] = _colors["1"];
        // retval["backgroundColor"] = _colors["3"];
        break;
      default:
        break;
    }
    retval.color = color ?? retval.color;
    retval["backgroundColor"] = bgColor ?? retval["backgroundColor"];
    return retval;
  };

  const groups: PromptFileViewGroup[] = props.groups;
  return groups && groups.length > 0 ? (
    <div className={styles.container}>
      <div className={styles.gridContainer}>
        {groups.map((group, i) => {
          return (
            <>
              {group.items.map((item, j) => {
                return (
                  <span className="item-container" key={j}>
                    <span
                      className={styles.item}
                      // bind:this={items[i][j].elem}
                      onClick={(e) => {
                        // console.log("Cmds/j : ", group.cmds, ", ", j);
                        // console.log("Cmd : ", group.cmds?.at(j));
                        if (group.cmds?.at(j)) {
                          ProcMgr.getInstance().exeCmd(group.cmds.at(j));
                        }
                      }}
                      style={{
                        ...buildColor(group.type, group.color, group.bgColor),
                      }}
                    >
                      {item}
                    </span>
                  </span>
                );
              })}
            </>
          );
        })}
      </div>
    </div>
  ) : undefined;
}
