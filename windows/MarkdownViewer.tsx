import Window from "../components/Window";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/MarkdownViewer.module.css";

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
  proc.name = proc.name ?? "";
  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Window>
  );
}
