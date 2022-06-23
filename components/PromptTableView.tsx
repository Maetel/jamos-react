import Log from "../features/log/Log";
import { randomId } from "../scripts/utils";
import styles from "../styles/PromptTableView.module.css";

export interface TableData {
  title?: string;
  desc?: string;
  firstColumnColor?: string;
  heads?: string[];
  rows?: Array<any>[];
  weights?: Array<number>;
}

export default function PromptTableView(props) {
  if (!props.tableData) {
    Log.error("no table data!");
    return;
  }

  const data: TableData = props.tableData;
  const setWeights = () => {
    if (!data.rows || data.rows.length === 0) {
      return;
    }
    const rowWidth = data.rows.at(0).length;
    if (!data.weights) {
      data.weights = new Array(rowWidth).fill(1);
    }
    while (data.weights.length < rowWidth) {
      data.weights.push(1);
    }
    data.weights.map((w, i) => (data.weights[i] > 1 ? data.weights[i] : 1));
  };
  setWeights();
  const weightTotal = data.weights.reduce((prev, next: number) => {
    return prev + next;
  }, 0);
  const buildWidth = (w) => `${(w * 100) / weightTotal}%`;

  // console.log("Total : ", weightTotal);

  const TableTitle = () => {
    if (!data.title) {
      return;
    }
    return <div className={styles.tableTitle}>{data.title}</div>;
  };
  const TableDesc = () => {
    if (!data.desc) {
      return;
    }
    return <div className={styles.tableDesc}>{data.desc}</div>;
  };

  const TableHeads = () => {
    if (!data.heads) {
      return;
    }

    return (
      <thead className={styles.tableHead}>
        <tr>
          {data.heads.map((head, i) => {
            return (
              <th
                scope="col"
                key={i}
                className={styles.tableCol}
                style={{ width: buildWidth(data.weights[i]) }}
              >
                {head}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };
  const TableRows = () => {
    if (!data.rows) {
      return;
    }

    return (
      <table className={styles.tableContent}>
        <TableHeads {...props} />
        <tbody className={styles.tableBody}>
          {data.rows.map((row, i) => {
            return (
              <tr className={styles.tableRow} key={i}>
                {row.map((col, j) => {
                  return (
                    <td
                      className={styles.tableCol}
                      key={j}
                      style={{ width: buildWidth(data.weights[j]) }}
                    >
                      {col}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div
      className={styles.container}
      style={{
        position: "relative",
        width: "100%",
        // color: "#333",
        /* padding-bottom: 10px, */
      }}
    >
      <TableTitle></TableTitle>
      <TableDesc></TableDesc>
      <TableRows></TableRows>
    </div>
  );
}
