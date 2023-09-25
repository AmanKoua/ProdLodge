import { createContext, useReducer, ReactNode } from "react";

export const AuthContext = createContext(Object());

let authContextReducer = (state: any, action: any) => {
  console.log("DISPATCHING!");

  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
      };
      break;
    case "LOGOUT":
      return {
        user: undefined,
      };
      break;
    default:
      return state;
      break;
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
