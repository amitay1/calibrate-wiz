import { useState } from 'react';
import { useMultiWindow } from '@/hooks/useMultiWindow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, X, Focus, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';

export function MultiWindowManager() {
  const {
    isElectron,
    openWindows,
    loading,
    focusSheetWindow,
    closeSheetWindow,
    refreshWindows,
  } = useMultiWindow();

  if (!isElectron) {
    return null;
  }

  const handleFocusWindow = async (sheetId: string) => {
    const result = await focusSheetWindow(sheetId);
    if (result.success) {
      toast.success('Focused window');
    } else {
      toast.error('Failed to focus window');
    }
  };

  const handleCloseWindow = async (sheetId: string) => {
    const result = await closeSheetWindow(sheetId);
    if (result.success) {
      toast.success('Closed window');
    } else {
      toast.error('Failed to close window');
    }
  };

  if (openWindows.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Open Windows</CardTitle>
          </div>
          <CardDescription>
            No technique sheets open in separate windows
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Open Windows</CardTitle>
            <Badge variant="secondary">{openWindows.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshWindows}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        <CardDescription>
          Manage technique sheets open in separate windows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {openWindows.map((window) => (
            <div
              key={window.sheetId}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Sheet {window.sheetId.slice(0, 8)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {window.isFocused && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                    {window.isDestroyed && (
                      <Badge variant="destructive" className="text-xs">
                        Destroyed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFocusWindow(window.sheetId)}
                  disabled={loading || window.isDestroyed}
                  title="Focus window"
                >
                  <Focus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCloseWindow(window.sheetId)}
                  disabled={loading || window.isDestroyed}
                  title="Close window"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
