
export const clampStep = (step: number, totalSteps: number) =>
  Math.max(1, Math.min(step, totalSteps));

