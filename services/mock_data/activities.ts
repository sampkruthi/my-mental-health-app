// src/services/mock_data/activity.ts
import BoxBreathingIcon from "../../src/images/breathing.png";
import DiaphragmIcon from "../../src/images/diaphragm.png";
import BodyScanIcon from "../../src/images/bodyscan.png";
import StretchIcon from "../../src/images/stretching.png";
import MusicIcon from "../../src/images/music.png";
import { ImageSourcePropType } from "react-native";

import { delay } from "../../src/extra/delay";

export type GuidedActivity = {
  id: string;
  title: string;
  type: string;
  description: string;
  thumbnail?: ImageSourcePropType;
  steps?: string[];
};

const activities: GuidedActivity[] = [
  {
    id: "1",
    title: "5-Minute Box Breathing",
    type: "breathing",
    description: "A simple technique to calm your mind and body.",
    thumbnail: BoxBreathingIcon,
    steps: [
      "Sit comfortably and close your eyes.",
      "Inhale for 4 seconds.",
      "Hold your breath for 4 seconds.",
      "Exhale for 4 seconds.",
      "Repeat the cycle for 5 minutes.",
    ],
  },
  {
    id: "2",
    title: "Mindful Walking",
    type: "mindfulness",
    description: "A mindful walking exercise for mental clarity.",
    thumbnail: DiaphragmIcon,
    steps: [
      "Find a quiet space where you can walk slowly.",
      "Begin walking at a natural pace.",
      "Focus on the sensation of your feet touching the ground.",
      "Notice surroundings: sounds, smells, sights.",
      "If mind wanders, gently return focus to walking.",
      "Continue for 10-15 minutes.",
      "End with three deep breaths.",
    ],
  },
  {
    id: "3",
    title: "Progressive Muscle Relaxation",
    type: "grounding",
    description: "Release tension by systematically relaxing muscle groups.",
    thumbnail: BodyScanIcon,
    steps: [
      "Lie down or sit comfortably.",
      "Start with your toes – tense for 5 seconds, then release.",
      "Move to calves, thighs, arms, shoulders, and face.",
      "Finally, tense the whole body for 5 seconds and release.",
      "Notice the feeling of complete relaxation.",
    ],
  },
  {
    id: "4",
    title: "Stress Busting Stretch",
    type: "stretching",
    description: "Relieve stress with simple stretches.",
    thumbnail: StretchIcon,
    steps: [
      "Stand with feet shoulder-width apart.",
      "Stretch arms overhead and hold for 10 seconds.",
      "Bend sideways to the left and right.",
      "Roll shoulders slowly backward and forward.",
      "Repeat twice.",
    ],
  },
  {
    id: "5",
    title: "Listen to Calm Music",
    type: "music",
    description: "Relax your mind with soft tunes.",
    thumbnail: MusicIcon,
    steps: ["Play the track and focus on the rhythm."],
  },
];

// Dummy logs (optional)
const activityLogs: { id: string; completedAt: string }[] = [];

export const activityApi = {
  async getActivities(): Promise<GuidedActivity[]> {
    console.log("[mockApi] fetching activities");
    await delay(300);
    return activities;
  },

  async logActivity(id: string): Promise<{ id: string; completedAt: string }> {
    console.log("[mockApi] logging completion for activity:", id);
    await delay(200);

    const log = { id, completedAt: new Date().toISOString() };
    activityLogs.push(log);
    return log;
  },
};
