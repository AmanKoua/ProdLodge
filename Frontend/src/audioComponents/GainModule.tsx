import CSS from "csstype";
import deleteButton from "../assets/delete.png";
import moveLeftButton from "../assets/moveLeft.png";
import moveRightButton from "../assets/moveRight.png";

import "../invisibleScrollbar.css";

interface Props {
  data: Object;
  position: number[];
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
  setAudioNodesChanged: (val: boolean) => void;
  deleteAudioModuleAndNode: (position: number[]) => void;
  moveAudioModuleAndNode: (position: number[], isLeft: boolean) => void;
}
const GainModule = ({
  data,
  position,
  deleteAudioModuleAndNode,
  setAudioNodesChanged,
  editAudioNodeData,
  moveAudioModuleAndNode,
}: Props) => {
  // console.log(data);

  const AudioModuleStyle: CSS.Properties = {
    position: "relative",
    marginTop: "1%",
    marginLeft: "2.5%",
    width: "30%",
    height: "185px",
    border: "1px solid black",
    borderRadius: "10px",
    // backgroundColor: "green",
    // opacity: "100%",
    overflowY: "scroll",
    opacity: data.isEnabled ? "100%" : "35%",
  };

  const CenterDivStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "5%",
    marginTop: "5%",
    alignContent: "center",
    width: "90%",
    height: "90%",
    opacity: "80%",
    zIndex: "50",
    // backgroundColor: "blue",
  };

  const ModuleNameTextStyle: CSS.Properties = {
    fontSize: "20px",
    width: "60%",
    marginLeft: "20%",
    marginTop: "10%",
    textAlign: "center",
    // backgroundColor: "green",
  };
  const CenterAttributeTextDivStyle: CSS.Properties = {
    position: "relative",
    marginLeft: "15%",
    marginTop: "0%",
    alignContent: "center",
    width: "70%",
    height: "8%",
    opacity: "80%",
    zIndex: "50",
    // backgroundColor: "blue",
  };

  const AttributeTextStyle: CSS.Properties = {
    fontSize: "10px",
    width: "60%",
    marginLeft: "20%",
    textAlign: "center",
    // backgroundColor: "green",
  };

  const SliderStyle: CSS.Properties = {
    width: "80%",
    marginLeft: "10%",
    marginTop: "0%",
    marginBottom: "45px",
  };

  const DeleteButtonStyle: CSS.Properties = {
    marginLeft: "60%",
    marginTop: "4%",
    position: "absolute",
    width: "10%",
    height: "13%",
  };

  const IsEnabledButton: CSS.Properties = {
    marginLeft: "30%",
    marginTop: "4%",
    position: "absolute",
    width: "10%",
    height: "13%",
    borderRadius: "25px", // turn div into a circle
    backgroundColor: data.isEnabled ? "#16fa19" : "red",
  };

  const MoveLeftButtonStyle: CSS.Properties = {
    marginLeft: "0%",
    marginTop: "0%",
    position: "absolute",
    width: "10%",
    height: "10%",
  };

  const MoveRightButtonStyle: CSS.Properties = {
    marginLeft: "92%",
    marginTop: "0%",
    position: "absolute",
    width: "10%",
    height: "10%",
  };

  const handleSliderChange = (event: any) => {
    // HELL YEAH!
    let tempData = data;
    tempData.amount = event.target.value / 100;
    editAudioNodeData(data, position);
  };

  const handleDeleteIconClick = (event: any) => {
    deleteAudioModuleAndNode(position);
  };

  const handleToggleEnabledButtonClick = (event: any) => {
    data.isEnabled = !data.isEnabled;
    setAudioNodesChanged(true);
  };

  const handleLeftButtonClick = () => {
    moveAudioModuleAndNode(position, true);
  };

  const handleRightButtonClick = () => {
    moveAudioModuleAndNode(position, false);
  };

  return (
    <div style={AudioModuleStyle} className="hide-scrollbar">
      <div style={CenterDivStyle}>
        <img
          src={moveLeftButton}
          style={MoveLeftButtonStyle}
          onClick={handleLeftButtonClick}
        ></img>
        <img
          src={moveRightButton}
          style={MoveRightButtonStyle}
          onClick={handleRightButtonClick}
        ></img>
        <h1 style={ModuleNameTextStyle}>Gain</h1>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Amount : {data.amount}</p>
        </div>
        <input
          type={"range"}
          value={data.amount * 100}
          min={0}
          max={500}
          style={SliderStyle}
          onChange={handleSliderChange}
        ></input>
        <br></br>
        <img
          src={deleteButton}
          style={DeleteButtonStyle}
          onClick={handleDeleteIconClick}
        ></img>
        <div
          style={IsEnabledButton}
          onClick={handleToggleEnabledButtonClick}
        ></div>
      </div>
    </div>
  );
};

export default GainModule;