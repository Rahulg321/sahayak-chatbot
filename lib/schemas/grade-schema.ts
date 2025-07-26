import z from "zod";

export const addGradeSchema = z.object({
  title: z.string().min(2).max(50),
    description: z.string().min(2).max(50),

})


export type addGradeSchemaType = z.infer<typeof addGradeSchema>;

