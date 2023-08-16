import CSS from "csstype";

interface Props {
  data: Object;
  position: number[];
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
}

const LowPassModule = ({ data, position, editAudioNodeData }: Props) => {
  // console.log(data);

  const NewAudioModuleStyle: CSS.Properties = {
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
    height: "15%",
    opacity: "80%",
    zIndex: "50",
    // backgroundColor: "blue",
  };

  const FreqSliderStyle: CSS.Properties = {
    width: "80%",
    marginLeft: "10%",
    marginTop: "0%",
  };

  const AttributeTextStyle: CSS.Properties = {
    fontSize: "10px",
    width: "60%",
    marginLeft: "35%",
    textAlign: "center",
    // backgroundColor: "green",
  };

  const handleDivClick = () => {
    // temp function to test audioNode modification
    // let tempData = data;
    // tempData.frequency = data.frequency + 1000;
    // editAudioNodeData(data, position);
  };

  const handleSliderChange = (event: any) => {
    // HELL YEAH!
    let tempData = data;
    tempData.frequency = event.target.value;
    editAudioNodeData(data, position);
  };

  return (
    <div style={NewAudioModuleStyle} onClick={handleDivClick}>
      <div style={CenterDivStyle}>
        <h1 style={ModuleNameTextStyle}>LowPass</h1>
        <div style={CenterAttributeTextDivStyle}>
          <text style={AttributeTextStyle}>Frequency</text>
        </div>
        <input
          type={"range"}
          min={5}
          max={24000}
          style={FreqSliderStyle}
          onChange={handleSliderChange}
        ></input>
      </div>
    </div>
  );
};

export default LowPassModule;
