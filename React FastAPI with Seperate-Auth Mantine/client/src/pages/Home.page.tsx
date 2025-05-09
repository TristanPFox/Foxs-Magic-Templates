import { Welcome } from '../components/Welcome/Welcome';
import { NavbarMinimal } from '@/components/NavbarMinimal/NavbarMinimal';
import classes from './GlobalStyles.module.css';

export function HomePage() {
  return (
    <div className={classes.container}>
      <NavbarMinimal />
      <div className={classes.workZone}>
        <div className={classes.centeredContent}>
          <Welcome title="Home Page" description="This is where we will display the main content of the app." />
        </div>
      </div>
    </div>
  );
}
