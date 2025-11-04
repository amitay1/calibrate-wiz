import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { tenantService } from '@/services/tenantService';
import { ArrowLeft, Building2, Plus, Users } from 'lucide-react';
import { Tenant } from '@/hooks/useTenant';

export default function AdminTenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    subdomain: '',
    custom_domain: '',
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    const result = await tenantService.getAllTenants();
    if (result.success && result.tenants) {
      setTenants(result.tenants);
    } else {
      toast.error(result.error || 'Failed to load tenants');
    }
    setLoading(false);
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name || !newTenant.subdomain) {
      toast.error('Name and subdomain are required');
      return;
    }

    const result = await tenantService.createTenant({
      name: newTenant.name,
      subdomain: newTenant.subdomain.toLowerCase(),
      custom_domain: newTenant.custom_domain || undefined,
    });

    if (result.success) {
      toast.success('Tenant created successfully');
      setIsCreateOpen(false);
      setNewTenant({ name: '', subdomain: '', custom_domain: '' });
      loadTenants();
    } else {
      toast.error(result.error || 'Failed to create tenant');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              Tenant Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage organizations and their access
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={newTenant.name}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, name: e.target.value })
                    }
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={newTenant.subdomain}
                    onChange={(e) =>
                      setNewTenant({
                        ...newTenant,
                        subdomain: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="acme"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL will be: {newTenant.subdomain || 'subdomain'}.scanmaster.com
                  </p>
                </div>
                <div>
                  <Label htmlFor="custom_domain">Custom Domain (Optional)</Label>
                  <Input
                    id="custom_domain"
                    value={newTenant.custom_domain}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, custom_domain: e.target.value })
                    }
                    placeholder="inspect.acme.com"
                  />
                </div>
                <Button onClick={handleCreateTenant} className="w-full">
                  Create Tenant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tenants found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {tenant.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {tenant.subdomain}.scanmaster.com
                      </CardDescription>
                    </div>
                    <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {tenant.custom_domain && (
                    <p className="text-sm text-muted-foreground mb-3">
                      🌐 {tenant.custom_domain}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      Created {new Date(tenant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
