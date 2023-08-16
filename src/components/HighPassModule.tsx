import CSS from "csstype";
import deleteButton from "../assets/delete.png";

interface Props {
  data: Object;
  position: number[];
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
}

const HighPassModule = ({ data, position, editAudioNodeData }: Props) => {
  // console.log(data);

  const DeleteButtonStyle: CSS.Properties = {
    marginLeft: "45%",
    marginTop: "4%",
    position: "absolute",
    width: "10%",
    height: "13%",
  };

  const AudioModuleStyle: CSS.Properties = {
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
  };

  const handleSliderChange = (event: any) => {
    // HELL YEAH!
    let tempData = data;
    tempData.frequency = event.target.value;
    editAudioNodeData(data, position);
  };

  const handleResonanceSliderChange = (event: any) => {
    let tempData = data;
    tempData.resonance = event.target.value;
    editAudioNodeData(data, position);
  };

  return (
    <div style={AudioModuleStyle}>
      <div style={CenterDivStyle}>
        <h1 style={ModuleNameTextStyle}>HighPass</h1>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Frequency : {data.frequency}</p>
        </div>
        <input
          type={"range"}
          value={data.frequency}
          min={20}
          max={21000}
          style={SliderStyle}
          onChange={handleSliderChange}
        ></input>
        <div style={CenterAttributeTextDivStyle}>
          <p style={AttributeTextStyle}>Resonance : {data.resonance}</p>
        </div>
        <input
          type={"range"}
          min={-25}
          max={25}
          style={SliderStyle}
          value={data.resonance}
          onChange={handleResonanceSliderChange}
        ></input>
        <br></br>
        <img src={deleteButton} style={DeleteButtonStyle}></img>
      </div>
    </div>
  );
};

export default HighPassModule;
