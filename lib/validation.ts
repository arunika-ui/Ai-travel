import { z } from "zod";

export const tripInputSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(2, "Destination must be at least 2 characters")
      .max(100, "Destination must be under 100 characters"),
    startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Start date is invalid",
    }),
    endDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "End date is invalid",
    }),
    travelers: z
      .number({ invalid_type_error: "Travelers must be a number" })
      .int("Travelers must be a whole number")
      .min(1, "At least 1 traveler is required")
      .max(10, "Maximum 10 travelers allowed"),
    budgetINR: z
      .number({ invalid_type_error: "Budget must be a number" })
      .min(1000, "Budget must be at least ₹1,000")
      .max(500000, "Budget cannot exceed ₹5,00,000"),
    interests: z
      .array(z.string())
      .min(1, "Select at least one interest"),
    pace: z.enum(["relaxed", "moderate", "packed"], {
      errorMap: () => ({ message: "Pace must be relaxed, moderate, or packed" }),
    }),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after start date",
        path: ["endDate"],
      });
      return;
    }
    const days =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days < 1 || days > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Trip length must be between 1 and 30 days",
        path: ["endDate"],
      });
    }
  });

export type TripInputParsed = z.infer<typeof tripInputSchema>;

export function tripLengthDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}
