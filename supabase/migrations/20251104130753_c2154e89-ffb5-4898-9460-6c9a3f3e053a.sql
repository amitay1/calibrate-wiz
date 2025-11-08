-- ============================================
-- Phase 1: Multi-Tenant Infrastructure
-- ============================================

-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Create default tenant for existing users
INSERT INTO public.tenants (name, subdomain, is_active)
VALUES ('Default Organization', 'default', true)
ON CONFLICT (subdomain) DO NOTHING;

-- 3. Add tenant_id to existing tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.technique_sheets 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.user_standard_access 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 4. Assign existing records to default tenant
UPDATE public.profiles 
SET tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'default')
WHERE tenant_id IS NULL;

UPDATE public.technique_sheets 
SET tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'default')
WHERE tenant_id IS NULL;

UPDATE public.user_standard_access 
SET tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'default')
WHERE tenant_id IS NULL;

-- 5. Make tenant_id NOT NULL after migration
ALTER TABLE public.profiles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.technique_sheets ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.user_standard_access ALTER COLUMN tenant_id SET NOT NULL;

-- 6. Create helper function to get current user's tenant
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- 7. Update RLS Policies for tenant isolation

-- Tenants table policies
CREATE POLICY "Users can view their own tenant"
ON public.tenants FOR SELECT
USING (id = public.get_current_tenant_id());

CREATE POLICY "Admins can manage tenants"
ON public.tenants FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND tenant_id = public.tenants.id
));

-- Profiles policies (replace existing)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles FOR SELECT
USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid() AND tenant_id = public.get_current_tenant_id());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Technique sheets policies (replace existing)
DROP POLICY IF EXISTS "Users can view their own technique sheets" ON public.technique_sheets;
DROP POLICY IF EXISTS "Users can insert their own technique sheets" ON public.technique_sheets;
DROP POLICY IF EXISTS "Users can update their own technique sheets" ON public.technique_sheets;
DROP POLICY IF EXISTS "Users can delete their own technique sheets" ON public.technique_sheets;

CREATE POLICY "Users can view technique sheets in their tenant"
ON public.technique_sheets FOR SELECT
USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Users can insert technique sheets in their tenant"
ON public.technique_sheets FOR INSERT
WITH CHECK (user_id = auth.uid() AND tenant_id = public.get_current_tenant_id());

CREATE POLICY "Users can update their own technique sheets"
ON public.technique_sheets FOR UPDATE
USING (user_id = auth.uid() AND tenant_id = public.get_current_tenant_id());

CREATE POLICY "Users can delete their own technique sheets"
ON public.technique_sheets FOR DELETE
USING (user_id = auth.uid() AND tenant_id = public.get_current_tenant_id());

-- User standard access policies (replace existing)
DROP POLICY IF EXISTS "Users can view their own standard access" ON public.user_standard_access;

CREATE POLICY "Users can view standard access in their tenant"
ON public.user_standard_access FOR SELECT
USING (tenant_id = public.get_current_tenant_id());

-- 8. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_tenant_updated_at();

-- 9. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_technique_sheets_tenant_id ON public.technique_sheets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_standard_access_tenant_id ON public.user_standard_access(tenant_id);