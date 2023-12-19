import CSS from "csstype";

interface Props {
  position: number[]; // moduleContainerIndex, moduleIndex
  setModuleType: (type: string, index: number[]) => void;
}

const NewAudioModule = ({ position, setModuleType }: Props) => {
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
    // console.log(event.target.value, position); // works
    setModuleType(event.target.value, position);
  };

  return (
    <div className="w-4/12 h-full ml-1 mr-1 rounded-md border-gray-400 border-r-2 border-l-2 border-t-2 border-b-2 shadow-sm">
      <div className="w-10/12 h-full ml-auto mr-auto">
        <h1 className="w-12/12 text-xl ml-auto mr-auto pt-2 text-center">
          Select Module Type
        </h1>
        <div className="w-max h-max ml-auto mr-auto">
          <select
            name={"newModuleType"}
            onChange={handleSelectionChange}
            className="w-max mt-12 bg-prodSecondary"
          >
            <option value={"Invalid"}>Select Type</option>
            <option value={"Highpass"}>HighPass</option>
            <option value={"Lowpass"}>LowPass</option>
            <option value={"Peak"}>Peak (filter)</option>
            <option value={"Reverb"}>Convolver</option>
            <option value={"FDNReverb"}>Reverb</option>
            <option value={"Waveshaper"}>Waveshaper</option>
            <option value={"Gain"}>Gain</option>
            <option value={"Compression"}>Compression</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default NewAudioModule;
