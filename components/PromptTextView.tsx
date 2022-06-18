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
    console.log("Text elem. props : ", props);
    if (!props?.data?.text) {
      return;
    }
    return (
      <div
        className="text"
        style={{
          width: "100%",
          lineHeight: "2rem",
          //not compatible in react?
          overflowWrap: "break-word",
          color: "#333",
        }}
      >
        &nbsp;&gt;&nbsp;{props.text}
      </div>
    );
  };
  const LineElem = (props) => {
    if (!props?.data?.line) {
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
