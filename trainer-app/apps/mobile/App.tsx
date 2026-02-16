import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider } from '@shopify/restyle';
import { ImageBackground, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const grainUri = 'https://i.imgur.com/0Kxh8Rp.png';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <ImageBackground
        source={{ uri: grainUri }}
        imageStyle={{ opacity: 0.06 }}
        style={{ flex: 1 }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: {
                backgroundColor: '#FAF9F7',
                borderTopWidth: 0,
                elevation: 0,
                height: 84,
                paddingBottom: 30,
                paddingTop: 12,
              },
              tabBarLabelStyle: {
                fontFamily: 'Satoshi-Medium',
                fontSize: 12,
              },
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{ tabBarIcon: () => '🏠' }}
            />
            <Tab.Screen
              name="Workouts"
              component={WorkoutsScreen}
              options={{ tabBarIcon: () => '💪' }}
            />
            <Tab.Screen
              name="Progress"
              component={ProgressScreen}
              options={{ tabBarIcon: () => '📈' }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ tabBarIcon: () => '👤' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ImageBackground>
    </ThemeProvider>
  );
}
