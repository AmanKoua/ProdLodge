/*
  Parent comment 2
  Child comment 2-1
  Child comment 2-2
  Child comment 2-2-1
  Child comment 2-2-2
  Child comment 2-2-3
*/

import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

import {
  SongData,
  CommentRequestResponse,
  SongComment,
  AudioModule,
} from "../customTypes";

interface Props {
  songData: SongData;
  audioModules: AudioModule[][];
  isCommentsSectionDisplayed: boolean;
  hasUserGestured: boolean;
  isVisualizing: boolean;
  getConfiguration: () => string;
  loadConfiguration: (val: string) => Promise<boolean>;
}

const SongCommentSection = ({
  songData,
  audioModules,
  isCommentsSectionDisplayed,
  hasUserGestured,
  isVisualizing,
  getConfiguration,
  loadConfiguration,
}: Props) => {
  const [commentsPayload, setCommentsPayload] = useState(
    new Map<string, SongComment>()
  );
  const [areParentCommentsFetched, setAreParentCommentsFetched] =
    useState(false);
  const [commentInputPlaceholder, setCommentInputPlaceholder] = useState(
    "Write a new comment ..."
  );
  const [commentData, setCommentData] = useState("");
  const [currentReplyId, setCurrentReplyId] = useState("");
  const [isChainAttached, setIsChainAttached] = useState(false);
  const [chainConfig, setChainConfig] = useState("");
  const [chainName, setChainName] = useState("");
  const [parentCommentId, setParentCommentId] = useState("empty");
  const [currentHoverTarget, setCurrentHoverTarget] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const authContext = useContext(AuthContext);
  const envContext = useContext(EnvironmentContext);

  const refreshComments = async () => {
    // setCommentsPayload(new Map<string, SongComment>());
    setAreParentCommentsFetched(false);
  };

  const postComment = async () => {
    setError("");
    setMessage("");

    if (!commentData) {
      setError("cannot post an empty comment!");
      return;
    }

    let chainBody = undefined;

    if (isChainAttached) {
      chainBody = JSON.stringify({
        data: JSON.stringify(chainConfig),
        name: chainName,
      });
    } else {
      chainBody = JSON.stringify({
        data: JSON.stringify("N/A"),
        name: "N/A",
      });
    }

    let response = await fetch(`${envContext.backendURL}/comment/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({
        songId: songData.id,
        data: commentData,
        replyId: currentReplyId,
        hasChain: `${isChainAttached}`,
        chain: chainBody,
      }),
    });

    let json = undefined;

    try {
      json = await response.json();
    } catch (e) {
      console.log("Invalid response json!");
    }

    if (response.ok) {
      if (currentReplyId == "") {
        // At newly created comment to commentsList in order to allow refresh to retrieve parent level comments
        songData.commentsList.push(json.commentId);
      }

      setMessage("comment posted successfully!");
      setCommentData("");
      setCurrentReplyId("");
      setIsChainAttached(false);
      setChainConfig("");
      setChainName("");
      setCommentInputPlaceholder("Write a new comment ...");

      // setTimeout(async () => {
      //   await refreshComments();
      // }, 2000);
    } else {
      console.log(json);
      setError("Comment posting failed!");
    }
  };

  const deleteComment = async (commentId: string) => {
    setMessage("");
    setError("");

    if (commentId.length != 24) {
      setError("Cannot delete with invalid comment id!");
      return;
    }

    let response = await fetch(
      `${envContext.backendURL}/comment/${commentId}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${authContext.user.token}`,
        },
      }
    );

    if (response.ok) {
      setMessage("comment deleted started successfully!");
      commentsPayload.delete(commentId);
      setCommentsPayload(commentsPayload);

      let commentIdIdx = songData.commentsList.indexOf(commentId);
      if (commentIdIdx > -1) {
        // Remove comment id from parent comments id list upon successful deletion
        songData.commentsList.splice(commentIdIdx, 1);
      }

      // setTimeout(async () => {
      //   await refreshComments();
      // }, 2000);
    } else {
      const json = await response.json();
      console.log(json);
      setError("Error deleting comment!");
    }
  };

  const interactComment = async (
    commentId: string,
    isUpvotePressed: boolean,
    hasUserUpvoted: boolean,
    hasUserDownvoted: boolean
  ) => {
    // 0 - neither, 1 - upvote, 2 - downvote

    setError("");
    setMessage("");

    let userComment = commentsPayload.get(commentId);

    if (!userComment) {
      console.log("The comment you have interacted with doe not exist!");
      return;
    }

    let prevInteractionStatus = {
      upvoteCount: userComment.upvoteCount,
      downvoteCount: userComment.downvoteCount,
      hasUserUpvoted: userComment.hasUserUpvoted,
      hasUserDownvoted: userComment.hasUserDownvoted,
    };

    let interactionStatus = undefined;

    if (isUpvotePressed && !hasUserUpvoted) {
      interactionStatus = 1;
      userComment.hasUserUpvoted = true;
      userComment.upvoteCount += 1;

      if (hasUserDownvoted) {
        userComment.hasUserDownvoted = false;
        userComment.downvoteCount -= 1;
      }
    } else if (isUpvotePressed && hasUserUpvoted) {
      interactionStatus = 0;
      userComment.hasUserUpvoted = false;
      userComment.upvoteCount -= 1;
    } else if (!isUpvotePressed && !hasUserDownvoted) {
      interactionStatus = 2;
      userComment.hasUserDownvoted = true;
      userComment.downvoteCount += 1;

      if (hasUserUpvoted) {
        userComment.hasUserUpvoted = false;
        userComment.upvoteCount -= 1;
      }
    } else if (!isUpvotePressed && hasUserDownvoted) {
      interactionStatus = 0;
      userComment.hasUserDownvoted = false;
      userComment.downvoteCount -= 1;
    }

    setCommentsPayload(commentsPayload);

    let response = await fetch(
      `${envContext.backendURL}/comment/${commentId}/interact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authContext.user.token}`,
        },
        body: JSON.stringify({
          interactionStatus: `${interactionStatus}`,
        }),
      }
    );

    if (response.ok) {
      // do nothing
    } else {
      let json = await response.json();
      console.log(json);
      setError("Comment interaction failed!");

      // Reset user comment
      userComment.upvoteCount = prevInteractionStatus.upvoteCount;
      userComment.downvoteCount = prevInteractionStatus.downvoteCount;
      userComment.hasUserUpvoted = prevInteractionStatus.hasUserUpvoted;
      userComment.hasUserDownvoted = prevInteractionStatus.hasUserDownvoted;
      setCommentsPayload(commentsPayload);
    }
  };

  const fetchComments = async (
    commentsList: string[]
  ): Promise<Map<string, SongComment>> => {
    let tempCommentPayload: Map<string, SongComment> = commentsPayload;

    for (let i = 0; i < commentsList.length; i++) {
      let response = await fetch(
        `${envContext.backendURL}/comment/${commentsList[i]}`,
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
        tempCommentPayload.delete(commentsList[i]);
      }
    }

    return tempCommentPayload;
    // setCommentsPayload(tempCommentPayload);
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
          `${envContext.backendURL}/comment/${replyList[i]}`,
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
          tempCommentPayload.delete(replyList[i]);
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
        setCommentsPayload(temp);
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
        setCommentsPayload(temp);
        // setCurrentComments(temp);
      } else {
        // do nothing
      }
    };

    fetchNewComments();
  }, [parentCommentId, areParentCommentsFetched]);

  useEffect(() => {
    // Clear error and message after a set time period of being displayed

    if (!message && !error) {
      return;
    }

    let temp = setTimeout(() => {
      setError("");
      setMessage("");
    }, 5000);

    return () => {
      clearTimeout(temp);
    };
  }, [message, error]);

  const generateSongComments = (): JSX.Element => {
    let temp = new Array(3).fill(0);

    if (!areParentCommentsFetched) {
      return (
        <>
          {temp.map((item, idx) => (
            <div
              className="bg-gray-200 w-10/12 h-20 ml-auto mr-auto mt-4 pb-1 border border-black animate-pulse"
              key={idx}
            ></div>
          ))}
          ;
        </>
      );
    } else {
      if (commentsPayload.size == 0) {
        // Render nothing except a margin
        return <div className="pt-2"></div>;
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
                      className="bg-gray-400 w-1 h-28 absolute"
                      style={{
                        marginLeft: `${6}%` /* Shift comments over based on whether or not it is a reply. Standard is 8% */,
                        marginTop: "2.4%",
                      }}
                    ></div>
                  )}

                  <div
                    className="w-10/12 h-max ml-auto mr-auto mt-4 pb-1 shadow-md"
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
                            <Link
                              className="text-black hover:text-blue-500"
                              to={`/userProfile/${item[1].creatorId}`}
                            >
                              {item[1].creatorUserName}
                            </Link>
                          </p>
                        </div>
                        <div className="border-b border-gray-400 w-6/12 h-full overflow-hidden inline-block">
                          <div className="w-full h-max flex align-middle justify-center pt-1">
                            <div
                              className={
                                item[1].hasChain
                                  ? "opacity-100 hover:font-bold"
                                  : "opacity-40"
                              }
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
                              onClick={async () => {
                                if (!hasUserGestured || !isVisualizing) {
                                  setError(
                                    "Cannot load configuration before song is loaded!"
                                  );
                                  return;
                                }

                                setMessage(
                                  `loading configuration : ${item[1].chain.name}`
                                );

                                let result = await loadConfiguration(
                                  JSON.parse(JSON.parse(item[1].chain.data))
                                );

                                if (!result) {
                                  setError("Chain loading failed!");
                                } else {
                                  setMessage(
                                    "Configuration loaded successfully!"
                                  );
                                }
                              }}
                            >
                              Load configuration
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 pr-3 pl-3 pb-3 h-max block text-center">
                      {item[1].data}
                    </div>
                    <div className=" w-4/6 h-6 ml-auto mr-auto flex">
                      <div className=" border-t border-gray-400 w-3/6 h-6 mt-0 ml-auto mr-auto overflow-hidden flex justify-around">
                        <span
                          className={
                            item[1].hasUserUpvoted
                              ? "material-symbols-outlined font-bold text-green-500"
                              : "material-symbols-outlined hover:font-bold"
                          }
                          onClick={() => {
                            interactComment(
                              item[0],
                              true,
                              item[1].hasUserUpvoted,
                              item[1].hasUserDownvoted
                            );
                            setTriggerRefresh(triggerRefresh + 1);
                          }}
                        >
                          arrow_upward
                        </span>
                        <p>{item[1].upvoteCount}</p>
                        <span
                          className={
                            item[1].hasUserDownvoted
                              ? "material-symbols-outlined font-bold text-red-500"
                              : "material-symbols-outlined hover:font-bold"
                          }
                          onClick={() => {
                            interactComment(
                              item[0],
                              false,
                              item[1].hasUserUpvoted,
                              item[1].hasUserDownvoted
                            );
                            setTriggerRefresh(triggerRefresh + 1);
                          }}
                        >
                          arrow_downward
                        </span>
                        <p>{item[1].downvoteCount}</p>
                      </div>
                      <div className="border-t border-gray-400 w-6/12 h-full overflow-hidden flex justify-around">
                        <a href="#comment-input" className="text-black">
                          <span
                            className="material-symbols-outlined hover:font-bold"
                            onClick={() => {
                              generateReplyPlaceholderText(item[0]);
                              setCurrentReplyId(item[0]);
                            }}
                          >
                            reply
                          </span>
                        </a>
                        <p>reply</p>
                        {item[1].creatorId == authContext.user.id && (
                          <>
                            <span
                              className="material-symbols-outlined hover:font-bold"
                              onClick={() => {
                                deleteComment(item[0]);
                              }}
                            >
                              delete
                            </span>
                            <p>delete</p>
                          </>
                        )}
                        {item[1].creatorId != authContext.user.id && (
                          <>
                            <span className="material-symbols-outlined opacity-40">
                              delete
                            </span>
                            <p className="opacity-40">delete</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {item[1].replyList.length > 0 && (
                    <div
                      className={
                        currentHoverTarget == item[0]
                          ? "shadow-sm h-6 w-3/12 rounded-b-lg flex ml-auto mr-auto justify-center overflow-hidden"
                          : "bg-cyan-400 shadow-sm h-1 w-3/12 rounded-b-lg flex ml-auto mr-auto justify-center overflow-hidden"
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
          ? " shadow-lg w-12/12 h-max pt-1 pb-3"
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

      <div className="shadow-md rounded-lg w-11/12 h-20 ml-auto mr-auto mt-3">
        <div className="w-full h-4/6" id="comment-input">
          <input
            type="text"
            className="rounded-t-lg bg-transparent w-full h-full pl-1 pr-1"
            placeholder={commentInputPlaceholder}
            value={commentData}
            onChange={(e) => {
              setCommentData(e.target.value);
            }}
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
              className="hover:font-bold"
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
              onClick={() => {
                postComment();
              }}
            >
              Submit
            </div>
          </div>
          <div className="w-6/12 h-full flex justify-center">
            <div
              className={
                !isChainAttached ? "opacity-100" : "font-bold opacity-100"
              }
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
              onClick={() => {
                if (!isChainAttached) {
                  let tempChainName = prompt(
                    "What would you like to call the chain you are attaching to this comment?"
                  );

                  if (!tempChainName || tempChainName.length > 25) {
                    if (!tempChainName) {
                      alert("Sorry, you cannot have an empty chain name!");
                    } else {
                      alert(
                        "Sorry, you cannot have a chain name that is more than 25 characters!"
                      );
                    }
                    return;
                  }

                  setChainName(tempChainName);
                  let configuration = getConfiguration();
                  console.log(configuration);
                  setChainConfig(configuration);
                } else {
                  // do nothing
                }
                setIsChainAttached(!isChainAttached);
              }}
            >
              {isChainAttached && "Remove attached configuration"}
              {!isChainAttached && "Attach current configuration"}
            </div>
          </div>
        </div>
      </div>
      <div
        className="mt-2 ml-auto mr-auto hover:font-bold"
        style={{
          width: "15%",
          height: "15px",
          marginBottom: "-18px",
          border: "1px solid black",
          borderRadius: "6px",
          fontSize: "10px",
          textAlign: "center",
          overflow: "hidden",
        }}
        onClick={() => {
          refreshComments();
        }}
      >
        Refresh comments
      </div>
      {generateSongComments()}
    </div>
  );
};

export default SongCommentSection;
