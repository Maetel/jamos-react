import axios from "axios";
import { useEffect, useState } from "react";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Comments.module.css";

const server = "http://localhost:3000/";
// const server = 'http://jamos-v2/';
const posts = server + "post";

export async function getServerSideProps(context) {
  const comments = await axios
    .get(posts)
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
  return (
    <li className={styles.commentCard}>
      {comment.uid} : {comment.content}
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

  const [user, setUser] = useState("");
  const [content, setContent] = useState("");
  const onCommentSubmit = (e) => {
    e.preventDefault();
    const postAndWait = async () => {
      const res = await axios
        .post(posts, {
          user: user,
          content: content,
        })
        .then((_res) => {
          // console.log("post res : ", _res);
        })
        .catch((err) => {
          JamOS.setNotif(
            "Could not post your comment. Error : " + err,
            "error"
          );
        });
      JamOS.procmgr.set(procId, { commentUpdate: false });
      JamOS.procmgr.set(procId, { commentUpdate: true });
      console.log("res:", res);
    };
    postAndWait();
  };

  return (
    <div
      className={styles.leaveComment}
      style={{
        boxShadow: colors.boxShadow,
      }}
    >
      <div className={styles.inputArea}>
        <form onSubmit={onCommentSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="user"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
              }}
            />
          </label>
          <label>
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
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default function Comments(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Leave Comments!";
  proc.hideNav = proc.hideNav ?? true;
  let comments: CommentData[] =
    JamOS.procmgr.getReadable(proc.id, "comments") ?? [];
  comments = [...comments].reverse();
  const commentUpdate: boolean = JamOS.procmgr.getReadable(
    proc.id,
    "commentUpdate"
  );
  const colors = JamOS.theme.colors;

  const fetchAndUpdate = () => {
    const fetchContents = async () => {
      const res = await axios.get(posts);
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
  }, []);
  useEffect(() => {
    console.log("commentUpdate, fetch and update");
    if (commentUpdate) {
      fetchAndUpdate();
    }
  }, [commentUpdate]);

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
        </h1>
        <CommentGrid comments={comments}></CommentGrid>
        <LeaveComment procId={proc.id}></LeaveComment>
      </div>
    </Window>
  );
}
