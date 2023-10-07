import { createContext, useReducer, ReactNode } from "react";

// const backendURL = "http://localhost:8005";
// const backendURL =
//   "https://prodlodge-backend-dot-prodlodge-183.uk.r.appspot.com"; // old backend URL
const backendURL = "https://www.prodlodge.com";

export const EnvironmentContext = createContext({
  backendURL: backendURL, // dev backend URL
});

const environmentContextReducer = (state: any, action: any) => {
  return state;
};

interface Props {
  children: ReactNode;
}

export const EnvironmentContextProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(environmentContextReducer, {
    backendURL: backendURL, // dev backend URL
  });

  return (
    <EnvironmentContext.Provider value={state}>
      {children}
    </EnvironmentContext.Provider>
  );
};
