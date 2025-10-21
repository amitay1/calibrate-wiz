-- Create projects table for storing technique sheets and inspection reports
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('technique_sheet', 'inspection_report')),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_type_idx ON public.projects(type);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON public.projects(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only view their own projects
CREATE POLICY "Users can view own projects"
    ON public.projects
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own projects
CREATE POLICY "Users can insert own projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own projects
CREATE POLICY "Users can update own projects"
    ON public.projects
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own projects
CREATE POLICY "Users can delete own projects"
    ON public.projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.projects IS 'Stores user projects including technique sheets and inspection reports';
COMMENT ON COLUMN public.projects.id IS 'Unique identifier for the project';
COMMENT ON COLUMN public.projects.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.projects.name IS 'User-friendly name for the project';
COMMENT ON COLUMN public.projects.type IS 'Type of project: technique_sheet or inspection_report';
COMMENT ON COLUMN public.projects.data IS 'JSON data containing the complete project information';
COMMENT ON COLUMN public.projects.created_at IS 'Timestamp when project was created';
COMMENT ON COLUMN public.projects.updated_at IS 'Timestamp when project was last updated';
