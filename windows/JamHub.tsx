import axios from "axios";
import { syncBuiltinESMExports } from "module";
import { useEffect, useRef, useState } from "react";
import Loading from "../components/Loading";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/JamHub.module.css";

export default function _(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "";
  proc.rect = proc.rect ?? {
    width: 360,
    height: 520,
  };
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;
  proc.hideNav = proc.hideNav ?? true;

  const jamUser = JamOS.userReadable();
  const signedIn = jamUser.loggedin;

  const colors = JamOS.theme.colors;
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nameInputElem = useRef(null);
  const buildButtonStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const btnStyle = buildButtonStyle();
  type HubMode = "signin" | "signup";

  const handleCancel = (e) => {
    JamOS.procmgr.kill(proc.id);
  };
  const handleKey = (e) => {
    const isFront = JamOS.procmgr.getValue(proc.id, "zIndex") === "0";
    if (!isFront) {
      return;
    }
    const keyMap = {
      Escape: handleCancel,
    };
    keyMap[e.key]?.(e);
  };

  useEffect(() => {
    if (nameInputElem.current) {
      nameInputElem.current.focus();
    }
    setTimeout(() => {
      window.addEventListener("keydown", handleKey);
    }, 300);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const validateFields = () => {
    const userValid = user.trim().length !== 0 && !user.includes(" ");
    const pwValid = password.trim().length !== 0 && !password.includes(" ");
    return { userValid, pwValid };
  };
  const setSuccess = (msg: string) => {
    JamOS.setNotif(msg, "success");
    setStatus({
      type: "success",
      msg: msg,
    });
  };
  const setError = (msg: string) => {
    JamOS.setNotif(msg, "error");
    setStatus({
      type: "error",
      msg: msg,
    });
  };
  const onSubmit = (mode: HubMode) => {
    const { userValid, pwValid } = validateFields();
    const isValid = userValid && pwValid;
    const errMsg =
      !userValid && pwValid
        ? "Account not valid"
        : userValid && !pwValid
        ? "Password not valid"
        : "Account and password not valid";

    if (!isValid) {
      setError(errMsg);
      // JamOS.setNotif(errMsg, "error");
      return;
    }

    setIsLoading(true);

    const userInput = {
      user: user,
      password: password,
    };
    const config = {
      withCredentials: true,
    };

    const trySignIn = async () => {
      const res = await axios
        .post(JamOS.apis.signin, userInput, config)
        .then(async (res) => {
          const stat = res.status;
          const cont = res.data?.content;
          // console.log("Signin Status : " + stat + "Content : ", cont);
          const acc = cont["accessToken"];
          const ref = cont["refreshToken"];

          const signedIn = stat === 200 && acc && ref;
          if (signedIn) {
            JamOS.signin(userInput.user, acc, ref);
            const confirmSignIn = async () => {
              await axios
                .get(JamOS.apis.signincheck, JamOS.authHeader)
                .then((_res) => {
                  const stat = _res.status;
                  const cont = _res.data?.content;
                  if (stat === 200) {
                    // JamOS.setNotif("Signed in as " + JamOS.userValue().id);
                    setSuccess("Signed in as " + JamOS.userValue().id);
                  } else {
                    JamOS.signout();
                    setError("Failed to sign in as " + userInput.user);
                    // JamOS.setNotif("Failed to sign in as " + userInput.user, "error");
                  }
                });
            };
            await confirmSignIn();
          } else {
            setError("Failed to sign in as " + userInput.user);
            // JamOS.setNotif("Failed to sign in as " + userInput.user, "error");
          }
        })
        .catch((err) => {
          console.error(err);
          const cont = err.response?.data?.content;
          if (cont) {
            setError(cont);
          } else {
            setError("Failed to sign in with unknown error code");
          }
        });
    };

    const trySignup = async () => {
      await axios
        .post(JamOS.apis.signup, userInput, config)
        .then(async (res) => {
          const stat = res.status;
          const cont = res.data?.content;
          if (stat === 200) {
            // JamOS.setNotif("Signed up as " + userInput.user);
            setSuccess("Signed in as " + JamOS.userValue().id);
            await trySignIn();
          } else {
            if (cont) {
              setError(cont);
              // JamOS.setNotif(cont, "error");
            } else {
              setError("Failed to sign in as " + userInput.user);
              // JamOS.setNotif("Failed to sign up as " + userInput.user, "error");
            }
          }
        })
        .catch((err) => {
          console.error(err);
          const cont = err.response?.data?.content;
          if (cont) {
            setError(cont);
          } else {
            setError("Failed to sign up with unknown error code");
          }
        });
    };

    if (mode === "signin") {
      trySignIn();
    } else {
      //signup then sign in
      trySignup();
    }
    setIsLoading(false);
  };

  const SignOut = (props) => {
    return (
      <div
        className={styles.signoutArea}
        style={{
          backgroundColor: colors["2"],
        }}
      >
        <div className={styles.signoutInfo}>
          <div className={styles.info}>Currently logged in as :</div>
          <h3 className={styles.info}>{jamUser.id}</h3>
        </div>
        <button
          className={styles.btn}
          onClick={(e) => {
            JamOS.signout();
          }}
        >
          Sign out
        </button>
      </div>
    );
  };

  interface Status {
    type: "standby" | "success" | "warn" | "error";
    msg: string;
  }
  const status: Status = JamOS.procmgr.getReadable(proc.id, "hubStatus") ?? {
    type: "standby",
    msg: "",
  };
  const setStatus = (stat: Status) => {
    JamOS.procmgr.set(proc.id, { hubStatus: stat });
  };
  useEffect(() => {
    setStatus({ type: "standby", msg: "" });
  }, []);
  useEffect(() => {
    //TODO
    return;
    // if (jamUser.loggedin) {
    //   console.log("signedIn:", signedIn);
    //   ToolbarControl.RegisterBuilder(proc.id).register(
    //     "JamHub",
    //     "Sign out",
    //     () => {
    //       JamOS.signout();
    //     }
    //   );
    // } else {
    //   console.log("signedIn:", signedIn);
    //   ToolbarControl.RegisterBuilder(proc.id).unregisterAll();
    // }
  }, [jamUser]);
  const statusColor =
    status.type === "standby"
      ? colors["1"]
      : status.type === "success"
      ? colors.okay
      : status.type === "warn"
      ? colors.warn
      : colors.error;

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h2 className={styles.title}>JamHub</h2>
        <div className={styles.hero}>
          <div className={styles.logoWrapper}>
            <ShimmerImage src={"/imgs/jamos.png"} layout="fill"></ShimmerImage>
          </div>
        </div>

        <div className={styles.inputArea}>
          <div className={styles.statusMsg} style={{ color: statusColor }}>
            {status.msg}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit("signin");
            }}
            className={styles.loginForm}
          >
            <input
              className={`${styles.label} ${styles.userLabel}`}
              type="text"
              name="user"
              value={user}
              placeholder="Account"
              onChange={(e) => {
                setUser(e.target.value.trim());
              }}
              ref={nameInputElem}
            />
            <input
              className={`${styles.label} ${styles.commentLabel}`}
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.trim());
              }}
            />
            <input
              style={btnStyle}
              className={styles.btn}
              type="submit"
              value="Sign in"
            />
          </form>
          <div className={styles.btns}>
            <button
              className={`${styles.btn} ${styles.half}`}
              style={btnStyle}
              onClick={(e) => {
                onSubmit("signup");
              }}
            >
              Create Account
            </button>
            <button
              className={`${styles.btn} ${styles.half}`}
              style={btnStyle}
              onClick={(e) => {
                JamOS.procmgr.kill(proc.id);
              }}
            >
              Proceed as a Guest
            </button>
          </div>
          {signedIn && <SignOut></SignOut>}
          {isLoading && <Loading></Loading>}
        </div>
      </div>
    </Window>
  );
}
