import CSS from "csstype";
import deleteButton from "../assets/delete.png";

interface Props {
  data: Object;
  position: number[];
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
  deleteAudioModuleAndNode: (position: number[]) => void;
}

const ReverbModule = ({
  data,
  position,
  editAudioNodeData,
  deleteAudioModuleAndNode,
}: Props) => {
  // console.log(data);

  const DeleteButtonStyle: CSS.Properties = {
    marginLeft: "39%",
    marginTop: "0%",
    position: "absolute",
    width: "20%",
    height: "20%",
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

  const handleDeleteIconClick = (event: any) => {
    deleteAudioModuleAndNode(position);
  };

  return (
    <div style={AudioModuleStyle}>
      <div style={CenterDivStyle}>
        <h1 style={SelectModuleTextStyle}>Reverb</h1>
        <br></br>
        <img
          src={deleteButton}
          style={DeleteButtonStyle}
          onClick={handleDeleteIconClick}
        ></img>
      </div>
    </div>
  );
};

export default ReverbModule;
