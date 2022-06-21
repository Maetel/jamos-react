import Log from "../features/log/Log";
import { randomId } from "../scripts/utils";
import styles from "../styles/PromptTableView.module.css";

export interface TableData {
  title?: string;
  desc?: string;
  firstColumnColor?: string;
  heads?: string[];
  rows?: Array<any>[];
}

export default function PromptTableView(props) {
  if (!props.tableData) {
    Log.error("no table data!");
    return;
  }
  const data = props.tableData;
  // console.log("Table data : ", data);
  const thisViewId = randomId();
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
              <th scope="col" key={i} className={styles.tableCol}>
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
                    <td className={styles.tableCol} key={j}>
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
