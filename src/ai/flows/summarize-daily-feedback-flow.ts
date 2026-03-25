'use server';
/**
 * @fileOverview A Genkit flow for summarizing daily meal feedback.
 *
 * - summarizeDailyFeedback - A function that handles the summarization of daily feedback.
 * - SummarizeDailyFeedbackInput - The input type for the summarizeDailyFeedback function.
 * - SummarizeDailyFeedbackOutput - The return type for the summarizeDailyFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyFeedbackInputSchema = z.object({
  evaluations: z
    .array(z.number().min(1).max(5))
    .describe(
      'An array of daily meal evaluations, where each number represents a rating from 1 (very bad) to 5 (excellent).'
    ),
});
export type SummarizeDailyFeedbackInput = z.infer<
  typeof SummarizeDailyFeedbackInputSchema
>;

const SummarizeDailyFeedbackOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise natural language summary of the daily feedback, highlighting trends, strengths, and weaknesses.'
    ),
});
export type SummarizeDailyFeedbackOutput = z.infer<
  typeof SummarizeDailyFeedbackOutputSchema
>;

export async function summarizeDailyFeedback(
  input: SummarizeDailyFeedbackInput
): Promise<SummarizeDailyFeedbackOutput> {
  return summarizeDailyFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyFeedbackPrompt',
  input: {schema: SummarizeDailyFeedbackInputSchema},
  output: {schema: SummarizeDailyFeedbackOutputSchema},
  prompt: `Você é um assistente de IA para um gerente de cantina. Sua tarefa é analisar as avaliações diárias de refeições e fornecer um resumo conciso.

As avaliações variam de 1 (muito ruim) a 5 (excelente).
Identifique tendências gerais no feedback, apontando os pontos fortes e fracos comuns.
O resumo deve ser fácil de entender para a equipe da cantina.

Avaliações Diárias (1=muito ruim, 5=excelente): {{{evaluations}}}`,
});

const summarizeDailyFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeDailyFeedbackFlow',
    inputSchema: SummarizeDailyFeedbackInputSchema,
    outputSchema: SummarizeDailyFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
