import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import { SongData, CommentRequestResponse, SongComment } from "../customTypes";

interface Props {
  songData: SongData;
  isCommentsSectionDisplayed: boolean;
  commentInputPlaceholder: string;
  setCommentInputPlaceholder: (val: string) => void;
  commentsPayload: Map<string, SongComment>;
  setCommentPayload: (val: Map<string, SongComment>) => void;
  areParentCommentsFetched: boolean;
  setAreParentCommentsFetched: (val: boolean) => void;
}

const SongCommentSection = ({
  songData,
  isCommentsSectionDisplayed,
  commentInputPlaceholder,
  setCommentInputPlaceholder,
  commentsPayload,
  setCommentPayload,
  areParentCommentsFetched,
  setAreParentCommentsFetched,
}: Props) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentComments, setCurrentComments] = useState<
    Map<string, SongComment>
  >(new Map<string, SongComment>());
  const authContext = useContext(AuthContext);

  const fetchComments = async (commentsList: string[]) => {
    let tempCommentPayload: Map<string, SongComment> = new Map<
      string,
      SongComment
    >();

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
        //   console.log(json);
      } else {
        const json = await response.json();
        console.log("Comment fetching error", json);
      }
    }

    setCommentPayload(tempCommentPayload);
    setCurrentComments(tempCommentPayload);
  };

  const fetchReplyComments = () => {
    // Fetch the replies for the currentComments if they are not already fetched
    // Must use map.set and map.get. VERY IMPORTANT

    let tempCurrentComments: Map<string, SongComment> = currentComments;

    currentComments.forEach(async (songComment, commentId) => {
      for (let i = 0; i < songComment.replyList.length; i++) {
        if (currentComments.get(songComment.replyList[i]) == undefined) {
          let response = await fetch(
            `http://localhost:8005/comment/${songComment.replyList[i]}`,
            {
              method: "GET",
              headers: {
                authorization: `Bearer ${authContext.user.token}`,
              },
            }
          );

          if (response.ok) {
            const json = (await response.json()) as CommentRequestResponse;
            tempCurrentComments.set(songComment.replyList[i], json.comment);
            //   console.log(json);
          } else {
            const json = await response.json();
            console.log("Comment fetching error", json);
          }
        }
      }
    });

    setCurrentComments(tempCurrentComments);
  };

  useEffect(() => {
    // Fetch song comments and initialize commentsPayload
    if (!areParentCommentsFetched) {
      fetchComments(songData.commentsList);
      setAreParentCommentsFetched(true);
    } else {
      // do nothing
    }
  }, [areParentCommentsFetched]);

  useEffect(() => {
    if (currentComments.size == 0) {
      return;
    }
    fetchReplyComments();
  }, [currentComments]);

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
      if (currentComments.size == 0) {
        // Render nothing
        return <></>;
      } else {
        return (
          <>
            {Array.from(currentComments).map((item, idx) => {
              return (
                <div
                  className="bg-blue-100 w-10/12 h-max ml-auto mr-auto mt-4 pb-1 border border-black"
                  style={{
                    marginLeft: `${
                      // idx * 1.5 + 8
                      8
                    }%` /* Shift comments over based on whether or not it is a reply. Standard is 8% */,
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
                      <span className="material-symbols-outlined hover:font-bold">
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
      <div className="bg-white rounded-lg w-11/12 h-20 ml-auto mr-auto mt-3">
        <div className="w-full h-4/6">
          <input
            type="text"
            className="w-full h-full pl-1 pr-1 border-b"
            placeholder={commentInputPlaceholder}
          />
        </div>

        <div className="w-4/6 h-2/6 ml-auto mr-auto flex justify-start">
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
