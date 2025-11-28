import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isLogined, setIsLogined] = useState(false);
  const [userName, setUserName] = useState("");

  return (
    <GlobalContext.Provider value={{ isLogined, setIsLogined, userName, setUserName}}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);
