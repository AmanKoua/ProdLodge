import CSS from "csstype";

interface Props {
  moduleIndex: number[]; // moduleContainerIndex, moduleIndex
  setModuleType: (type: string, index: number[]) => void;
}

const NewAudioModule = ({ moduleIndex, setModuleType }: Props) => {
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
    marginLeft: "24%",
    marginTop: "15%",
    alignContent: "center",
    width: "50%",
    height: "70%",
    // backgroundColor: "blue",
    opacity: "80%",
    zIndex: "50",
  };

  const SelectModuleTextStyle: CSS.Properties = {
    fontSize: "20px",
    width: "60%",
    marginLeft: "20%",
    marginTop: "10%",
    textAlign: "center",
    // backgroundColor: "green",
  };

  const SelectorStyle: CSS.Properties = {
    position: "absolute",
    width: "100%",
    // backgroundColor: "green",
  };

  const handleSelectionChange = (event: any) => {
    // console.log(event.target.value, moduleIndex); // works
    setModuleType(event.target.value, moduleIndex);
  };

  return (
    <div style={NewAudioModuleStyle}>
      <div style={CenterDivStyle}>
        <h1 style={SelectModuleTextStyle}>Select Module Type</h1>
        <select
          name={"newModuleType"}
          style={SelectorStyle}
          onChange={handleSelectionChange}
        >
          <option value={"Invalid"}>Select Type</option>
          <option value={"Highpass"}>HighPass</option>
          <option value={"Lowpass"}>LowPass</option>
          <option value={"Reverb"}>Reverb</option>
        </select>
      </div>
    </div>
  );
};

export default NewAudioModule;
