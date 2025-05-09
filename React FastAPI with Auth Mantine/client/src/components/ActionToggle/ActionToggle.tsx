import { IconMoon, IconSun } from '@tabler/icons-react';
import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme, Tooltip } from '@mantine/core';

export function ActionToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  const labelText = computedColorScheme === 'light' ? 'Dark mode' : 'Light mode';

  return (
    <Group justify="center">
      <Tooltip label={labelText} openDelay={300} position="bottom">
        <ActionIcon
          onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
          variant="default"
          size="xl"
          aria-label="Toggle color scheme"
        >
          {computedColorScheme === 'light' ? (
            <IconMoon stroke={1.5} />
          ) : (
            <IconSun stroke={1.5} />
          )}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
