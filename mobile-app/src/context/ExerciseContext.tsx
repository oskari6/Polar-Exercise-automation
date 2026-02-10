import React, { createContext, useContext, useState } from "react";
import { Exercise, SavedExercise } from "../types";

type ExercisesContextType = {
  exercises: Exercise[];
  savedExercises: SavedExercise[];
  setExercises: (e: Exercise[]) => void;
  setSavedExercises: (e: SavedExercise[]) => void;
};

const ExercisesContext = createContext<ExercisesContextType | null>(null);

export const ExercisesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [savedExercises, setSavedExercises] = useState<SavedExercise[]>([]);

  return (
    <ExercisesContext.Provider
      value={{ exercises, savedExercises, setExercises, setSavedExercises }}
    >
      {children}
    </ExercisesContext.Provider>
  );
};

export const useExercises = () => {
  const ctx = useContext(ExercisesContext);
  if (!ctx) throw new Error("useExercises must be used inside provider");
  return ctx;
};
