import { useState, useContext, createContext } from "react";
export const SettingsContext = createContext();
export const SetSettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settingData, setSettingData] = useState({
        category:false,
        filter: false,
        inputmode: false
      });
    return (
        <SettingsContext.Provider value={settingData}>
            <SetSettingsContext.Provider value={setSettingData}>
            {children}
            </SetSettingsContext.Provider>
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
export const useSetSettings = () => useContext(SetSettingsContext);