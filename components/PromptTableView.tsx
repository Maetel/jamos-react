import Log from "../features/log/Log";
import { randomId } from "../scripts/utils";

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
    return (
      <div
        className="table-title"
        style={{
          fontWeight: "600",
          fontSize: "1.4rem",
          padding: "10px 0px 7px 15px",
        }}
      >
        {data.title}
      </div>
    );
  };
  const TableDesc = () => {
    if (!data.desc) {
      return;
    }
    return (
      <div
        className="table-desc"
        style={{
          fontWeight: "400",
          padding: "0px 0px 10px 15px",
        }}
      >
        {data.desc}
      </div>
    );
  };

  const TableHeads = () => {
    if (!data.heads) {
      return;
    }

    return (
      <thead>
        <tr>
          {data.heads.map((head, i) => {
            return (
              <th scope="col" key={i}>
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
      <table className="table-content">
        <TableHeads {...props} />
        <tbody>
          {data.rows.map((row, i) => {
            return (
              <tr className="table-row" key={i}>
                {row.map((col, j) => {
                  return (
                    <td
                      className="table-col"
                      key={j}
                      style={{
                        fontWeight: "300",
                        padding: "3px 20px",
                      }}
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
      className="container"
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
