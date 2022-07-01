import { useEffect, useRef, useState } from "react";
import Window from "../components/Window";
import { random } from "../scripts/utils";
import styles from "../styles/Atelier.module.css";

export default function Atelier(props) {
  const contElem = useRef(null),
    canvasElem = useRef(null),
    ccElem = useRef(null);
  const [ctx, setCtx] = useState(null);

  const proc = { ...props.proc };
  proc.name = proc.name ?? "Atelier";
  proc.rect = proc.rect ?? {
    top: "10%",
    left: "10%",
    width: "80%",
    height: "80%",
  };

  const setupBuildingforest = () => {
    ctx.lineWidth = 0.2;
    ctx.fillStyle = "#fff5de";
    ctx.strokeStyle = "#3c5186";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
  };

  class Root {
    speedX;
    speedY;
    maxSize;
    size;
    angle;
    color;
    constructor(public x, public y) {
      this.speedX = random(-2, 2);
      this.speedY = random(-2, 2);
      this.maxSize = random(5, 12);
      this.size = random(2, 1);
      this.angle = random(6.28);
      this.color = random(360);
    }
    update() {
      this.x += this.speedX + Math.sin(this.angle);
      this.y += this.speedY + Math.sin(this.angle);
      this.size += 0.1;
      this.angle += 0.2;
      this.color += 2;
      if (this.size < this.maxSize) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.color},100%,50%)`;
        ctx.fill();
        ctx.stroke(); //border. if stroke style not declared, default is black
        requestAnimationFrame(this.update.bind(this));
      }
    }
  }
  class BuildingForest {
    speedX;
    speedY;
    maxSize;
    size;
    angleX;
    angleY;
    color;
    vs;
    vax;
    vay;
    lightness;
    angle;
    va;

    constructor(public x, public y) {
      this.speedX = random(-2, 2);
      this.speedY = random(-2, 2);
      this.maxSize = random(20, 27);
      this.size = random(2, 3);
      this.vs = random(0.5, 0.7); //size velocity
      this.angleX = random(6.28);
      this.vax = random(-0.3, 0.3);
      this.angleY = random(6.28);
      this.vay = random(-0.3, 0.3);
      this.angle = 0;
      this.va = Math.random() * 0.02 + 0.05;
      this.lightness = 10;
    }
    update() {
      this.x += this.speedX + Math.sin(this.angleX);
      this.y += this.speedY + Math.sin(this.angleY);
      this.size += this.vs;
      this.angleX += this.vax;
      this.angleY += this.vay;
      this.color += 2;
      if (this.lightness < 70) this.lightness += 0.25;
      if (this.size < this.maxSize) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillRect(0, 0, this.size, this.size);
        requestAnimationFrame(this.update.bind(this));
        ctx.restore();
      }
    }
  }

  const buildingForest = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    console.log(`x ${x}  y ${y}`);
    for (let i = 0; i < 5; ++i) {
      const root = new BuildingForest(x, y);
      root.update();
    }
  };

  const firework = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    // console.log(`x ${x}  y ${y}`);
    for (let i = 0; i < 5; ++i) {
      const root = new Root(x, y);
      root.update();
    }
  };
  const handleMove = (e) => {
    if (!drawing) {
      console.log("Not drawing");
      return;
    }
    // console.log("handleMove");
    console.log(`${e.nativeEvent.offsetX} ${e.nativeEvent.offsetY}`);
    switch (drawMode) {
      case "buildingforest":
        buildingForest(e);
        return;
      case "firework":
        firework(e);
        return;
      default:
        break;
    }

    //normal draw;
    if (ctx) {
      ctx.beginPath();
      ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 1, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(0,100%,50%)`;
      ctx.fill();
    } else {
      console.log("No ctx");
    }
  };

  const setCanvasSize = () => {
    if (!ccElem.current) {
      return;
    }
    canvasElem.current.width = ccElem.current.offsetWidth;
    canvasElem.current.height = ccElem.current.offsetHeight;
  };
  useEffect(() => {
    setCtx(canvasElem.current.getContext("2d"));
    setCanvasSize();
  }, []);
  const [drawMode, setDrawMode] = useState("firework");
  const [drawing, setDrawing] = useState(false);

  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`} ref={contElem}>
        <div className={`${styles.tabs}`}>
          {/* <button
            onClick={() => {
              setDrawMode("draw");
            }}
            className={`${styles.btn} ${styles.draw}`}
          >
            Just draw
          </button> */}
          <button
            onClick={() => {
              setDrawMode("firework");
            }}
            className={`${styles.btn} ${styles.firework}`}
          >
            Fireworks
          </button>
          <button
            onClick={() => {
              setDrawMode("buildingforest");
              setupBuildingforest();
            }}
            className={`${styles.btn} ${styles.buildingforest}`}
          >
            Building forest
          </button>
        </div>
        <div className={`${styles["canvas-container"]}`} ref={ccElem}>
          <canvas
            className={`${styles["the-canvas"]}`}
            onMouseMove={(e) => {
              handleMove(e);
            }}
            onMouseDown={(e) => {
              setDrawing(true);
            }}
            onMouseUp={(e) => {
              setDrawing(false);
            }}
            ref={canvasElem}
          />
        </div>
      </div>
    </Window>
  );
}
