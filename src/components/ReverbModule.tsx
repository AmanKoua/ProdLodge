import CSS from "csstype";

interface Props {
  data: Object;
  position: number[];
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
}

const ReverbModule = ({ data, position, editAudioNodeData }: Props) => {
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

  return (
    <div style={NewAudioModuleStyle}>
      <div style={CenterDivStyle}>
        <h1 style={SelectModuleTextStyle}>Reverb</h1>
      </div>
    </div>
  );
};

export default ReverbModule;
