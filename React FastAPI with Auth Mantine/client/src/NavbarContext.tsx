import { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  active: number;
  setActive: (index: number) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(0);

  return (
    <NavbarContext.Provider value={{ active, setActive }}>
      {children}
    </NavbarContext.Provider>
  );
};
