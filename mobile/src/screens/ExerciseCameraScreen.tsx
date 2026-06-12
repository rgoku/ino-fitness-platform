import React, { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ExerciseCamera, { EngineState } from '../../../ino-engine/mobile/ExerciseCamera';

const ExerciseCameraScreen = ({ route, navigation }: any) => {
  const { exerciseName, setNumber } = route.params || {};
  const { user } = useAuth();

  const handleEndSet = useCallback(() => {
    // Could log set data or navigate to rest timer
  }, []);

  const handleFinish = useCallback(
    (summary: EngineState) => {
      navigation.goBack();
    },
    [navigation],
  );

  return (
    <ExerciseCamera
      exerciseName={exerciseName ?? 'Barbell Curl'}
      setNumber={setNumber ?? 1}
      userId={user?.id ?? 'default'}
      onEndSet={handleEndSet}
      onFinish={handleFinish}
    />
  );
};

export default ExerciseCameraScreen;
