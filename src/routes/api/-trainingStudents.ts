import { supabase } from '@/lib/supabase';
import type { RequestHandler } from '@sveltejs/kit';

// GET /api/training-students
export const GET: RequestHandler = async () => {
  const { data, error } = await supabase.from('training_students').select('*');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
};

// POST /api/training-students
export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.json();
  const { data, error } = await supabase.from('training_students').insert(payload);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 201 });
};

// GET /api/training-students/:id
export const GET_ID: RequestHandler = async ({ params }) => {
  const { id } = params;
  const { data, error } = await supabase.from('training_students').select('*').eq('id', id).single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });
  return new Response(JSON.stringify(data), { status: 200 });
};
