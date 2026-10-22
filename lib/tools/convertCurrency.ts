import { z } from "zod";
import { AITool } from "@/lib/tools/types";
import { convertCurrency as convert } from "@/lib/mock-data/currency";
import { CurrencyCode } from "@/lib/trips/types";

const params = z.object({
  amount: z.number(),
  from: z.enum(["INR", "USD", "EUR", "GBP", "AED", "THB"]),
  to: z.enum(["INR", "USD", "EUR", "GBP", "AED", "THB"]),
});

export const convertCurrency: AITool<z.infer<typeof params>, { converted: number; rateUsed: number }> = {
  name: "convertCurrency",
  description: "Converts an amount between currencies using the fixed demo rate table.",
  params,
  execute: ({ amount, from, to }) => convert(amount, from as CurrencyCode, to as CurrencyCode),
};
