import React, { useState, memo } from 'react';
import {
  IconHelp,
  IconListDetails,
  IconHome2,
  IconLogout,
  IconBuildingWarehouse,
  IconMap2,
  IconSettings,
  IconSun,
  IconMoon,
  IconMilitaryAward,
  IconBuildingAirport
} from '@tabler/icons-react';
// https://tabler.io/icons
import {
  Center,
  Stack,
  Tooltip,
  UnstyledButton,
  Burger,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core';
import FallenLogo from '@/assets/FallenLogo';
import classes from './NavbarMinimal.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthProvider';
import axios from 'axios';
import { useNavbar } from '../../NavbarContext';

const MemoizedLogo = memo(FallenLogo);

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [ // MAX OF 8 LINKS, OR IT WILL BREAK THE LAYOUT ON SOME DEVICE SIZES
  { icon: IconBuildingAirport, label: 'Command Center', url: "/" },
  { icon: IconListDetails, label: 'Mission Board', url: "/missions" },
  { icon: IconMap2, label: 'Live Map', url: "/map" },
  { icon: IconBuildingWarehouse, label: 'Resources', url: "/resources" }, 
  { icon: IconHelp, label: 'Help', url: "/help" },
  //{ icon: IconCircleDashed, label: 'Placeholder', url: "/" }, // Place holder for future features
  //{ icon: IconCircleDashed, label: 'Placeholder', url: "/" }, // Place holder for future features
];

export function NavbarMinimal() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { active, setActive } = useNavbar();
  const [open, setOpen] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  const labelText = computedColorScheme === 'light' ? 'Dark mode' : 'Light mode';

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      setToken(null); // Clear the token in memory
      navigate('/landing'); // Redirect to landing page
    } catch (err: any) {
      console.error('Logout error:', err.response?.data || err.message);
    } finally {
      setToken(null);
    }
  };  

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => {
        setActive(index);
        navigate(link.url);
      }}
    />
  ));

  return (
    <div className={classes.navbarContainer}>
      <div className={classes.burgerContainer}>
        <Burger
          opened={open}
          onClick={() => setOpen((prev) => !prev)}
          title="Toggle navigation"
          size="sm"
        />
      </div>

      <nav className={`${classes.navbar} ${open ? classes.open : ''}`} style={{ height: '100vh' }}>
        <div className={classes.buffer}></div>
        <Center>
          <MemoizedLogo size={50} />
        </Center>

        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>

        <Stack justify="center" gap={0}>

            <NavbarLink
            icon={computedColorScheme === 'light' ? IconMoon : IconSun}
            label={labelText}
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            />
          <NavbarLink
            key={'Settings'}
            icon={IconSettings}
            label={'Settings'}
            onClick={() => {
              setActive(5);
              navigate('/settings');

            }}
          />
          <NavbarLink onClick={handleLogout} icon={IconLogout} label="Logout" />
        </Stack>
      </nav>
    </div>
  );
}