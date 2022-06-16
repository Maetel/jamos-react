import Window from "../components/Window";

export default function TestWindow(props) {
  return (
    <Window>
      <div className="test-window">
        This is a test window of id : {props.id}
      </div>
    </Window>
  );
}
