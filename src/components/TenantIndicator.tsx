import { useTenant } from '@/hooks/useTenant';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const TenantIndicator = () => {
  const { currentTenant, loading } = useTenant();

  if (loading) {
    return <Skeleton className="h-6 w-32" />;
  }

  if (!currentTenant) {
    return null;
  }

  return (
    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
      <Building2 className="h-3 w-3" />
      <span className="text-xs">{currentTenant.name}</span>
    </Badge>
  );
};
