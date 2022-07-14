import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import { JamUser } from "../features/JamOS/osSlice";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Comments.module.css";

export async function getServerSideProps(context) {
  const comments = await axios
    .get(JamOS.apis.posts)
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((err) => console.error("Axios error : " + err));
  console.log("Received : ", comments);
  const content = comments["content"];
  return {
    props: { content }, // will be passed to the page component as props
  };
}

export interface CommentData {
  id: number;
  uid: string;
  time: string;
  excerpt: string;
  content: string;
}

function CommentCard(props) {
  const comment: CommentData = props.comment;
  const colors = JamOS.theme.colors;
  const date = new Date(comment.time);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const isActive = clicked;
  const isMore = comment.content !== comment.excerpt;
  const buildStyle = () => {
    const retval = {
      color: colors["1"],
      backgroundColor: colors["3"] + "22",
      boxShadow: `1px 1px 5px ${colors["1"]}`,
    };
    if (hovered || isActive) {
      retval.boxShadow = `1px 1px 14px ${colors["1"]}`;
    }
    return retval;
  };
  const style = buildStyle();
  return (
    <li
      className={styles.commentCard}
      style={style}
      onPointerEnter={(e) => {
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        setHovered(false);
      }}
      onClick={(e) => {
        setClicked((val) => !val);
      }}
    >
      <div className={styles.content}>
        {isActive ? comment.content : comment.excerpt}{" "}
        {!isActive && isMore && (
          <span
            className={styles.excerpt}
            style={{
              fontSize: "0.9rem",
              opacity: hovered || isActive ? 0.8 : 0.6,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            ...more
          </span>
        )}
      </div>
      <div className={styles.commentFooter}>
        <span className={styles.authorBy}>written by</span>
        <span className={styles.name}>{comment.uid}</span>
        <span className={styles.time}>{date.toLocaleString()}</span>
      </div>
    </li>
  );
}

function CommentGrid(props) {
  const comments: CommentData[] = props.comments;
  return (
    <ul className={styles.commentGrid}>
      {comments.map((comment) => {
        return <CommentCard key={comment.id} comment={comment}></CommentCard>;
      })}
    </ul>
  );
}

function LeaveComment(props) {
  const colors = JamOS.theme.colors;
  const procId: string = props.procId;
  const fetchAndUpdate = props.fetchAndUpdate;

  const jamUser: JamUser = JamOS.userReadable();
  const [user, setUser] = useState("");
  const [content, setContent] = useState("");
  const isLoggedIn = jamUser.loggedin;

  const onCommentSubmit = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      JamOS.procmgr.add("jamhub", { parent: procId, disableBackground: true });
      return;
    }

    const postAndWait = async () => {
      // const _user = user.trim();
      const _user = jamUser.id;
      const _content = content.trim();
      if (_user.length === 0) {
        JamOS.setNotif("Name is empty");
        return;
      }
      if (_content.length === 0) {
        JamOS.setNotif("Content is empty");
        return;
      }

      const res = await axios
        .post(
          JamOS.apis.posts,
          {
            user: jamUser.id,
            content: _content,
          },
          {
            ...JamOS.authHeader,
            withCredentials: true,
          }
        )
        .then((_res) => {
          if (_res.data?.status !== 200) {
            JamOS.setNotif(
              "Could not post your comment. Error : " + _res.data?.content,
              "error"
            );
          } else if (_res.data?.content) {
            JamOS.setNotif("Thanks for leaving me a comment!", "success");
            setUser("");
            setContent("");
            fetchAndUpdate();
          }
        })
        .catch((err) => {
          JamOS.setNotif(
            "Could not post your comment. Error : " + err,
            "error"
          );
          fetchAndUpdate();
        });
    };
    postAndWait();
  };

  const nameInputElem = useRef(null);
  useEffect(() => {
    if (nameInputElem.current) {
      nameInputElem.current.focus();
    }
  }, []);

  return (
    <div
      className={styles.leaveComment}
      style={{
        boxShadow: colors.boxShadow,
      }}
    >
      <form onSubmit={onCommentSubmit} className={styles.inputArea}>
        <label className={`${styles.label} ${styles.userLabel}`}>
          Name:
          <input
            type="text"
            name="user"
            disabled
            value={jamUser.id}
            onChange={(e) => {
              setUser(e.target.value);
            }}
            ref={nameInputElem}
          />
        </label>
        <label className={`${styles.label} ${styles.commentLabel}`}>
          Comment:
          <input
            type="text"
            name="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
        </label>
        <input
          style={{
            color: colors["2"],
            backgroundColor: colors["1"],
          }}
          className={styles.submitBtn}
          type="submit"
          value={isLoggedIn ? "Leave a comment!" : "Sign in to leave a comment"}
        />
      </form>
    </div>
  );
}

export default function Comments(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Leave Comments!";
  proc.hideNav = proc.hideNav ?? true;
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;
  proc.rect = proc.rect ?? {
    minWidth: 480,
    width: 480,
    minHeight: 640,
    height: 800,
  };
  // proc.

  let comments: CommentData[] =
    JamOS.procmgr.getReadable(proc.id, "comments") ?? [];
  // comments = [...comments].reverse(); //reverse on serverside
  const commentUpdate: boolean = JamOS.procmgr.getReadable(
    proc.id,
    "commentUpdate"
  );
  const colors = JamOS.theme.colors;

  const fetchAndUpdate = () => {
    const fetchContents = async () => {
      const res = await axios.get(JamOS.apis.posts);
      const content = res?.["data"]?.["content"];
      return content;
    };
    fetchContents()
      .then((res) => {
        JamOS.procmgr.set(proc.id, { comments: res ?? [] });
      })
      .catch((err) => {
        JamOS.setNotif("Comments error : " + err, "error");
      });
  };

  useEffect(() => {
    fetchAndUpdate();
    JamOS.setNotif(`Connecting to ${JamOS.apis.posts}...`);
  }, []);
  useEffect(() => {
    if (commentUpdate) {
      fetchAndUpdate();
    }
  }, [commentUpdate]);

  const [reloading, setReloading] = useState(false);

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h1
          className={styles.title}
          style={{
            boxShadow: colors.boxShadow,
          }}
        >
          Comments
          <button
            className={`${styles.reload} ${reloading && styles.spin}`}
            onClick={(e) => {
              setReloading(true);
              setTimeout(() => {
                setReloading(false);
              }, 800);
              fetchAndUpdate();
            }}
          >
            <ShimmerImage
              src={"/imgs/loading.svg"}
              width={30}
              height={30}
            ></ShimmerImage>
          </button>
        </h1>

        <CommentGrid comments={comments}></CommentGrid>
        <LeaveComment
          procId={proc.id}
          fetchAndUpdate={fetchAndUpdate}
        ></LeaveComment>
      </div>
    </Window>
  );
}
