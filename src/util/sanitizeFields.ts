export const sanitizeInput = (value: string): string => {
  if (!value) return "";
  return value.trim();
};
