export const isDeadlinePassed = (deadline: Date): boolean => {
  return new Date() > new Date(deadline);
};