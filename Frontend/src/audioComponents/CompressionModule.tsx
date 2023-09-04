import CSS from "csstype";
import deleteButton from "../assets/delete.png";
import moveLeftButton from "../assets/moveLeft.png";
import moveRightButton from "../assets/moveRight.png";

import { AudioModule } from "../customTypes";

import "../invisibleScrollbar.css";

interface Props {
  data: AudioModule;
  position: number[];
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
  setAudioNodesChanged: (val: boolean) => void;
  deleteAudioModuleAndNode: (position: number[]) => void;
  moveAudioModuleAndNode: (position: number[], isLeft: boolean) => void;
}

const CompressionModule = ({
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

  const SliderStyle: CSS.Properties = {
    width: "80%",
    marginLeft: "10%",
    marginTop: "0%",
  };

  const AttributeTextStyle: CSS.Properties = {
    fontSize: "10px",
    width: "60%",
    marginLeft: "20%",
    textAlign: "center",
    // backgroundColor: "green",
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

  const handleThreshSliderChange = (event: any) => {
    /*
      The way that information is propagates through the audioModules
      state is be directly mutating the state variable WITHOUT calling
      setState. tempData is a reference to the state varaible, and so 
      changing it automatically changes the sate. If this becomes a problem,
      it can be changed later, but it seems to work fine.
      */
    let tempData = data;
    tempData.threshold = event.target.value;
    editAudioNodeData(data, position);
  };

  const handleKneeSliderChange = (event: any) => {
    let tempData = data;
    tempData.knee = event.target.value;
    editAudioNodeData(data, position);
  };

  const handleRatioSliderChange = (event: any) => {
    let tempData = data;
    tempData.ratio = event.target.value;
    editAudioNodeData(data, position);
  };

  const handleReductionSliderChange = (event: any) => {
    let tempData = data;
    tempData.reduction = event.target.value;
    editAudioNodeData(data, position);
  };

  const handleAttackSliderChange = (event: any) => {
    let tempData = data;
    tempData.attack = event.target.value;
    editAudioNodeData(data, position);
  };

  const handleReleaseSliderChange = (event: any) => {
    let tempData = data;
    tempData.release = event.target.value;
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
        <h1 style={ModuleNameTextStyle}>Compression</h1>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Threshold : {data.threshold}</p>
        </div>
        <input
          type={"range"}
          value={data.threshold}
          min={-100}
          max={0}
          style={SliderStyle}
          onChange={handleThreshSliderChange}
        ></input>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Knee : {data.knee}</p>
        </div>
        <input
          type={"range"}
          min={0}
          max={40}
          style={SliderStyle}
          value={data.knee}
          onChange={handleKneeSliderChange}
        ></input>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Ratio : {data.ratio}</p>
        </div>
        <input
          type={"range"}
          min={1}
          max={20}
          style={SliderStyle}
          value={data.ratio}
          onChange={handleRatioSliderChange}
        ></input>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Attack : {data.attack}</p>
        </div>
        <input
          type={"range"}
          min={0}
          max={1000}
          style={SliderStyle}
          value={data.attack}
          onChange={handleAttackSliderChange}
        ></input>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Release : {data.release}</p>
        </div>
        <input
          type={"range"}
          min={0}
          max={1000}
          style={SliderStyle}
          value={data.release}
          onChange={handleReleaseSliderChange}
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

export default CompressionModule;
