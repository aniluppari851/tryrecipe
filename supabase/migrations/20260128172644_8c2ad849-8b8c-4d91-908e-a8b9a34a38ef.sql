-- Add foreign key relationship from recipes to profiles
-- First we need to add a constraint that links user_id in recipes to user_id in profiles
ALTER TABLE public.recipes
ADD CONSTRAINT recipes_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;