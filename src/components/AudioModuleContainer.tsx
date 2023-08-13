import React from "react";
import BlankAudioModule from "./BlankAudioModule";
import NewAudioModule from "./NewAudioModule";
import CSS from "csstype";

interface Props {
  containerIndex: number;
  modules: Object[]; // pass in data required to reconstruct module interfaces
  addModule: () => void;
  setModuleType: (type: string, index: number[]) => void;
}

const AudioModuleContainer = ({
  containerIndex,
  modules,
  addModule,
  setModuleType,
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
    data: any,
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
            moduleIndex={[containerIdx, idx]}
            setModuleType={setModuleType}
            key={idx}
          ></NewAudioModule>
        );
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
