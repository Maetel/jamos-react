export const addError = (err)=>console.error(err)
export const addLog = (l)=>console.log(l)

export default class Path {
  public static splitter = "/";
  public paths: string[];
  public parentArray: string[];
  public parent: string;
  public last: string;
  public path: string;
  constructor(path: string) {
    this.setPath(path);
    return this;
  }

  public get isEmpty() {
    return this.path === "";
  }

  public get isHome() {
    return this.path === "~";
  }

  // assumes that all paths begin with '~/', which is home
  // removes '.' and '..'
  static calcNetPath(path: string): string {
    const paths:Array<string> = path.split(Path.splitter);
    const first = paths[0];
    if (!first || first === ".." || first.length === 0) {
      addError(
        "First argument of path cannot be (..) nor empty @Commands.calcNetPath"
      );
      return undefined;
    }
    if (!paths.includes("..") || paths.length === 1) {
      return path;
    }
    for (let i = 1; i < paths.length; ++i) {
      const val = paths[i];
      if (val !== "..") {
        continue;
      }
      delete paths[i];
      if (paths[i - 1] !== "~") {
        delete paths[i - 1];
      }
      break;
    }
    return Path.calcNetPath(Path.refine(paths.join(Path.splitter)));
  }

  static refine(path: string): string {
    return path
      ?.trim()
      .split(Path.splitter)
      .filter((val) => val !== "" && val !== " " && val !== "/")
      .map((path) => path.trim())
      .join(Path.splitter);
  }
  static join(l: string, r: string): Path {
    if (!l || !l.length) return new Path(r);
    if (!r || !r.length) return new Path(l);
    return new Path(Path.refine(l) + Path.splitter + Path.refine(r));
  }

  public setPath(path: string) {
    let refinedPrimary = Path.refine(path);
    if (!refinedPrimary) {
      this.path = "";
      return;
    }
    refinedPrimary = refinedPrimary
      .split(Path.splitter)
      .filter((node) => node !== ".")
      .join(Path.splitter);
    this.path = Path.calcNetPath(refinedPrimary);
    this.paths = this.path.split(Path.splitter);
    this.last = this.paths[this.paths.length - 1];
    this.parentArray = this.paths.slice(0, this.paths.length - 1);
    this.parent = this.paths
      .slice(0, this.paths.length - 1)
      .join(Path.splitter);
  }
  // does not include '~/'
  get subPaths():Path[] {
    const subPaths = [];
    //calc subpaths
    for (let i = 0; i < this.paths.length; ++i) {
      subPaths.push(new Path(this.paths.slice(0, i + 1).join(Path.splitter)));
    }
    return subPaths;
  }
  get extension() {
    const lastIndex = this.last.lastIndexOf(".");
    if (lastIndex === -1) {
      return "";
    }
    return this.last.slice(lastIndex + 1);
  }
  public isSame(rhs: Path) {
    return this.path === rhs.path;
  }
  public static areSame(lhs:string, rhs:string){
    return new Path(lhs).isSame(new Path(rhs));
  }
  public copied() {
    return new Path(this.path);
  }
  public startsWith(rhs: Path) {
    return this.path.startsWith(rhs.path);
  }
}
Path.prototype.toString = function pathToString(){return this.path};