import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Standard {
  id: string;
  code: string;
  name: string;
  description: string;
  version: string;
  category: string;
  is_free: boolean;
  price_one_time: number;
  price_monthly: number;
  price_annual: number;
  is_active: boolean;
}

export default function Standards() {
  const navigate = useNavigate();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [userStandards, setUserStandards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processingStandard, setProcessingStandard] = useState<string | null>(null);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      setLoading(true);

      // Load all standards
      const { data: standardsData, error: standardsError } = await supabase
        .from('standards')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (standardsError) throw standardsError;
      setStandards(standardsData || []);

      // Load user's standards
      const { data: userStandardsData } = await supabase.functions.invoke('get-user-standards');
      
      if (userStandardsData?.standards) {
        const userStandardIds = new Set<string>(
          userStandardsData.standards.map((access: any) => access.standard_id as string)
        );
        setUserStandards(userStandardIds);
      }
    } catch (error) {
      console.error('Error loading standards:', error);
      toast.error('שגיאה בטעינת התקנים');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (standardId: string, priceType: 'one_time' | 'monthly' | 'annual') => {
    try {
      setProcessingStandard(standardId);

      const { data, error } = await supabase.functions.invoke('create-lemon-squeezy-checkout', {
        body: { standardId, priceType },
      });

      if (error) throw error;

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('לא התקבל קישור לתשלום');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('שגיאה ביצירת תשלום');
      setProcessingStandard(null);
    }
  };

  const handleSelectStandard = (standardCode: string) => {
    navigate('/', { state: { selectedStandard: standardCode } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedStandards = standards.reduce((acc, standard) => {
    if (!acc[standard.category]) {
      acc[standard.category] = [];
    }
    acc[standard.category].push(standard);
    return acc;
  }, {} as Record<string, Standard[]>);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">קטלוג תקנים</h1>
        <p className="text-muted-foreground">בחר ורכוש תקנים לשימוש במערכת</p>
      </div>

      {Object.entries(groupedStandards).map(([category, categoryStandards]) => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryStandards.map((standard) => {
              const hasAccess = standard.is_free || userStandards.has(standard.id);
              const isProcessing = processingStandard === standard.id;

              return (
                <Card key={standard.id} className="relative">
                  {hasAccess && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="default" className="bg-success">
                        <Check className="h-3 w-3 mr-1" />
                        פתוח
                      </Badge>
                    </div>
                  )}
                  {!hasAccess && !standard.is_free && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        נעול
                      </Badge>
                    </div>
                  )}
                  {standard.is_free && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-primary/10">
                        חינם
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle>{standard.code}</CardTitle>
                    <CardDescription>{standard.name}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {standard.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      גרסה: {standard.version}
                    </p>

                    {!hasAccess && !standard.is_free && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">רכישה חד-פעמית:</span>
                          <span className="font-semibold">${standard.price_one_time}</span>
                        </div>
                        {standard.price_monthly && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">מנוי חודשי:</span>
                            <span className="font-semibold">${standard.price_monthly}/חודש</span>
                          </div>
                        )}
                        {standard.price_annual && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">מנוי שנתי:</span>
                            <span className="font-semibold">${standard.price_annual}/שנה</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    {hasAccess ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectStandard(standard.code)}
                      >
                        בחר תקן זה
                      </Button>
                    ) : standard.is_free ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectStandard(standard.code)}
                      >
                        התחל להשתמש
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full"
                          onClick={() => handlePurchase(standard.id, 'one_time')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            `רכוש ב-$${standard.price_one_time}`
                          )}
                        </Button>
                        {standard.price_monthly && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handlePurchase(standard.id, 'monthly')}
                            disabled={isProcessing}
                          >
                            מנוי חודשי - ${standard.price_monthly}/חודש
                          </Button>
                        )}
                        {standard.price_annual && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handlePurchase(standard.id, 'annual')}
                            disabled={isProcessing}
                          >
                            מנוי שנתי - ${standard.price_annual}/שנה
                          </Button>
                        )}
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
