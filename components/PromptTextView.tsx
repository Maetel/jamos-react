import { useAppSelector } from "../app/hooks";
import SetMgr from "../features/settings/SetMgr";
const styles = {
  container: {
    position: "relative",

    width: "100%",
    /* padding-bottom: 10px, */
  },
  text: {
    width: "100%",
    lineHeight: "2rem",
    //not compatible in react?
    overflowWrap: "break-word",
  },
  line: {
    /* position: absolute, */
    width: "96%",
    margin: "0 auto",
    height: "1rem",
    textAlign: "center",
    transform: "translateY(-50%)",
    opacity: "0.2",
  },
};

export default function PromptTextView(props) {
  const TextElem = (props) => {
    if (!props.text) {
      return;
    }
    const setmgr = SetMgr.getInstance();
    const selector = useAppSelector;
    const theme = setmgr.themeReadable(selector);
    const _colors = theme.colors;
    const textColor = () => {
      let retval = _colors["1"];
      const type = props.colorType;
      if (type) {
        retval = _colors[type];
      }
      return retval;
    };
    return (
      <div
        className="text"
        style={{
          width: "100%",
          lineHeight: "2rem",
          //not compatible in react?
          overflowWrap: "break-word",
          color: textColor(),
        }}
      >
        &nbsp;&gt;&nbsp;{props.text}
      </div>
    );
  };
  const LineElem = (props) => {
    if (!props.isLine) {
      return;
    }
    return (
      <div
        className="line"
        style={{
          /* position: absolute, */
          width: "96%",
          margin: "0 auto",
          height: "1rem",
          textAlign: "center",
          transform: "translateY(-50%)",
          opacity: "0.2",
          borderBottom: "1px solid #333",
        }}
      />
    );
  };

  return (
    <div
      className="container"
      style={{
        position: "relative",

        width: "100%",
        /* padding-bottom: 10px, */
      }}
    >
      <TextElem {...props}></TextElem>
      <LineElem {...props}></LineElem>
    </div>
  );
}
