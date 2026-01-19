export interface Exercise {
  id: string;
  upload_time: string; // ISO datetime
  polar_user: string; // URL
  device: string;
  device_id: string;
  start_time: string; // ISO datetime
  start_time_utc_offset: number;
  duration: string; // ISO-8601 duration (e.g. PT2H44M)
  calories: number;
  distance: number;
  heart_rate: HeartRate;
  training_load: number;
  sport: string;
  has_route: boolean;
  club_id?: number;
  club_name?: string;
  detailed_sport_info?: string;
  fat_percentage?: number;
  carbohydrate_percentage?: number;
  protein_percentage?: number;
  "running-index"?: number;
  heart_rate_zones?: HeartRateZone[];
  samples?: Sample[];
  route?: RoutePoint[];
  training_load_pro?: TrainingLoadPro;
}

export interface SavedExercise {
  id: string;
  createdAt: string;
  exercise_id: string;
  distance: number;
  rpe: number;
  shoes: string;
  notes: string;
}

export interface HeartRate {
  average: number;
  maximum: number;
}

export interface HeartRateZone {
  index: number;
  "lower-limit": number;
  "upper-limit": number;
  "in-zone": string; // ISO-8601 duration
}

export interface Sample {
  "recording-rate": number;
  "sample-type": string;
  data: string; // comma-separated values
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  time: string; // ISO-8601 duration
  satellites: number;
  fix: number;
}

export interface TrainingLoadPro {
  date: string; // YYYY-MM-DD
  "cardio-load": number;
  "muscle-load": number;
  "perceived-load": number;
  "cardio-load-interpretation": string;
  "muscle-load-interpretation": string;
  "perceived-load-interpretation": string;
  "user-rpe": string;
}
