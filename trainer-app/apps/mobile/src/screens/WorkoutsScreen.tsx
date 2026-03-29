import { Box, Text } from '@shopify/restyle';
import { ScrollView, View, Pressable } from 'react-native';

const exercises = [
  { name: 'Barbell Squat', sets: 4, reps: '6-8', last: '185 lb', pr: true },
  { name: 'Romanian Deadlift', sets: 3, reps: '8-10', last: '155 lb', pr: false },
  { name: 'Hip Thrust', sets: 3, reps: '10-12', last: '225 lb', pr: false },
  { name: 'Leg Press', sets: 3, reps: '10-12', last: '360 lb', pr: true },
  { name: 'Walking Lunge', sets: 3, reps: '12/leg', last: 'BW', pr: false },
];

export default function WorkoutsScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box paddingHorizontal="l" paddingTop="xl" paddingBottom="s">
        <Text variant="caption">WEEK 4 • DAY 2</Text>
        <Text variant="h1" marginTop="xs">
          Lower Body A
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <Text variant="bodySm" color="textTertiary">
            {exercises.length} exercises
          </Text>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A0A0AB' }} />
          <Text variant="bodySm" color="textTertiary">
            ~50 min
          </Text>
        </View>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Exercise Cards */}
        <Box paddingHorizontal="l" paddingTop="m">
          {exercises.map((ex, i) => (
            <Pressable key={i}>
              <Box
                backgroundColor="surface"
                marginBottom="s"
                padding="m"
                borderRadius="l"
                borderWidth={1}
                borderColor="borderLight"
                flexDirection="row"
                alignItems="center"
              >
                {/* Number */}
                <Box
                  width={36}
                  height={36}
                  borderRadius="m"
                  backgroundColor="surfaceTertiary"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="m"
                >
                  <Text variant="subMd" color="textSecondary" style={{ fontVariant: ['tabular-nums'] }}>
                    {i + 1}
                  </Text>
                </Box>

                {/* Info */}
                <Box flex={1}>
                  <Text variant="subMd">{ex.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text variant="caption">
                      {ex.sets} x {ex.reps}
                    </Text>
                    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#A0A0AB' }} />
                    <Text variant="caption">
                      Last: {ex.last}
                    </Text>
                  </View>
                </Box>

                {/* PR Badge */}
                {ex.pr && (
                  <Box
                    backgroundColor="warningLight"
                    paddingHorizontal="s"
                    paddingVertical="xs"
                    borderRadius="s"
                  >
                    <Text variant="caption" color="warning" style={{ fontWeight: '600' }}>
                      PR
                    </Text>
                  </Box>
                )}
              </Box>
            </Pressable>
          ))}
        </Box>

        {/* Demo Preview Section */}
        <Box paddingHorizontal="l" marginTop="m" marginBottom="l">
          <Box
            backgroundColor="surfaceTertiary"
            borderRadius="l"
            padding="l"
            alignItems="center"
          >
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: '#E4E4E7', alignItems: 'center', justifyContent: 'center',
              marginBottom: 8,
            }}>
              <Text style={{ fontSize: 20 }}>▶</Text>
            </View>
            <Text variant="subSm" color="textSecondary">
              Video demos available during session
            </Text>
          </Box>
        </Box>
      </ScrollView>

      {/* Floating Start Button */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="l"
        paddingBottom="xl"
        paddingTop="m"
      >
        <Box
          style={{
            position: 'absolute', top: -20, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(250,250,250,0.9)',
          }}
        />
        <Pressable>
          <Box
            backgroundColor="primary"
            paddingVertical="m"
            borderRadius="l"
            alignItems="center"
            style={{
              shadowColor: '#10B981',
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
          >
            <Text variant="subLg" color="white" style={{ fontWeight: '600' }}>
              Start Session
            </Text>
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
}
