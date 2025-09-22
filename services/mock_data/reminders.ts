export type Reminder = {
  id: string;
  type: string;
  hour: number;
  minute: number;
  message?: string;
  enabled: boolean;
};

export type NewReminder = Omit<Reminder, "id">;

// Dummy reminders
export const dummyReminders: Reminder[] = [
  { id: "456", type: "meditation", hour: 9, minute: 0, message: "Time for your morning meditation", enabled: true },
  { id: "457", type: "journaling", hour: 20, minute: 30, message: "Evening reflection time", enabled: true },
  { id: "458", type: "hydration", hour: 14, minute: 0, message: "Remember to drink water!", enabled: true },
];

// Simulate delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const reminderApi = {
  getReminders: async (): Promise<Reminder[]> => {
    await delay(300);
    return dummyReminders;
  },
  addReminder: async (newReminder: NewReminder): Promise<Reminder> => {
    await delay(300);
    const reminder: Reminder = { id: `${Math.floor(Math.random() * 10000)}`, ...newReminder };
    dummyReminders.push(reminder);
    return reminder;
  },
  toggleReminder: async (id: string): Promise<Reminder> => {
    await delay(200);
    const r = dummyReminders.find(rem => rem.id === id);
    if (!r) throw new Error("Reminder not found");
    r.enabled = !r.enabled;
    return r;
  },
  deleteReminder: async (id: string): Promise<void> => {
    await delay(200);
    const index = dummyReminders.findIndex(rem => rem.id === id);
    if (index === -1) throw new Error("Reminder not found");
    dummyReminders.splice(index, 1);
  },
};
