import axios from "axios";
import { syncBuiltinESMExports } from "module";
import { useEffect, useRef, useState } from "react";
import Loading from "../components/Loading";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import CallbackStore from "../features/JamOS/CallbackStore";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/JamHub.module.css";

export type HubMode = "signin" | "signup";
export const onSigninCoreSubmit = (
  mode: HubMode,
  user: string,
  password: string,
  args?: {
    onError?: (string) => void;
    onSuccess?: (string) => void;
  }
) => {
  const setError: (string) => void = args?.onError ?? console.error;
  const setSuccess: (string) => void = args?.onSuccess;
  const validateFields = () => {
    const userValid = user.trim().length !== 0 && !user.includes(" ");
    const pwValid = password.trim().length !== 0 && !password.includes(" ");
    return { userValid, pwValid };
  };
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
                  setSuccess?.("Signed in as " + JamOS.userValue().id);
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
          setSuccess?.("Signed up as " + JamOS.userValue().id);
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
};

interface SigninCoreProps {
  onError?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
  includeCreateUser?: boolean;
}
export function SigninCore(props: { signinCoreProps?: SigninCoreProps }) {
  const coreProps: SigninCoreProps = props.signinCoreProps ?? {};
  const includeCreateUser = coreProps.includeCreateUser;
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const colors = JamOS.theme.colors;
  const buildButtonStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const btnStyle = buildButtonStyle();
  return (
    <div className={styles.signinContainer}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSigninCoreSubmit("signin", user, password, {
            onError: coreProps.onError,
            onSuccess: coreProps.onSuccess,
          });
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
          // ref={nameInputElem}
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
      {includeCreateUser && (
        <button
          className={`${styles.btn}`}
          style={btnStyle}
          onClick={(e) => {
            onSigninCoreSubmit("signup", user, password, {
              onError: coreProps.onError,
              onSuccess: coreProps.onSuccess,
            });
          }}
        >
          Create Account
        </button>
      )}
    </div>
  );
}

export function InnerSignin(props) {
  const [innerTitle, setInnerTitle] = useState("Sign in to proceed");
  type MsgState = "normal" | "success" | "error";
  const [msgState, setMsgState] = useState<MsgState>("normal");
  const colors = JamOS.theme.colors;
  const textColor =
    msgState === "success"
      ? colors.okay
      : msgState === "error"
      ? colors.error
      : colors["1"];
  return (
    <div className={styles.innerContainer}>
      <div className={styles.coreContainer}>
        <p
          className={styles.innerTitle}
          style={{
            color: textColor,
          }}
        >
          {innerTitle}
        </p>
        <SigninCore
          signinCoreProps={{
            onError: (msg) => {
              setInnerTitle(msg);
              setMsgState("error");
            },
            onSuccess: (msg) => {
              setInnerTitle(msg);
              setMsgState("success");
            },
          }}
        ></SigninCore>
      </div>
    </div>
  );
}

export default function JamHub(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "";
  proc.rect = proc.rect ?? {
    width: 360,
    height: 520,
  };
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;
  proc.hideNav = proc.hideNav ?? true;
  const isFront = JamOS.procmgr.isFront(proc.id);

  const jamUser = JamOS.userReadable();
  const signedIn = jamUser.signedin;
  const colors = JamOS.theme.colors;
  const buildButtonStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const btnStyle = buildButtonStyle();

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
    setTimeout(() => {
      window.addEventListener("keydown", handleKey);
    }, 300);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

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

  const SignOut = (props) => {
    const jamUser = JamOS.userReadable();
    const show = jamUser.signedin;
    const signoutElem = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (show) {
        signoutElem.current.classList.add(styles.active);
      } else {
        signoutElem.current.classList.remove(styles.active);
      }
    }, [show]);
    const buildStyle = () => {
      return {
        backgroundColor: colors["2"],
      };
    };
    const style = buildStyle();
    return (
      <div className={styles.signoutArea} style={style} ref={signoutElem}>
        <div className={styles.signoutInfo}>
          <div className={styles.info}>Currently logged in as :</div>
          <h3 className={styles.info}>{jamUser.id}</h3>
        </div>
        <button
          className={`${styles.btn} ${styles.signoutBtn}`}
          onClick={(e) => {
            setStatus({ msg: "Signed out", type: "warn" });
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
    JamOS.procmgr.addToolbarItem(
      proc.id,
      "JamHub",
      "Sign out",
      () => {
        JamOS.signout();
      },
      { separator: true }
    );
  }, []);
  useEffect(() => {
    JamOS.procmgr.updateToolbarItem(proc.id, "JamHub", "Sign out", {
      disabled: !jamUser.signedin,
    });
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
          <div className={styles.btns}>
            <SigninCore
              signinCoreProps={{
                includeCreateUser: true,
                onError: setError,
                onSuccess: setSuccess,
              }}
            ></SigninCore>
            <button
              className={`${styles.btn}`}
              style={btnStyle}
              onClick={(e) => {
                JamOS.procmgr.kill(proc.id);
              }}
            >
              Proceed as a Guest
            </button>
            <SignOut></SignOut>
          </div>
        </div>
      </div>
    </Window>
  );
}
