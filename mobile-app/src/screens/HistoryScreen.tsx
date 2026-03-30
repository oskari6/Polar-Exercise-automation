import { RootStackParamList } from "@/App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatStartTime, formatWeekday } from "../components/Select";
import { useExercises } from "../context/ExerciseContext";
import RefreshSVG from "../svg/RefreshSVG";
import { SavedExercise } from "../types";

const BASE_URL = "https://1ctbza9x84.execute-api.eu-north-1.amazonaws.com/prod";

type Props = NativeStackScreenProps<RootStackParamList, "HistoryScreen">;

export default function HomeScreen({ navigation }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weekly, setWeekly] = useState<number>(0);
  const { savedExercises, setSavedExercises } = useExercises();

  const loadExercisesFromDB = async (isMounted: boolean) => {
    try {
      setIsLoading(true);
      const res = await fetchExercisesFromDB();
      let total = 0;
      res.forEach((item) => (total += Number(item.distance)));
      setWeekly(total);
      if (isMounted) {
        setSavedExercises(res);
      }
    } catch (err) {
      setError("Error fetching saved exercises: " + err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    loadExercisesFromDB(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedExercises = [...savedExercises]
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
    .reverse();

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("HomeScreen")}
            style={styles.button2}
          >
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
          <Pressable
            onPress={() => loadExercisesFromDB(false)}
            style={({ hovered }: any) => [
              {
                backgroundColor: hovered ? "#f5f5f5" : "#ffffff",
                padding: 5,
                borderRadius: 5,
              },
            ]}
          >
            <RefreshSVG />
          </Pressable>
          <View>
            <Text>Current: {weekly}km</Text>
          </View>
        </View>
        <View style={{ paddingTop: 5 }}>{error && <Text>{error}</Text>}</View>
        <View style={styles.field}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {sortedExercises.map((exercise) => (
              <View key={exercise.id} style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.weekday}>
                    {formatWeekday(exercise.startTime)}
                  </Text>
                  <Text style={styles.time}>
                    {formatStartTime(exercise.startTime)}
                  </Text>
                </View>

                {/* Meta row */}
                <View style={styles.metaRow}>
                  {exercise.distance !== null && (
                    <Text style={styles.meta}>🏃 {exercise.distance} km</Text>
                  )}
                  <Text style={styles.meta}>👟 {exercise.shoes}</Text>
                  <Text style={styles.rpe}>RPE {exercise.rpe}</Text>
                </View>

                {/* Notes */}
                {exercise.notes && (
                  <Text style={styles.notes}>{exercise.notes}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </>
  );
}

const fetchExercisesFromDB = async (): Promise<SavedExercise[]> => {
  try {
    const response = await fetch(`${BASE_URL}/db/exercises`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  } catch (err) {
    throw err;
  }
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 5,
    width: "100%",
  },
  field: {
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 10,
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  button2: {
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  weekday: {
    fontSize: 16,
    fontWeight: "600",
  },

  time: {
    fontSize: 14,
    color: "#666",
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 6,
  },

  meta: {
    fontSize: 14,
    color: "#333",
  },

  rpe: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c0392b",
  },

  notes: {
    marginTop: 6,
    fontSize: 14,
    color: "#444",
    lineHeight: 18,
  },
});
