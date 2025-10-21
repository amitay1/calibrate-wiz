import React, { useState, useRef } from 'react';
import { Upload, FileImage, Trash2, Eye, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PartDrawing {
  id: string;
  name: string;
  type: 'upload' | 'generated';
  imageData: string; // Base64 or URL
  uploadDate: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface PartDrawingManagerProps {
  onDrawingSelected?: (drawing: PartDrawing | null) => void;
  currentDrawing?: PartDrawing | null;
  enableGeneration?: boolean;
}

export const PartDrawingManager: React.FC<PartDrawingManagerProps> = ({
  onDrawingSelected,
  currentDrawing,
  enableGeneration = true,
}) => {
  const [drawings, setDrawings] = useState<PartDrawing[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<PartDrawing | null>(currentDrawing || null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG, JPG, SVG, or PDF files.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        // Get image dimensions (if image file)
        let dimensions: { width: number; height: number } | undefined;
        if (file.type.startsWith('image/')) {
          dimensions = await getImageDimensions(imageData);
        }

        const newDrawing: PartDrawing = {
          id: `drawing_${Date.now()}`,
          name: file.name,
          type: 'upload',
          imageData,
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          dimensions,
        };

        setDrawings([...drawings, newDrawing]);
        setSelectedDrawing(newDrawing);
        onDrawingSelected?.(newDrawing);

        toast.success(`Drawing "${file.name}" uploaded successfully`);
      };

      reader.onerror = () => {
        toast.error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload drawing');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Get image dimensions
   */
  const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = dataUrl;
    });
  };

  /**
   * Handle drawing selection
   */
  const handleSelectDrawing = (drawing: PartDrawing) => {
    setSelectedDrawing(drawing);
    onDrawingSelected?.(drawing);
    toast.success(`Selected: ${drawing.name}`);
  };

  /**
   * Handle drawing deletion
   */
  const handleDeleteDrawing = (drawingId: string) => {
    const drawing = drawings.find((d) => d.id === drawingId);
    if (!drawing) return;

    if (confirm(`Are you sure you want to delete "${drawing.name}"?`)) {
      const newDrawings = drawings.filter((d) => d.id !== drawingId);
      setDrawings(newDrawings);

      if (selectedDrawing?.id === drawingId) {
        setSelectedDrawing(null);
        onDrawingSelected?.(null);
      }

      toast.success(`Deleted: ${drawing.name}`);
    }
  };

  /**
   * Handle preview
   */
  const handlePreview = (drawing: PartDrawing) => {
    setPreviewImage(drawing.imageData);
    setPreviewOpen(true);
  };

  /**
   * Handle download
   */
  const handleDownload = (drawing: PartDrawing) => {
    const link = document.createElement('a');
    link.href = drawing.imageData;
    link.download = drawing.name || 'part-drawing.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded: ${drawing.name}`);
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Part Drawing Manager
          </CardTitle>
          <CardDescription>
            Upload or generate technical drawings for your inspection parts
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Drawing
              </TabsTrigger>
              <TabsTrigger value="library" disabled={drawings.length === 0}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Drawing Library ({drawings.length})
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="drawing-upload"
                />

                <label htmlFor="drawing-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, SVG, or PDF (max 10MB)
                      </p>
                    </div>

                    <Button type="button" variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                </label>
              </div>

              {selectedDrawing && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Currently Selected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedDrawing.name}
                      </p>
                      {selectedDrawing.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          {selectedDrawing.dimensions.width} × {selectedDrawing.dimensions.height} px
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(selectedDrawing)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDrawing(null);
                          onDrawingSelected?.(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>PNG, JPG, JPEG - Raster images from CAD exports</li>
                  <li>SVG - Vector graphics for scalable drawings</li>
                  <li>PDF - Multi-page technical documentation</li>
                </ul>
              </div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {drawings.map((drawing) => (
                  <Card
                    key={drawing.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDrawing?.id === drawing.id
                        ? 'border-primary border-2'
                        : ''
                    }`}
                    onClick={() => handleSelectDrawing(drawing)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden">
                          <img
                            src={drawing.imageData}
                            alt={drawing.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {drawing.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={drawing.type === 'upload' ? 'default' : 'secondary'} className="text-xs">
                                  {drawing.type === 'upload' ? 'Uploaded' : 'Generated'}
                                </Badge>
                                {drawing.fileSize && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatFileSize(drawing.fileSize)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(drawing.uploadDate).toLocaleDateString()}
                              </p>
                              {drawing.dimensions && (
                                <p className="text-xs text-muted-foreground">
                                  {drawing.dimensions.width} × {drawing.dimensions.height} px
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(drawing);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(drawing);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDrawing(drawing.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {drawings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileImage className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No drawings uploaded yet</p>
                  <p className="text-xs mt-1">Upload your first drawing to get started</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Drawing Preview</DialogTitle>
            <DialogDescription>
              Technical drawing preview
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto max-h-[70vh] border rounded-lg bg-muted/30 p-4">
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto"
                style={{ maxHeight: '65vh' }}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
