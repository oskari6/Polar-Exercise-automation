import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ExercisesProvider } from "./src/context/ExerciseContext";
import HistoryScreen from "./src/screens/HistoryScreen";
import HomeScreen from "./src/screens/HomeScreen";

export type RootStackParamList = {
  HomeScreen: undefined;
  HistoryScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ExercisesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen
            options={{
              headerBackVisible: false,
            }}
            name="HomeScreen"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerBackVisible: false,
            }}
            name="HistoryScreen"
            component={HistoryScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ExercisesProvider>
  );
}
