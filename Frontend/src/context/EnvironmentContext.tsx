import { createContext, useReducer, ReactNode } from "react";

const backendURL = "http://localhost:8005";

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
