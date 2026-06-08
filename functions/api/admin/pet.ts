import { requireAdmin } from '../../_shared/auth';
import { getPetProfile } from '../../_shared/db';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (request.method === 'GET') {
    const pet = await getPetProfile(env.DB);
    if (!pet) return errorResponse('Pet profile not found', 404);
    return jsonResponse(pet);
  }

  if (request.method === 'PUT') {
    let body: Record<string, string>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const pet = await getPetProfile(env.DB);
    if (!pet) return errorResponse('Pet profile not found', 404);

    await env.DB
      .prepare(
        `UPDATE pet_profile SET
          name = ?, avatar_url = ?, birthday = ?, home_date = ?,
          breed = ?, gender = ?, description = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
      )
      .bind(
        body.name ?? pet.name,
        body.avatar_url ?? pet.avatar_url,
        body.birthday ?? pet.birthday,
        body.home_date ?? pet.home_date,
        body.breed ?? pet.breed,
        body.gender ?? pet.gender,
        body.description ?? pet.description,
        pet.id,
      )
      .run();

    const updated = await getPetProfile(env.DB);
    return jsonResponse(updated);
  }

  return errorResponse('Method not allowed', 405);
};
