-- Create public users table to extend auth.users
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'visualizador' CHECK (role IN ('visualizador', 'analista', 'admin')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- Enable RLS on public.usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" 
ON public.usuarios FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.usuarios FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create public user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
-- Note: Creating triggers on auth.users might require superuser or specific permissions.
-- If this fails, please configure the trigger manually in the Supabase Dashboard.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Migration function for existing CPF users (Hypothetical)
CREATE OR REPLACE FUNCTION migrate_cpf_users_to_email()
RETURNS void AS $$
BEGIN
  RAISE NOTICE 'Migration function ready for legacy data';
END;
$$ LANGUAGE plpgsql;
