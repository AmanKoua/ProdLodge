import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import { SongData, CommentRequestResponse, SongComment } from "../customTypes";

interface Props {
  songData: SongData;
  isCommentsSectionDisplayed: boolean;
}

const SongCommentSection = ({
  songData,
  isCommentsSectionDisplayed,
}: Props) => {
  const [commentsPayload, setCommentPayload] = useState(
    new Map<string, SongComment>()
  );
  //   const [currentComments, setCurrentComments] = useState<
  //     Map<string, SongComment>
  //   >(new Map<string, SongComment>());
  const [areParentCommentsFetched, setAreParentCommentsFetched] =
    useState(false);
  const [commentInputPlaceholder, setCommentInputPlaceholder] = useState(
    "Write a new comment ..."
  );
  const [currentReplyId, setCurrentReplyId] = useState("");
  const [parentCommentId, setParentCommentId] = useState("empty");
  const [currentHoverTarget, setCurrentHoverTarget] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const authContext = useContext(AuthContext);

  const fetchComments = async (
    commentsList: string[]
  ): Promise<Map<string, SongComment>> => {
    let tempCommentPayload: Map<string, SongComment> = commentsPayload;

    for (let i = 0; i < commentsList.length; i++) {
      let response = await fetch(
        `http://localhost:8005/comment/${commentsList[i]}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${authContext.user.token}`,
          },
        }
      );

      if (response.ok) {
        const json = (await response.json()) as CommentRequestResponse;
        tempCommentPayload.set(commentsList[i], json.comment);
        tempCommentPayload = await fetchReplyComments(
          json.comment.replyList,
          tempCommentPayload
        );
        //   console.log(json);
      } else {
        const json = await response.json();
        console.log("Comment fetching error", json);
      }
    }

    return tempCommentPayload;
    // setCommentPayload(tempCommentPayload);
    // setCurrentComments(tempCommentPayload);
  };

  const fetchReplyComments = async (
    replyList: string[],
    tempCommentPayload: Map<string, SongComment>
  ): Promise<Map<string, SongComment>> => {
    // Fetch the replies for the currentComments if they are not already fetched
    // Must use map.set and map.get. VERY IMPORTANT

    for (let i = 0; i < replyList.length; i++) {
      if (tempCommentPayload.get(replyList[i]) == undefined) {
        let response = await fetch(
          `http://localhost:8005/comment/${replyList[i]}`,
          {
            method: "GET",
            headers: {
              authorization: `Bearer ${authContext.user.token}`,
            },
          }
        );

        if (response.ok) {
          const json = (await response.json()) as CommentRequestResponse;
          tempCommentPayload.set(replyList[i], json.comment);
          //   console.log(json);
        } else {
          const json = await response.json();
          console.log("Comment fetching error", json);
        }
      }
    }

    return tempCommentPayload;
  };

  const generateReplyPlaceholderText = (commentId: string) => {
    let targetComment = commentsPayload.get(commentId);

    setCommentInputPlaceholder(
      `Replying to ${targetComment?.creatorUserName}'s comment (click X to cancel) ...`
    );
  };

  useEffect(() => {
    // Fetch song comments and initialize commentsPayload

    const fetchInitialComments = async () => {
      if (!areParentCommentsFetched) {
        let temp: Map<string, SongComment> = await fetchComments(
          songData.commentsList
        );
        setCommentPayload(temp);
        // setCurrentComments(temp);
        setAreParentCommentsFetched(true);
      } else {
        // do nothing
      }
    };

    fetchInitialComments();
  }, [areParentCommentsFetched]);

  useEffect(() => {
    // Fetch new comments when navigating the comment tree structure
    if (parentCommentId == "empty" || !areParentCommentsFetched) {
      return;
    }

    const fetchNewComments = async () => {
      if (areParentCommentsFetched) {
        if (commentsPayload.get(parentCommentId) == undefined) {
          console.log("Invalid parentId error!");
          return;
        }

        let temp: Map<string, SongComment> = await fetchComments(
          commentsPayload.get(parentCommentId)!.replyList
        );
        setCommentPayload(temp);
        // setCurrentComments(temp);
      } else {
        // do nothing
      }
    };

    fetchNewComments();
  }, [parentCommentId, areParentCommentsFetched]);

  const generateSongComments = (): JSX.Element => {
    let temp = new Array(3).fill(0);

    if (!areParentCommentsFetched) {
      return (
        <>
          {temp.map((item, idx) => (
            <div className="bg-gray-200 w-10/12 h-20 ml-auto mr-auto mt-4 pb-1 border border-black animate-pulse"></div>
          ))}
          ;
        </>
      );
    } else {
      if (commentsPayload.size == 0) {
        // Render nothing
        return <></>;
      } else {
        return (
          <>
            {Array.from(commentsPayload).map((item, idx) => {
              if (
                item[1].replyId != parentCommentId &&
                item[0] != parentCommentId
              ) {
                return <></>;
              }

              let isReply: boolean;

              if (parentCommentId == "empty") {
                isReply = false;
              } else {
                isReply = item[1].replyId == parentCommentId;
              }

              const offset = isReply ? 1.5 : 1;

              return (
                <>
                  {isReply && (
                    <div
                      className="bg-gray-200 w-1 h-28 absolute"
                      style={{
                        marginLeft: `${6}%` /* Shift comments over based on whether or not it is a reply. Standard is 8% */,
                        marginTop: "2.4%",
                      }}
                    ></div>
                  )}

                  <div
                    className="bg-blue-100 w-10/12 h-max ml-auto mr-auto mt-4 pb-1 border border-black"
                    style={{
                      marginLeft: `${
                        8 * offset
                      }%` /* Shift comments over based on whether or not it is a reply. Standard is 8% */,
                    }}
                    onMouseOver={(e) => {
                      setCurrentHoverTarget(item[0]);
                    }}
                    onMouseLeave={(e) => {
                      setCurrentHoverTarget("");
                    }}
                  >
                    <div
                      className="w-12/12 h-max  flex justify-center"
                      // style={{ height: "55px" }}
                    >
                      {/* <div className="bg-green-500 w-1/6 h-6 ml-auto mr-auto inline-block">
                              Temp
                            </div> */}
                      <div className="w-4/6 h-6 ml-auto mr-auto inline-block">
                        <div className="border-b border-gray-400 w-6/12 h-full overflow-hidden inline-block">
                          <p className="w-max h-max ml-auto mr-auto font-bold hover:text-blue-500 hover:cursor-pointer">
                            {item[1].creatorUserName}
                          </p>
                        </div>
                        <div className="border-b border-gray-400 w-6/12 h-full overflow-hidden inline-block">
                          <div className="w-full h-max flex align-middle justify-center pt-1">
                            <div
                              style={{
                                position: "absolute",
                                width: "15%",
                                height: "15px",
                                border: "1px solid black",
                                borderRadius: "6px",
                                fontSize: "10px",
                                textAlign: "center",
                                overflow: "hidden",
                              }}
                            >
                              Load confiuration
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 pr-3 pl-3 pb-3 h-max block text-center">
                      {item[1].data}
                    </div>
                    <div className="w-4/6 h-6 ml-auto mr-auto flex">
                      <div className=" border-t border-gray-400 w-3/6 h-6 mt-0 ml-auto mr-auto overflow-hidden flex justify-around">
                        <span className="material-symbols-outlined hover:font-bold">
                          arrow_upward
                        </span>
                        <p>{item[1].upvoteCount}</p>
                        <span className="material-symbols-outlined hover:font-bold">
                          arrow_downward
                        </span>
                        <p>{item[1].downvoteCount}</p>
                      </div>
                      <div className="border-t border-gray-400 w-6/12 h-full overflow-hidden flex justify-around">
                        <span
                          className="material-symbols-outlined hover:font-bold"
                          onClick={() => {
                            generateReplyPlaceholderText(item[0]);
                            setCurrentReplyId(item[0]);
                          }}
                        >
                          reply
                        </span>
                        <p>reply</p>
                        <span className="material-symbols-outlined hover:font-bold">
                          delete
                        </span>
                        <p>delete</p>
                      </div>
                    </div>
                  </div>
                  {item[1].replyList.length > 0 && (
                    <div
                      className={
                        currentHoverTarget == item[0]
                          ? "bg-prodSecondary h-6 w-3/12 rounded-b-lg flex ml-auto mr-auto justify-center overflow-hidden"
                          : "bg-prodSecondary h-1 w-3/12 rounded-b-lg flex ml-auto mr-auto justify-center overflow-hidden"
                      }
                      style={{ transition: "all 0.3s" }}
                      onMouseOver={(e) => {
                        setCurrentHoverTarget(item[0]);
                      }}
                      onMouseLeave={(e) => {
                        setCurrentHoverTarget("");
                      }}
                      onClick={() => {
                        if (parentCommentId == item[0]) {
                          setParentCommentId(item[1].replyId);
                        } else {
                          setParentCommentId(item[0]);
                        }
                      }}
                    >
                      {parentCommentId == item[0] && "Go back"}
                      {parentCommentId != item[0] && "Load Replies"}
                    </div>
                  )}
                </>
              );
            })}
          </>
        );
      }
    }
  };

  return (
    <div
      className={
        isCommentsSectionDisplayed
          ? "bg-prodPrimary shadow-lg w-12/12 h-max pt-1 pb-3"
          : "bg-prodPrimary shadow-lg w-12/12 h-0 pt-1 pb-3 hidden"
      }
      style={{ transition: "all 0.5s" }}
    >
      {error && (
        <div className="bg-prodError w-11/12 mt-2 ml-auto mr-auto text-center border-2 border-red-500">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-prodMessage w-11/12 mt-2 ml-auto mr-auto text-center border-2 border-green-500">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg w-11/12 h-20 ml-auto mr-auto mt-3">
        <div className="w-full h-4/6">
          <input
            type="text"
            className="w-full h-full pl-1 pr-1 border-b"
            placeholder={commentInputPlaceholder}
          />
        </div>

        <div className="w-4/6 h-2/6 ml-auto mr-auto flex justify-start">
          {currentReplyId && (
            <div
              className="w-max text-sm"
              style={{ marginLeft: "0px", marginTop: "0px" }}
              onClick={() => {
                setCommentInputPlaceholder("Write a new comment ...");
                setCurrentReplyId("");
              }}
            >
              <span className="material-symbols-outlined opacity-60 hover:font-bold hover:opacity-100">
                close
              </span>
            </div>
          )}

          <div className=" w-6/12 h-full flex justify-center">
            <div
              style={{
                position: "absolute",
                width: "max",
                paddingLeft: "15px",
                paddingRight: "15px",
                height: "15px",
                marginTop: "7px",
                border: "1px solid black",
                borderRadius: "6px",
                fontSize: "10px",
                textAlign: "center",
                overflow: "hidden",
                // background: "purple",
              }}
            >
              Submit
            </div>
          </div>
          <div className="w-6/12 h-full flex justify-center">
            <div
              style={{
                position: "absolute",
                width: "max",
                paddingLeft: "15px",
                paddingRight: "15px",
                height: "15px",
                marginTop: "7px",
                border: "1px solid black",
                borderRadius: "6px",
                fontSize: "10px",
                textAlign: "center",
                overflow: "hidden",
                // background: "purple",
              }}
            >
              Attach current configuration
            </div>
          </div>
        </div>
      </div>
      {generateSongComments()}
    </div>
  );
};

export default SongCommentSection;
