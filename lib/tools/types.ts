import { z } from "zod";

export interface AITool<Params = any, Result = any> {
  name: string;
  description: string;
  params: z.ZodType<Params>;
  execute(params: Params): Result;
}
