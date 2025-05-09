import { Welcome } from '../components/Welcome/Welcome';
import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <>
          <Welcome title="Landing Page" description='This is where we will display what Project
          is about, with some images, etc.' />
          <br />
          <center><Button variant="outline" component={Link} to="/login">Login here</Button></center>
    </>
  );
}