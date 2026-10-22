import { z } from "zod";

export const tripInputSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(100),
    destination: z.string().min(1, "Choose a destination"),
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
    budget: z
      .number({ invalid_type_error: "Budget must be a number" })
      .min(1000, "Budget must be at least ₹1,000")
      .max(500000, "Budget cannot exceed ₹5,00,000"),
    interests: z.array(z.string()).min(1, "Select at least one interest"),
    pace: z.enum(["relaxed", "moderate", "packed"]),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date cannot be in the past",
        path: ["startDate"],
      });
    }
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after start date",
        path: ["endDate"],
      });
      return;
    }
    const days = tripLengthDays(data.startDate, data.endDate);
    if (days < 1 || days > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Trip length must be between 1 and 30 days",
        path: ["endDate"],
      });
    }
  });

export type TripInputParsed = z.infer<typeof tripInputSchema>;

/**
 * Same field-level rules as tripInputSchema, but without the "start date
 * cannot be in the past" check — an ongoing or completed trip legitimately
 * has a start date in the past, and FR-3.4 only asks that edits to
 * destination/dates stay valid, not that they be re-creatable from scratch.
 */
export const tripEditSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(100),
    destination: z.string().min(1, "Choose a destination"),
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
    budget: z
      .number({ invalid_type_error: "Budget must be a number" })
      .min(1000, "Budget must be at least ₹1,000")
      .max(500000, "Budget cannot exceed ₹5,00,000"),
    interests: z.array(z.string()).min(1, "Select at least one interest"),
    pace: z.enum(["relaxed", "moderate", "packed"]),
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
    const days = tripLengthDays(data.startDate, data.endDate);
    if (days < 1 || days > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Trip length must be between 1 and 30 days",
        path: ["endDate"],
      });
    }
  });

export function tripLengthDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export const expenseInputSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(1000000, "Amount cannot exceed ₹10,00,000"),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "AED", "THB"]),
  category: z.enum(["Hotel", "Food", "Transport", "Activities", "Shopping", "Other"]),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Date is invalid" }),
  note: z.string().max(200).optional().default(""),
});

export type ExpenseInputParsed = z.infer<typeof expenseInputSchema>;
