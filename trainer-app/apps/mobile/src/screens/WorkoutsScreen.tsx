import { Box, Text } from '@shopify/restyle';
import { ScrollView } from 'react-native';
import type { Theme } from '../theme';

export default function WorkoutsScreen() {
  return (
    <Box flex={1} backgroundColor="background" paddingTop="l">
      <Box paddingHorizontal="m">
        <Text variant="h1" color="textPrimary">
          Today
        </Text>
        <Text variant="body" color="textSecondary" marginTop="s">
          Lower Body A • Week 4
        </Text>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {[
          'Squat',
          'Romanian Deadlift',
          'Hip Thrust',
          'Leg Press',
          'Walking Lunge',
        ].map((ex, i) => (
          <Box
            key={i}
            backgroundColor="surface"
            marginHorizontal="m"
            marginTop="m"
            padding="l"
            borderRadius="l"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Box>
              <Text variant="h3" color="textPrimary">
                {ex}
              </Text>
              <Text variant="caption" color="textSecondary" marginTop="s">
                Last: 3×8 @ 185 lb
              </Text>
            </Box>
            <Box
              backgroundColor="goldSoft"
              paddingHorizontal="m"
              paddingVertical="s"
              borderRadius={99}
            >
              <Text
                color="gold"
                fontFamily="CabinetGrotesk-Bold"
              >
                PR →
              </Text>
            </Box>
          </Box>
        ))}

        {/* Start button */}
        <Box marginHorizontal="m" marginTop="xl">
          <Box
            backgroundColor="primary"
            paddingVertical="l"
            borderRadius={99}
            alignItems="center"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 16,
            }}
          >
            <Text
              color="white"
              fontFamily="CabinetGrotesk-Bold"
              fontSize={18}
            >
              Start Workout
            </Text>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
