import { createContext, useReducer, ReactNode } from "react";

export const ProfileContext = createContext(Object());

let profileContextReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET":
      return {
        profile: action.payload,
      };
    case "DELETE":
      return {
        profile: undefined,
      };
    default:
      return state;
  }
};

interface Props {
  children: ReactNode;
}

export const ProfileContextProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(profileContextReducer, {
    userProfile: undefined,
  });

  return (
    <ProfileContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ProfileContext.Provider>
  );
};
