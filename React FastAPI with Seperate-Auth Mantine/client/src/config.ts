import { useMantineTheme, useComputedColorScheme, } from '@mantine/core';

export function useAccentColors(page?: string) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const AccentColor1 = computedColorScheme === 'dark'
    ? theme.colors.yellow[6]
    : theme.colors.indigo[9];
  const AccentColor2 = computedColorScheme === 'dark'
    ? theme.colors.yellow[2]
    : theme.colors.indigo[6];
  return { AccentColor1, AccentColor2 };
}