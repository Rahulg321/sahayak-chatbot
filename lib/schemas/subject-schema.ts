import z from "zod";

export const addSubjectSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(50),
});

export type addSubjectSchemaType = z.infer<typeof addSubjectSchema>;
