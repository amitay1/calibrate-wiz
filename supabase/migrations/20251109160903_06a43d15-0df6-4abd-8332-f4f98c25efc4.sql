-- Optimize RLS policies for better performance at scale
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation for each row

-- Profiles table policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING ((id = (select auth.uid())) AND (tenant_id = get_current_tenant_id()));

-- Technique sheets policies
DROP POLICY IF EXISTS "Users can delete their own technique sheets" ON public.technique_sheets;
CREATE POLICY "Users can delete their own technique sheets" 
ON public.technique_sheets 
FOR DELETE 
USING ((user_id = (select auth.uid())) AND (tenant_id = get_current_tenant_id()));

DROP POLICY IF EXISTS "Users can insert technique sheets in their tenant" ON public.technique_sheets;
CREATE POLICY "Users can insert technique sheets in their tenant" 
ON public.technique_sheets 
FOR INSERT 
WITH CHECK ((user_id = (select auth.uid())) AND (tenant_id = get_current_tenant_id()));

DROP POLICY IF EXISTS "Users can update their own technique sheets" ON public.technique_sheets;
CREATE POLICY "Users can update their own technique sheets" 
ON public.technique_sheets 
FOR UPDATE 
USING ((user_id = (select auth.uid())) AND (tenant_id = get_current_tenant_id()));

-- Purchase history policy
DROP POLICY IF EXISTS "Users can view their own purchase history" ON public.purchase_history;
CREATE POLICY "Users can view their own purchase history" 
ON public.purchase_history 
FOR SELECT 
USING ((select auth.uid()) = user_id);

-- User roles policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING ((select auth.uid()) = user_id);