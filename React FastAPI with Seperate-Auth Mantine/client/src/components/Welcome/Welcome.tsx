import { Anchor, Text, Title } from '@mantine/core';
import classes from './Welcome.module.css';

interface WelcomeProps {
  title?: string;
  description?: string;
}

export function Welcome( { title = "Title", description = "Description..." }: WelcomeProps ) {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          { title }
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        { description }
      </Text>
    </>
  );
}
