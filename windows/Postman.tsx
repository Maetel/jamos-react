import { useEffect, useState } from "react";
import Window from "../components/Window";
import s from "../styles/Postman.module.css";
import axios from "axios";
import JamOS from "../features/JamOS/JamOS";
import { getStorage, setStorage } from "../scripts/utils";

export default function Postman(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Postman";
  const _post = async (cmd: string, val1, val2) => {
    const res = await axios
      .post(cmd, {
        email: val1,
        password: val2,
      })
      .then((_) => _)
      .catch((err) => log("Error : " + err));
    if (res) {
      console.log("Cookie : ", document.cookie);
      log("Response : " + JSON.stringify(res));
    }
    console.log(res);
  };
  const post1 = (e) => {
    e.preventDefault();
    setStorage("workValue1", workValue1);
    setStorage("email1", email1);
    setStorage("pw1", pw1);
    _post(workValue1, email1, pw1);
  };
  const post2 = async (e) => {
    e.preventDefault();
    setStorage("workValue2", workValue2);
    setStorage("email2", email2);
    setStorage("pw2", pw2);
    _post(workValue2, email2, pw2);

    const res = await axios
      .post(workValue2, {
        instance_name: "df",
        instance_type: "asdf",
      })
      .then((_) => _)
      .catch((err) => log("Error : " + err));
    if (res) {
      log("Response data : " + JSON.stringify(res.data));
      log("Full response : " + JSON.stringify(res));
    }
    console.log(res);
  };
  useEffect(() => {
    if (0) {
      const deleteAllCookies = () => {
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      };
      deleteAllCookies();
    }
    axios.defaults.withCredentials = true;
  }, []);

  const [results, setResults] = useState([]);
  const [workValue1, setWorkValue1] = useState("");
  const [workValue2, setWorkValue2] = useState("");
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [getValue1, setGetValue1] = useState("");
  const [getValue2, setGetValue2] = useState("");
  const [getValue3, setGetValue3] = useState("");
  const [getValue4, setGetValue4] = useState("");

  useEffect(() => {
    console.log("Comeee");
    setWorkValue1(getStorage("workValue1") ?? "http://localhost:3000/login");
    setWorkValue2(getStorage("workValue2") ?? "http://localhost:3000/create");
    setEmail1(getStorage("email1"));
    setEmail2(getStorage("email2"));
    setPw1(getStorage("pw1"));
    setPw2(getStorage("pw2"));
    setGetValue1(getStorage("getValue1") ?? "http://localhost:3000/");
    setGetValue2(getStorage("getValue2") ?? "http://localhost:3000/");
    setGetValue3(getStorage("getValue3") ?? "http://localhost:3000/");
    setGetValue4(getStorage("getValue4") ?? "http://localhost:3000/");
  }, []);

  const log = (str) => {
    setResults((res) => [str, ...results]);
  };
  const _get = async (url) => {
    const res = await axios
      .get(url)
      .then((_) => _)
      .catch((err) => log("Error : " + err));
    if (res) {
      log("Response : " + JSON.stringify(res));
    }
  };
  const get1 = () => {
    setStorage("getValue1", getValue1);
    _get(getValue1);
  };
  const get2 = () => {
    setStorage("getValue2", getValue2);
    _get(getValue2);
  };
  const get3 = () => {
    setStorage("getValue3", getValue3);
    _get(getValue3);
  };
  const get4 = () => {
    setStorage("getValue4", getValue4);
    _get(getValue4);
  };

  return (
    <Window {...props} proc={proc}>
      <div className={s.container}>
        <h1 className={s.title}>POST MAN</h1>
        <div className={s.workbench}>
          <div className={s.item}>
            <h1>Workbench 1</h1>
            <form onSubmit={post1}>
              Post address :
              <textarea
                className={s["get-text"]}
                rows={1}
                value={workValue1}
                onChange={(e) => {
                  setWorkValue1(e.target.value);
                }}
              />
              <label>E-mail:</label>
              <input
                className={s.submitter}
                name="email"
                placeholder="email"
                onChange={(e) => {
                  setEmail1(e.target.value);
                }}
              />
              <br />
              <label>Password:</label>
              <input
                className={s.submitter}
                name="pass"
                type="password"
                placeholder="비밀번호"
                onChange={(e) => {
                  setPw1(e.target.value);
                }}
              />
              <br />
              <input className={s.submitter} type="submit" value="Post 1" />
            </form>
          </div>
          <div className={s.item}>
            <h1>Workbench 2</h1>
            <form className={s.item} onSubmit={post2}>
              Post address :
              <textarea
                className={s["get-text"]}
                rows={1}
                value={workValue2}
                onChange={(e) => {
                  setWorkValue2(e.target.value);
                }}
              />
              <label>Instance name:</label>
              <input
                className={s.submitter}
                name="instance-name"
                placeholder="instance name"
                onChange={(e) => {
                  setEmail2(e.target.value);
                }}
              />
              <br />
              <label>Instance type:</label>
              <input
                className={s.submitter}
                name="instance-type"
                placeholder="instance type"
                onChange={(e) => {
                  setPw2(e.target.value);
                }}
              />
              <br />
              <input className={s.submitter} type="submit" value="Post 2" />
            </form>
          </div>
        </div>
        <div className={s.workbench}>
          <div className={s.item}>
            <h1>Workbench 3</h1>

            <div className={s["get-item"]}>
              <textarea
                rows={1}
                className={s["get-text"]}
                value={getValue1}
                onChange={(e) => {
                  setGetValue1(e.target.value);
                }}
              />
              <button className={s["get-btn"]} onClick={get1}>
                Get
              </button>
            </div>

            <div className={s["get-item"]}>
              <textarea
                rows={1}
                className={s["get-text"]}
                value={getValue2}
                onChange={(e) => {
                  setGetValue2(e.target.value);
                }}
              />
              <button className={s["get-btn"]} onClick={get2}>
                Get
              </button>
            </div>
            <div className={s["get-item"]}>
              <textarea
                rows={1}
                className={s["get-text"]}
                value={getValue3}
                onChange={(e) => {
                  setGetValue3(e.target.value);
                }}
              />
              <button className={s["get-btn"]} onClick={get3}>
                Get
              </button>
            </div>
            <div className={s["get-item"]}>
              <textarea
                rows={1}
                className={s["get-text"]}
                value={getValue4}
                onChange={(e) => {
                  setGetValue4(e.target.value);
                }}
              />
              <button className={s["get-btn"]} onClick={get4}>
                Get
              </button>
            </div>
          </div>
          <div className={s.results}>
            <h1 className={s.title}>Result</h1>
            <ol>
              {results.map((result, i) => (
                <li className={s.result} key={i}>
                  {result}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Window>
  );
}
