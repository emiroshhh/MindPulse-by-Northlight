-- Local development only. Never run this seed against a production project.
-- Demo login: demo@mindpulse.local / MindPulseDemo!2026
do $$
declare
  demo_id uuid := '11111111-1111-4111-8111-111111111111';
begin
  if not exists (select 1 from auth.users where id = demo_id) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', demo_id,
      'authenticated', 'authenticated', 'demo@mindpulse.local',
      extensions.crypt('MindPulseDemo!2026', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}',
      '{"display_name":"Alex"}', now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_id, demo_id::text, jsonb_build_object('sub', demo_id::text, 'email', 'demo@mindpulse.local'), 'email', now(), now(), now());
  end if;

  update public.profiles set display_name = 'Alex', locale = 'en', onboarding_completed = true, goals = array['manage stress', 'understand moods'] where id = demo_id;

  if not exists (select 1 from public.mood_entries where user_id = demo_id) then
    insert into public.mood_entries (user_id, mood, intensity, tags, note, created_at) values
      (demo_id, 'okay', 3, array['school', 'sleep'], 'A full day, but I made it through.', now() - interval '6 days'),
      (demo_id, 'good', 4, array['friends'], 'Lunch with people I like helped.', now() - interval '4 days'),
      (demo_id, 'low', 2, array['school', 'energy'], null, now() - interval '2 days'),
      (demo_id, 'good', 4, array['alone time'], 'A quiet walk felt useful.', now() - interval '1 day');
    insert into public.journal_entries (user_id, title, body, prompt_id, created_at, updated_at)
      values (demo_id, 'A quieter afternoon', 'I put my phone down for ten minutes and the day felt less crowded.', 'what-felt-lighter', now() - interval '1 day', now() - interval '1 day');
    insert into public.exercise_completions (user_id, exercise_key, completed_at)
      values (demo_id, 'box-breathing', now() - interval '2 days');
  end if;
end $$;
