import {
  getBudgetItems,
  getChecklistItems,
  getPrepProfile,
  summarizeBudget,
  summarizeChecklist,
} from '../_shared/prep';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response';
import type { Env } from '../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

  const profile = await getPrepProfile(env.DB);
  if (!profile) return errorResponse('Prep profile not found', 404);

  const [budgetItems, checklistItems] = await Promise.all([
    getBudgetItems(env.DB),
    getChecklistItems(env.DB),
  ]);

  return jsonResponse({
    profile,
    budget: summarizeBudget(budgetItems),
    checklist: summarizeChecklist(checklistItems),
  });
};
