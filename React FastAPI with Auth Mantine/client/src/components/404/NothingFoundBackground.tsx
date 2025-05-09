import { Button, Container, Group, Text, Title } from '@mantine/core';
import { Illustration } from './Illustration';
import classes from './NothingFoundBackground.module.css';
import { Link } from 'react-router-dom';

export function NothingFoundBackground() {
  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Illustration className={classes.image} />
        <div className={classes.content}>
          <Title className={classes.title}>You have found a secret place.</Title>
          <Text c="dimmed" size="lg" ta="center" className={classes.description}>
            Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has been moved to another URL.
          </Text>
          <Group justify="center">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button size="md">Take me back to home page</Button>
            </Link>
          </Group>
        </div>
      </div>
    </Container>
  );
}