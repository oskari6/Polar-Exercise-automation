import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Exercise } from "../types";

type Props = {
  value: string;
  exercises?: Exercise[];
  savedExerciseIds?: string[];
  onChange?: (exercise: Exercise) => void;
  styles: any;
};

export const formatStartTime = (iso: string) => {
  const d = new Date(iso);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month} ${hours}:${minutes}`;
};

export const formatDuration = (iso: string) => {
  const match = iso.match(/PT([\d.]+)S/);
  if (!match) return "00:00";

  const totalSeconds = Math.floor(Number(match[1]));

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
};

export const formatWeekday = (iso: string) => {
  const d = new Date(iso);

  return d.toLocaleDateString("en-US", {
    weekday: "long",
  });
};
export default function Select({
  value,
  exercises,
  savedExerciseIds,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = exercises?.find((e) => e.id === value);

  return (
    <>
      <Pressable style={styles.select} onPress={() => setOpen(true)}>
        <Text style={{ color: value ? "#000" : "#999" }}>
          {selected
            ? `${formatDuration(selected.duration)} – ${formatStartTime(
                selected.start_time,
              )}`
            : exercises
              ? "Select exercise"
              : "Show saved"}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select exercise</Text>
            <ScrollView style={{ borderRadius: 5, width: 200 }}>
              {exercises &&
                exercises.map((exercise) => (
                  <Pressable
                    key={exercise.id}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: savedExerciseIds?.includes(exercise.id)
                          ? "#76de9c"
                          : exercise.detailed_sport_info === "TREADMILL_RUNNING"
                            ? "#fca5a5"
                            : "#93c5fd",
                      },
                    ]}
                    onPress={() => {
                      if (savedExerciseIds?.includes(exercise.id)) {
                        return;
                      }
                      onChange && onChange(exercise);
                      setOpen(false);
                    }}
                  >
                    <Text>
                      {formatDuration(exercise.duration)} –{" "}
                      {formatStartTime(exercise.start_time)}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  select: {
    width: 180,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    alignItems: "center",
  },

  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  cancel: {
    backgroundColor: "#db4e4eff",
    padding: 10,
    borderRadius: 10,
    color: "white",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
