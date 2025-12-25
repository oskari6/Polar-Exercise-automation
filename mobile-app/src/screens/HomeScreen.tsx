import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

  useEffect(() => {
    let isMounted = true;

    const loadExercises = async () => {
      try {
        const res = await fetchExercises();

        if (isMounted) {
          setExercises(res);
        }
      } catch (err) {
        setError("Error fetching exercises: " + err);
      }
    };

    loadExercises();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async () => {
    try {
      if (validate()) {
        const response = await sendFormData(formData);
        console.log(response);
        setFormData(defaultData);
        setSuccess("Entry created!");
      }
    } catch (err: any) {
      setError("Error: " + err);
      Keyboard.dismiss();
    }
    Keyboard.dismiss();
  };

  const validate = () => {
    if (!formData.distance || isNaN(Number(formData.distance))) {
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

  const formatStartTime = (iso: string) => {
    const d = new Date(iso);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}/${month} ${hours}:${minutes}`;
  };

  const formatDuration = (iso: string) => {
    const match = iso.match(/PT(\d+)S/);
    let seconds = match ? Number(match[1]) : 0;

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
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
              <Picker
                style={{ padding: 5, borderColor: "#ccc", borderRadius: 5 }}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    exercise_id: value,
                  })
                }
              >
                <Picker.Item label="Select exercise" value={null} />
                {exercises.map((exercise, i) => (
                  <Picker.Item
                    key={i + 1}
                    label={`${formatDuration(
                      exercise.duration
                    )} - ${formatStartTime(exercise.start_time)}`}
                    value={exercise.id}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Distance</Text>
              <TextInput
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
            <View style={styles.field}>
              <Text style={styles.label}>RPE</Text>
              <TextInput
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
    </Pressable>
  );
}

const fetchExercises = async () => {
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
  wrapper: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  form: {
    gap: 16,
  },

  field: {
    alignItems: "center",
    gap: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
    backgroundColor: "#83ffb2ff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: 100,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
