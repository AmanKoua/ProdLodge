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
    borderRadius: "10px", // turn div into a circle
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
    <div className=" w-4/12 h-full ml-1 mr-1 rounded-md border-gray-400 border-r-2 border-l-2 border-t-2 border-b-2 shadow-sm">
      <div className=" w-10/12 h-full ml-auto mr-auto pt-1 overflow-y-scroll hide-scrollbar ">
        <div className="flex justify-between">
          <img
            src={moveLeftButton}
            onClick={handleLeftButtonClick}
            className="w-2/12"
          ></img>
          <img
            src={moveRightButton}
            onClick={handleRightButtonClick}
            className="w-2/12"
          ></img>
        </div>
        <h1 className="text-xl w-max mr-auto ml-auto">Compression</h1>
        <div className="w-max mr-auto ml-auto">
          <p>Threshold : {data.threshold}</p>
        </div>
        <div className="w-max mr-auto ml-auto">
          <input
            type={"range"}
            value={data.threshold}
            min={-100}
            max={0}
            onChange={handleThreshSliderChange}
          ></input>
        </div>
        <div className="w-max mr-auto ml-auto">
          <p>Knee : {data.knee}</p>
        </div>
        <div className="w-max mr-auto ml-auto">
          <input
            type={"range"}
            min={0}
            max={40}
            value={data.knee}
            onChange={handleKneeSliderChange}
          ></input>
        </div>
        <div className="w-max mr-auto ml-auto">
          <p>Ratio : {data.ratio}</p>
        </div>
        <div className="w-max mr-auto ml-auto">
          <input
            type={"range"}
            min={1}
            max={20}
            value={data.ratio}
            onChange={handleRatioSliderChange}
          ></input>
        </div>
        <div className="w-max mr-auto ml-auto">
          <p>Attack : {data.attack}</p>
        </div>
        <div className="w-max mr-auto ml-auto">
          <input
            type={"range"}
            min={10}
            max={1000}
            value={data.attack}
            onChange={handleAttackSliderChange}
          ></input>
        </div>
        <div className="w-max mr-auto ml-auto">
          <p>Release : {data.release}</p>
        </div>
        <div className="w-max mr-auto ml-auto">
          <input
            type={"range"}
            min={10}
            max={1000}
            value={data.release}
            onChange={handleReleaseSliderChange}
          ></input>
        </div>
        <br></br>
        <div className="w-10/12 mr-auto ml-auto pb-2 flex justify-between">
          <div
            style={IsEnabledButton}
            onClick={handleToggleEnabledButtonClick}
            className="w-2/12 h-6/6"
          ></div>
          <img
            src={deleteButton}
            onClick={handleDeleteIconClick}
            className="w-2/12"
          ></img>
        </div>
      </div>
    </div>
  );
};

export default CompressionModule;
