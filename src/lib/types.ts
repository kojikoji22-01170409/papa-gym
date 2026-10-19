export type DayKind = 'min' | 'goal' | 'rest';

export interface DayRecord {
  date: string;
  kind: DayKind;
  points: number;
}

export type Feel = 'easy' | 'normal' | 'hard';

export interface ExerciseLog {
  date: string;
  exerciseId: string;
  amount: number; // reps or seconds actually targeted
  easyVariant: boolean;
  feel: Feel;
}

export interface Child {
  id: string;
  name: string;
  birth: string; // YYYY-MM
  photo?: string; // data URL, stored on device only
}

export interface FitnessCheck {
  date: string;
  chairStands: number; // 30秒椅子立ち上がり (回)
  pushups: number; // 腕立て伏せ (回)
  plankSec: number;
  singleLegSec: number; // 片足立ち (秒, 上限120)
  forwardBendCm: number; // 立位体前屈 (cm, 床より下が+)
}

export interface FamilyReward {
  id: string;
  text: string;
  doneAt?: string;
}

export interface SelfReward {
  id: string;
  text: string;
}

export interface Profile {
  startDate: string;
  fatherBirth?: string; // YYYY-MM
  points: number;
  tickets: number;
  ticketMonth: string; // month the monthly tickets were last granted
  amounts: Record<string, number>; // user-adopted amount per exercise
  restSec?: number; // rest between goal-line exercises (0 = none, default 30)
}

export interface CardStock {
  count: number;
  used: number; // only meaningful for self-reward cards
}

export interface State {
  v: 1;
  profile: Profile;
  children: Child[];
  cheers: string[]; // user-added real cheer messages
  days: Record<string, DayRecord>;
  logs: ExerciseLog[];
  checks: FitnessCheck[];
  cards: Record<string, CardStock>;
  familyRewards: FamilyReward[];
  selfRewards: SelfReward[];
  missionDone: Record<string, boolean>; // date -> done
  quiz?: QuizStats;
}

export interface QuizStats {
  answered: number;
  correct: number;
  seen: Record<string, number>; // question id -> times shown
}
