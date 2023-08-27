import { createContext, useReducer, ReactNode } from "react";

export const AuthContext = createContext(Object());

let authContextReducer = (state: any, action: any) => {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
      };
    case "LOGOUT":
      return {
        user: undefined,
      };
    default:
      return state;
  }
};

interface Props {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(authContextReducer, { user: undefined });

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
