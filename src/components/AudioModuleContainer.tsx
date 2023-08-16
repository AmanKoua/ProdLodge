import React from "react";
import BlankAudioModule from "./BlankAudioModule";
import NewAudioModule from "./NewAudioModule";
import HighPassModule from "./HighPassModule";
import LowPassModule from "./LowPassModule";
import ReverbModule from "./ReverbModule";
import CSS from "csstype";

interface Props {
  containerIndex: number;
  modules: Object[]; // pass in data required to reconstruct module interfaces
  addModule: () => void;
  deleteAudioModuleAndNode: (position: number[]) => void;
  setModuleType: (type: string, index: number[]) => void;
  editAudioNodeData: (data: Object, moduleIndex: number[]) => void;
}

const AudioModuleContainer = ({
  containerIndex,
  modules,
  addModule,
  deleteAudioModuleAndNode,
  setModuleType,
  editAudioNodeData,
}: Props) => {
  //   console.log(modules);

  const AudioModuleContainerStyle: CSS.Properties = {
    margin: "1%",
    display: "flex",
    justifyContent: "left",
    width: "98%",
    height: "200px",
    // backgroundColor: "#3d8bf2",
    opacity: "75%",
  };

  const generateAudioModulesFragment = (): JSX.Element => {
    let audioModulesFragment: JSX.Element;

    audioModulesFragment = (
      <>
        {modules.map((AudioNodeData, idx) => {
          return generateModuleFromData(AudioNodeData, idx, containerIndex);
        })}
      </>
    );

    return audioModulesFragment;
  };

  const generateModuleFromData = (
    data: Object,
    idx: number,
    containerIdx: number
  ): JSX.Element => {
    // any type to assert data will have type
    switch (data.type) {
      case "Blank":
        return (
          <BlankAudioModule addModule={addModule} key={idx}></BlankAudioModule>
        );
      case "New":
        return (
          <NewAudioModule
            position={[containerIdx, idx]}
            setModuleType={setModuleType}
            key={idx}
          ></NewAudioModule>
        );
      case "Highpass":
        return (
          <HighPassModule
            data={data}
            position={[containerIdx, idx]}
            editAudioNodeData={editAudioNodeData}
            key={idx}
          ></HighPassModule>
        );
      case "Lowpass":
        return (
          <LowPassModule
            data={data}
            position={[containerIdx, idx]}
            editAudioNodeData={editAudioNodeData}
            deleteAudioModuleAndNode={deleteAudioModuleAndNode}
            key={idx}
          ></LowPassModule>
        );
      case "Reverb":
        return (
          <ReverbModule
            data={data}
            position={[containerIdx, idx]}
            editAudioNodeData={editAudioNodeData}
            key={idx}
          ></ReverbModule>
        );
      default:
        console.log("Unsupported module added!");
    }

    return <></>;
  };

  return (
    <>
      <div style={AudioModuleContainerStyle}>
        {generateAudioModulesFragment()}
        {/* <BlankAudioModule></BlankAudioModule> */}
      </div>
    </>
  );
};

export default AudioModuleContainer;
