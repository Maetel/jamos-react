import Window from "../components/Window";

export default function TestWindow(props) {
  return (
    <Window props={props}>
      <div className="test-window">
        This is a test window of id : {props.proc.id}
      </div>
    </Window>
  );
}
