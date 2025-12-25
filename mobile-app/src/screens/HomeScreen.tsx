import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Select from "../components/Select";
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
          setExercises([...res].reverse());
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

  return (
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
              <Select
                value={formData.exercise_id}
                exercises={exercises}
                onChange={(id) => setFormData({ ...formData, exercise_id: id })}
                styles={styles}
              />
            </View>
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
