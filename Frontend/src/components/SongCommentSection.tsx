import { useEffect } from "react";

import { SongData } from "../customTypes";

interface Props {
  songData: SongData;
  isCommentsSectionDisplayed: boolean;
  commentInputPlaceholder: string;
  setCommentInputPlaceholder: (val: string) => void;
  commentPayload: Map<string, Object>;
  setCommentPayload: (val: Map<string, Object>) => void;
  areCommentsFetched: boolean;
  setAreCommentsFetched: (val: boolean) => void;
}

const SongCommentSection = ({
  songData,
  isCommentsSectionDisplayed,
  commentInputPlaceholder,
  setCommentInputPlaceholder,
  commentPayload,
  setCommentPayload,
  areCommentsFetched,
  setAreCommentsFetched,
}: Props) => {
  //   console.log(songData);

  useEffect(() => {}, []);

  const generateSongComments = (): JSX.Element => {
    let temp = new Array(5).fill(0);

    return (
      <>
        {temp.map((item, idx) => (
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
                    the gnome zone
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
            <div className="pt-3 pr-3 pl-3 pb-3 h-max block">
              There is some stuff here that needs to be expanded! There is some
              stuff here that needs to be expanded! There is some stuff
              hereThere is some stuff here that needs to be expanded! There is
              some stuff here that needs to be expanded! There is some stuff
              hereThere is some stuff here that needs to be expanded! There is
              some stuff here that needs to be expanded! There is some stuff
              hereThere is some stuff here that needs to be expanded! There is
              some stuff here that needs to be expanded! There is some stuff
              hereThere is some stuff here that needs to be expanded! There is
              some stuff here that needs to be expanded! There is some stuff
              hereThere is some stuff here that needs to be expanded! There is
            </div>
            <div className="w-4/6 h-6 ml-auto mr-auto flex">
              <div className=" border-t border-gray-400 w-3/6 h-6 mt-0 ml-auto mr-auto overflow-hidden flex justify-around">
                <span className="material-symbols-outlined hover:font-bold">
                  arrow_upward
                </span>
                <p>1.4M</p>
                <span className="material-symbols-outlined hover:font-bold">
                  arrow_downward
                </span>
                <p>5.5M</p>
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
        ))}
      </>
    );
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
