-- Fix grant_free_standards to include default tenant_id
CREATE OR REPLACE FUNCTION public.grant_free_standards()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_tenant_id uuid;
BEGIN
  -- Get the first available tenant_id or use a fixed UUID for single-tenant setups
  SELECT id INTO default_tenant_id FROM public.tenants LIMIT 1;
  
  -- If no tenant exists, create a default one
  IF default_tenant_id IS NULL THEN
    INSERT INTO public.tenants (name, domain) 
    VALUES ('Default Tenant', 'default')
    RETURNING id INTO default_tenant_id;
  END IF;
  
  -- Insert user_standard_access with tenant_id
  INSERT INTO public.user_standard_access (user_id, standard_id, access_type, is_active, tenant_id)
  SELECT NEW.id, s.id, 'free', true, default_tenant_id
  FROM public.standards s
  WHERE s.is_free = true;
  
  RETURN NEW;
END;
$function$;