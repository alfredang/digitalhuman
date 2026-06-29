// MiniMax preset system voices + supported languages, for the backend pickers.

export type Voice = { id: string; label: string; gender: "female" | "male" };

export const VOICES: Voice[] = [
  // Female
  { id: "female-tianmei", label: "Tianmei — sweet female", gender: "female" },
  { id: "female-shaonv", label: "Shaonv — young female", gender: "female" },
  { id: "female-yujie", label: "Yujie — mature female", gender: "female" },
  { id: "female-chengshu", label: "Chengshu — composed female", gender: "female" },
  { id: "presenter_female", label: "Presenter — female", gender: "female" },
  { id: "Wise_Woman", label: "Wise Woman (English)", gender: "female" },
  { id: "Calm_Woman", label: "Calm Woman (English)", gender: "female" },
  // Male
  { id: "male-qn-qingse", label: "Qingse — youthful male", gender: "male" },
  { id: "male-qn-jingying", label: "Jingying — elite male", gender: "male" },
  { id: "male-qn-badao", label: "Badao — assertive male", gender: "male" },
  { id: "presenter_male", label: "Presenter — male", gender: "male" },
  { id: "Deep_Voice_Man", label: "Deep Voice Man (English)", gender: "male" },
  { id: "Patient_Man", label: "Patient Man (English)", gender: "male" },
];

export const DEFAULT_VOICE_ID = "female-tianmei";

// MiniMax language_boost values (subset of the 40+ supported).
export const LANGUAGES: string[] = [
  "English",
  "Chinese",
  "Chinese,Yue",
  "Japanese",
  "Korean",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Arabic",
  "Russian",
  "Indonesian",
  "Thai",
  "Vietnamese",
  "Hindi",
  "Malay",
  "Tamil",
];

export function isValidVoice(id: string): boolean {
  return VOICES.some((v) => v.id === id);
}
