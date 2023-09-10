import React from "react";
import CSS from "csstype";
import addButton from "../assets/addModule1.png";

interface Props {
  addModule: () => void;
}

const BlankAudioModule = ({ addModule }: Props) => {
  const BlankAudioModuleStyle: CSS.Properties = {
    position: "relative",
    marginTop: "1%",
    marginLeft: "2.5%",
    width: "30%",
    height: "185px",
    border: "1px solid black",
    borderRadius: "10px",
    // backgroundColor: "green",
    opacity: "100%",
  };

  const AddButtonStyle: CSS.Properties = {
    position: "absolute",
    marginTop: "0%",
    marginLeft: "36%",
    width: "28%",
    height: "25%",
  };

  const AddModuleTextStyle: CSS.Properties = {
    fontSize: "20px",
    width: "60%",
    marginLeft: "20%",
    marginTop: "10%",
    textAlign: "center",
    // backgroundColor: "green",
  };

  const CenterDivStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "24%",
    marginTop: "15%",
    alignContent: "center",
    width: "50%",
    height: "70%",
    // backgroundColor: "blue",
    opacity: "80%",
    zIndex: "50",
  };

  return (
    <div className="w-4/12 h-full ml-1 mr-1 rounded-md border-gray-400 border-r-2 border-l-2 border-t-2 border-b-2 shadow-sm">
      <div className="w-10/12 h-full ml-auto mr-auto">
        <h1 className="w-max text-xl ml-auto mr-auto pt-2">Add Module</h1>
        <img
          className="w-3/12 ml-auto mr-auto mt-12"
          src={addButton}
          onClick={() => {
            addModule();
          }}
        ></img>
      </div>
    </div>
  );
};

export default BlankAudioModule;
