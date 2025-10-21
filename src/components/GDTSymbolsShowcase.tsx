import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PositionSymbol,
  ConcentricitySymbol,
  SymmetrySymbol,
  ParallelismSymbol,
  PerpendicularitySymbol,
  AngularitySymbol,
  CylindricitySymbol,
  FlatnessSymbol,
  CircularitySymbol,
  StraightnessSymbol,
  ProfileLineSymbol,
  ProfileSurfaceSymbol,
  CircularRunoutSymbol,
  TotalRunoutSymbol,
  MMCSymbol,
  LMCSymbol,
  RFSSymbol,
  DatumSymbol,
} from './GDTSymbols';

/**
 * GD&T Symbols Showcase Component
 * Displays all available GD&T symbols organized by category
 */
export const GDTSymbolsShowcase: React.FC = () => {
  const formSymbols = [
    { name: 'Straightness', Component: StraightnessSymbol, description: 'Controls the straightness of a line element' },
    { name: 'Flatness', Component: FlatnessSymbol, description: 'Controls the flatness of a surface' },
    { name: 'Circularity', Component: CircularitySymbol, description: 'Controls roundness of a circular feature' },
    { name: 'Cylindricity', Component: CylindricitySymbol, description: 'Controls the form of a cylindrical feature' },
  ];

  const orientationSymbols = [
    { name: 'Parallelism', Component: ParallelismSymbol, description: 'Controls parallelism to a datum' },
    { name: 'Perpendicularity', Component: PerpendicularitySymbol, description: 'Controls perpendicularity to a datum' },
    { name: 'Angularity', Component: AngularitySymbol, description: 'Controls angularity to a datum' },
  ];

  const locationSymbols = [
    { name: 'Position', Component: PositionSymbol, description: 'Controls location of a feature' },
    { name: 'Concentricity', Component: ConcentricitySymbol, description: 'Controls coaxiality of cylindrical features' },
    { name: 'Symmetry', Component: SymmetrySymbol, description: 'Controls symmetry about a centerplane' },
  ];

  const profileSymbols = [
    { name: 'Profile of a Line', Component: ProfileLineSymbol, description: 'Controls profile of a line' },
    { name: 'Profile of a Surface', Component: ProfileSurfaceSymbol, description: 'Controls profile of a surface' },
  ];

  const runoutSymbols = [
    { name: 'Circular Runout', Component: CircularRunoutSymbol, description: 'Controls runout of a circular element' },
    { name: 'Total Runout', Component: TotalRunoutSymbol, description: 'Controls total runout of a surface' },
  ];

  const modifierSymbols = [
    { name: 'MMC (Maximum Material Condition)', Component: MMCSymbol, description: 'Indicates maximum material condition' },
    { name: 'LMC (Least Material Condition)', Component: LMCSymbol, description: 'Indicates least material condition' },
    { name: 'RFS (Regardless of Feature Size)', Component: RFSSymbol, description: 'Indicates regardless of feature size' },
  ];

  const SymbolGrid = ({ symbols }: { symbols: typeof formSymbols }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {symbols.map(({ name, Component, description }) => (
        <Card key={name} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-3">
              <Component size={32} />
              <span>{name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">GD&T Symbol Library</h2>
        <p className="text-muted-foreground">
          Geometric Dimensioning and Tolerancing symbols per ASME Y14.5-2018
        </p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="orientation">Orientation</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="runout">Runout</TabsTrigger>
          <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <SymbolGrid symbols={formSymbols} />
        </TabsContent>

        <TabsContent value="orientation" className="mt-6">
          <SymbolGrid symbols={orientationSymbols} />
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <SymbolGrid symbols={locationSymbols} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <SymbolGrid symbols={profileSymbols} />
        </TabsContent>

        <TabsContent value="runout" className="mt-6">
          <SymbolGrid symbols={runoutSymbols} />
        </TabsContent>

        <TabsContent value="modifiers" className="mt-6">
          <SymbolGrid symbols={modifierSymbols} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Datum Reference Example</CardTitle>
          <CardDescription>Datum symbols with labels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 items-center flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <DatumSymbol label="A" size={32} />
              <span className="text-xs text-muted-foreground">Datum A</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DatumSymbol label="B" size={32} />
              <span className="text-xs text-muted-foreground">Datum B</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DatumSymbol label="C" size={32} />
              <span className="text-xs text-muted-foreground">Datum C</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-background p-4 rounded overflow-auto">
{`import { PositionSymbol, DatumSymbol } from '@/components/GDTSymbols';

// Use individual symbol
<PositionSymbol size={24} color="#000" />

// Use datum symbol with label
<DatumSymbol label="A" size={32} />

// Use in technical drawings
<div className="flex items-center gap-2">
  <PositionSymbol size={20} />
  <span>Ø 0.05 A B C</span>
</div>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
