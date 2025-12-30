import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Select from "../components/Select";
import RefreshSVG from "../svg/RefreshSVG";
import { Exercise } from "../types";

interface DataRequest {
  exercise_id: string;
  distance: number;
  rpe: number;
  shoes: string;
  notes: string;
}

const defaultData = {
  exercise_id: "",
  distance: 0,
  rpe: 0,
  shoes: "",
  notes: "",
};

const BASE_URL = "https://1ctbza9x84.execute-api.eu-north-1.amazonaws.com/prod";

export default function HomeScreen() {
  const [formData, setFormData] = useState<DataRequest>(defaultData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showDistance, setShowDistance] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadExercises = async (isMounted: boolean) => {
    try {
      setIsLoading(true);
      const res = await fetchExercises();

      if (isMounted) {
        setExercises([...res].reverse());
      }
    } catch (err) {
      setError("Error fetching exercises: " + err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    loadExercises(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      if (validate()) {
        await sendFormData(formData);
        setFormData(defaultData);
        setSuccess("Entry created!");
      }
    } catch (err: any) {
      setError("Error: " + err);
      Keyboard.dismiss();
    }
    Keyboard.dismiss();
    setIsLoading(false);
  };

  const validate = () => {
    if (
      showDistance &&
      (!formData.distance || isNaN(Number(formData.distance)))
    ) {
      setError("Distance must be a number");
      return false;
    }

    if (!formData.rpe || isNaN(Number(formData.rpe))) {
      setError("RPE must be a number");
      return false;
    }

    if (!formData.shoes.trim()) {
      setError("Shoes is required");
      return false;
    }

    if (!formData.notes.trim()) {
      setError("Notes is required");
      return false;
    }
    setError("");
    return true;
  };
  console.log(showDistance);
  return (
    <>
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <View style={styles.wrapper}>
            <View style={[styles.field, { position: "absolute", top: 0 }]}>
              <Text>Version 1.0</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Exercise</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Select
                    value={formData.exercise_id}
                    exercises={exercises}
                    onChange={(exercise: Exercise) => {
                      setFormData({ ...formData, exercise_id: exercise.id });
                      console.log(exercise.detailed_sport_info);
                      setShowDistance(
                        exercise.detailed_sport_info === "TREADMILL_RUNNING"
                      );
                    }}
                    styles={styles}
                  />
                  <Pressable
                    onPress={() => loadExercises(false)}
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
                </View>
              </View>
              {showDistance && (
                <View style={styles.field}>
                  <Text style={styles.label}>Distance</Text>
                  <TextInput
                    returnKeyType="done"
                    keyboardType="numeric"
                    onChangeText={(value) =>
                      setFormData({
                        ...formData,
                        distance: Number(value),
                      })
                    }
                    style={[styles.input, { width: 75 }]}
                  />
                </View>
              )}
              <View style={styles.field}>
                <Text style={styles.label}>RPE</Text>
                <TextInput
                  returnKeyType="done"
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    setFormData({
                      ...formData,
                      rpe: Number(value),
                    })
                  }
                  style={[styles.input, { width: 75 }]}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Shoes</Text>
                <TextInput
                  returnKeyType="done"
                  autoCapitalize="none"
                  onChangeText={(value) =>
                    setFormData({
                      ...formData,
                      shoes: value,
                    })
                  }
                  style={[styles.input, { width: 100 }]}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                  onChangeText={(value) =>
                    setFormData({
                      ...formData,
                      notes: value,
                    })
                  }
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <View style={{ paddingTop: 10 }}>
                  {error && <Text>{error}</Text>}
                  {success && <Text>{success}</Text>}
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </>
  );
}

const fetchExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await fetch(`${BASE_URL}/exercises`, {
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

const sendFormData = async (formData: DataRequest) => {
  try {
    const response = await fetch(`${BASE_URL}/entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
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
    alignItems: "center",
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  form: {
    gap: 16,
  },

  field: {
    gap: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },

  textArea: {
    width: 300,
    height: 100,
  },

  buttonContainer: {
    paddingTop: 10,
    alignItems: "center",
  },

  button: {
    backgroundColor: "#68bd88ff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
