import { createContext, useState } from "react";
export const SettingsContext = createContext(null);

export default function Context({ children }) {
  const [activeButton, setActiveButton] = useState("general");

  return (
    <SettingsContext.Provider value={{ activeButton, setActiveButton }}>
      {children}
    </SettingsContext.Provider>
  );
}
