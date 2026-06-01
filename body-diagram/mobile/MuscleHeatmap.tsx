import React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
  BODY,
  MOBILE_DARK,
  getColor,
  type MuscleSlug,
  type BodyView,
  type MuscleVolume,
} from '../core';

interface Props {
  volumes: MuscleVolume;
  view?: BodyView;
  selected?: MuscleSlug | null;
  onSelectMuscle?: (slug: MuscleSlug) => void;
  width?: number;
  height?: number;
}

export default function MuscleHeatmap({
  volumes,
  view = 'front',
  selected = null,
  onSelectMuscle,
  width = 240,
  height = 480,
}: Props) {
  const theme = MOBILE_DARK;
  const side = BODY[view];

  return (
    <Svg viewBox={side.viewBox} width={width} height={height}>
      <Path d={side.outline} fill={theme.bodyFill} stroke={theme.outline} strokeWidth={3} />
      {side.muscles.map((m) => {
        const fill = getColor(volumes[m.slug as MuscleSlug] ?? 0, theme);
        const isSel = m.slug === selected;
        return m.paths.map((d, i) => (
          <Path
            key={`${m.slug}-${i}`}
            d={d}
            fill={fill}
            stroke={isSel ? theme.selectedStroke : theme.separator}
            strokeWidth={isSel ? 5 : 1.4}
            onPress={() => onSelectMuscle?.(m.slug as MuscleSlug)}
          />
        ));
      })}
    </Svg>
  );
}
