import { getPetProfile } from '../_shared/db';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response';
import type { Env } from '../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

  const pet = await getPetProfile(env.DB);
  if (!pet) return errorResponse('Pet profile not found', 404);

  return jsonResponse(pet);
};
