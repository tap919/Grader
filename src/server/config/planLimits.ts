export const PLAN_LIMITS = {
  free: {
    scansPerMonth: 3,
    apiCallsPerHour: 0,
    teamMembers: 1,
  },
  starter: {
    scansPerMonth: 30,
    apiCallsPerHour: 60,
    teamMembers: 3,
  },
  professional: {
    scansPerMonth: 150,
    apiCallsPerHour: 300,
    teamMembers: 10,
  },
  enterprise: {
    scansPerMonth: Infinity,
    apiCallsPerHour: Infinity,
    teamMembers: Infinity,
  },
} as const;
