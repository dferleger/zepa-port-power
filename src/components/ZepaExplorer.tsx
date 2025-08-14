import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Zap, Battery, Ship, Truck, Settings, HelpCircle } from 'lucide-react';
import LoadProfileChart from './LoadProfileChart';

interface EquipmentData {
  name: string;
  total: number;
  electrified: number;
  movesPerDay: number;
}

interface ChargingStrategy {
  depot: number;
  rotation: number;
  opportunity: number;
  swapping: number;
}

export default function ZepaExplorer() {
  const [terminalArchetype, setTerminalArchetype] = useState('');
  const [gridCapacity, setGridCapacity] = useState(45);
  const [shiftSchedule, setShiftSchedule] = useState('');
  const [overallMoves, setOverallMoves] = useState(8000);
  
  // Equipment data
  const [untetheredEquipment, setUntetheredEquipment] = useState<EquipmentData[]>([
    { name: 'TT', total: 20, electrified: 15, movesPerDay: 50 },
    { name: 'SC', total: 8, electrified: 6, movesPerDay: 80 },
    { name: 'AGV', total: 12, electrified: 10, movesPerDay: 60 },
    { name: 'RS', total: 4, electrified: 2, movesPerDay: 30 },
  ]);
  
  const [tetheredEquipment, setTetheredEquipment] = useState<EquipmentData[]>([
    { name: 'STS', total: 6, electrified: 4, movesPerDay: 200 },
    { name: 'RTG', total: 15, electrified: 12, movesPerDay: 40 },
    { name: 'ASC', total: 10, electrified: 8, movesPerDay: 60 },
  ]);

  // Charging strategies
  const [chargingStrategies, setChargingStrategies] = useState<{[key: string]: ChargingStrategy}>({
    TT: { depot: 60, rotation: 25, opportunity: 15, swapping: 0 },
    SC: { depot: 50, rotation: 30, opportunity: 20, swapping: 0 },
    AGV: { depot: 40, rotation: 35, opportunity: 25, swapping: 0 },
    RS: { depot: 100, rotation: 0, opportunity: 0, swapping: 0 },
  });

  // Other inputs
  const [shorePowerConnections, setShorePowerConnections] = useState(4);
  const [shorePowerSize, setShorePowerSize] = useState(2.5);
  const [reeferContainers, setReeferContainers] = useState(150);
  const [includeBESS, setIncludeBESS] = useState(false);
  const [bessSize, setBessSize] = useState(5);
  
  const [showResults, setShowResults] = useState(false);

  const updateEquipmentElectrified = (
    equipment: EquipmentData[], 
    setEquipment: React.Dispatch<React.SetStateAction<EquipmentData[]>>, 
    index: number, 
    field: 'total' | 'electrified' | 'movesPerDay', 
    value: number
  ) => {
    const newEquipment = [...equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    setEquipment(newEquipment);
  };

  const updateChargingStrategy = (equipment: string, strategy: string, value: number) => {
    if (equipment === 'RS' && strategy !== 'depot') return; // RS only supports depot charging
    
    const current = chargingStrategies[equipment];
    const others = Object.keys(current).filter(k => k !== strategy);
    const remaining = 100 - value;
    const otherTotal = others.reduce((sum, key) => sum + current[key as keyof ChargingStrategy], 0);
    
    const newStrategy = { ...current, [strategy]: value };
    
    if (otherTotal > 0) {
      others.forEach(key => {
        newStrategy[key as keyof ChargingStrategy] = Math.round((current[key as keyof ChargingStrategy] / otherTotal) * remaining);
      });
    }
    
    setChargingStrategies(prev => ({ ...prev, [equipment]: newStrategy }));
  };

  const calculateExtraVehicles = (equipment: EquipmentData, strategies: ChargingStrategy) => {
    // Simplified calculation for demo
    const rotationFactor = strategies.rotation * 0.01 * 0.2;
    return Math.round(equipment.electrified * rotationFactor);
  };

  const calculateChargers = (equipment: EquipmentData, strategies: ChargingStrategy) => {
    // Simplified calculation for demo
    const depotFactor = strategies.depot * 0.01 * 0.3;
    const opportunityFactor = strategies.opportunity * 0.01 * 0.5;
    return Math.round(equipment.electrified * (depotFactor + opportunityFactor));
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold">Load Profile Scenario Explorer</h1>
            </div>
            <p className="text-xl mb-4 opacity-90">
              Accelerating port decarbonization by making battery-electric container handling equipment (BE-CHE) affordable and accessible this decade.
            </p>
            <p className="text-lg opacity-80 max-w-4xl">
              The Explorer is a configurable tool to help port stakeholders assess BE-CHE loads, grid feasibility, and charging strategies.
            </p>
          </div>
        </header>
    
        <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8">
          
          {/* Section 1: Terminal Set-up */}
          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg pb-6">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Terminal Set-up
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-2">
                Configure basic terminal parameters including archetype, grid capacity, shift schedules, and daily move volumes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="archetype">Terminal archetype</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for terminal archetype selection will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              <Select value={terminalArchetype} onValueChange={setTerminalArchetype}>
                <SelectTrigger>
                  <SelectValue placeholder="Select archetype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sts-tt-rtg">STS & TT & RTG</SelectItem>
                  <SelectItem value="sts-asc-sc">STS & ASC & SC</SelectItem>
                  <SelectItem value="sts-agv-rtg">STS & AGV & RTG</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="grid">Grid capacity (MW)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for grid capacity determination will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              <Input
                id="grid"
                type="number"
                value={gridCapacity}
                onChange={(e) => setGridCapacity(Number(e.target.value))}
              />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="schedule">Daily shift schedule</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for shift schedule configuration will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              <Select value={shiftSchedule} onValueChange={setShiftSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="16">16 hours</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="moves">Overall moves (TEU/day)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for daily move calculations will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              <Input
                id="moves"
                type="number"
                value={overallMoves}
                onChange={(e) => setOverallMoves(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Equipment Table */}
        <Card>
          <CardHeader className="bg-accent text-accent-foreground rounded-t-lg pb-6">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Equipment Table
            </CardTitle>
            <CardDescription className="text-accent-foreground/80 mt-2">
              Define equipment quantities, electrification levels, and daily operational volumes for both tethered and untethered port equipment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-8">
            {/* Untethered Equipment */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Untethered Equipment</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Port equipment
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Equipment type abbreviations and specifications will be detailed in methodology section.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Number of all equipment
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total quantity of this equipment type currently operational in the terminal.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Number electrified
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of electric/battery-powered units planned or currently in operation.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          % electrified
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Automatically calculated percentage of electrified equipment relative to total fleet.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Moves per day per vehicle
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Average daily operational cycles for each unit based on terminal throughput and efficiency.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {untetheredEquipment.map((equipment, index) => (
                      <tr key={equipment.name} className="border-b bg-muted/30">
                        <td className="p-3 font-medium">{equipment.name}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={equipment.total}
                            onChange={(e) => updateEquipmentElectrified(untetheredEquipment, setUntetheredEquipment, index, 'total', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={equipment.electrified}
                            onChange={(e) => updateEquipmentElectrified(untetheredEquipment, setUntetheredEquipment, index, 'electrified', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 font-medium text-primary">
                          {equipment.total > 0 ? Math.round((equipment.electrified / equipment.total) * 100) : 0}%
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={equipment.movesPerDay}
                            onChange={(e) => updateEquipmentElectrified(untetheredEquipment, setUntetheredEquipment, index, 'movesPerDay', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tethered Equipment */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Tethered Equipment</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Port equipment
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Equipment type abbreviations and specifications will be detailed in methodology section.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Number of all equipment
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total quantity of this equipment type currently operational in the terminal.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Number electrified
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of electric/battery-powered units planned or currently in operation.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          % electrified
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Automatically calculated percentage of electrified equipment relative to total fleet.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <div className="flex items-center gap-2">
                          Moves per day per vehicle
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Average daily operational cycles for each unit based on terminal throughput and efficiency.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tetheredEquipment.map((equipment, index) => (
                      <tr key={equipment.name} className="border-b bg-muted/30">
                        <td className="p-3 font-medium">{equipment.name}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={equipment.total}
                            onChange={(e) => updateEquipmentElectrified(tetheredEquipment, setTetheredEquipment, index, 'total', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={equipment.electrified}
                            onChange={(e) => updateEquipmentElectrified(tetheredEquipment, setTetheredEquipment, index, 'electrified', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 font-medium text-primary">
                          {equipment.total > 0 ? Math.round((equipment.electrified / equipment.total) * 100) : 0}%
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={equipment.movesPerDay}
                            onChange={(e) => updateEquipmentElectrified(tetheredEquipment, setTetheredEquipment, index, 'movesPerDay', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Charging Strategies */}
        <Card>
          <CardHeader className="bg-success text-success-foreground rounded-t-lg pb-6">
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Charging Strategies for Untethered Equipment
            </CardTitle>
            <CardDescription className="text-success-foreground/80 mt-2">
              Configure charging distribution percentages across depot, rotation, opportunity, and swapping strategies for optimal operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Equipment
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Equipment type abbreviations and specifications will be detailed in methodology section.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Depot charging (%)
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage of fleet charged at central depot facilities during off-shift hours.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Vehicle rotation (%)
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage requiring vehicle rotation strategy due to battery limitations.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Opportunity charging (%)
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage utilizing quick charging during operational breaks and waiting periods.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Battery swapping (%)
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage using automated battery swapping systems for continuous operation.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Extra vehicles
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Additional vehicles needed for rotation strategy calculated from charging requirements.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-2">
                        Number of chargers
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total charging infrastructure units required based on fleet size and charging strategy.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {untetheredEquipment.map((equipment) => (
                    <tr key={equipment.name} className="border-b bg-muted/30">
                      <td className="p-3 font-medium">{equipment.name}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={chargingStrategies[equipment.name]?.depot || 0}
                          onChange={(e) => updateChargingStrategy(equipment.name, 'depot', Number(e.target.value))}
                          className="w-20"
                          max="100"
                          min="0"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={chargingStrategies[equipment.name]?.rotation || 0}
                          onChange={(e) => updateChargingStrategy(equipment.name, 'rotation', Number(e.target.value))}
                          className="w-20"
                          max="100"
                          min="0"
                          disabled={equipment.name === 'RS'}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={chargingStrategies[equipment.name]?.opportunity || 0}
                          onChange={(e) => updateChargingStrategy(equipment.name, 'opportunity', Number(e.target.value))}
                          className="w-20"
                          max="100"
                          min="0"
                          disabled={equipment.name === 'RS'}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={chargingStrategies[equipment.name]?.swapping || 0}
                          onChange={(e) => updateChargingStrategy(equipment.name, 'swapping', Number(e.target.value))}
                          className="w-20"
                          max="100"
                          min="0"
                          disabled={equipment.name === 'RS'}
                        />
                      </td>
                      <td className="p-3 font-medium text-primary">
                        {calculateExtraVehicles(equipment, chargingStrategies[equipment.name] || { depot: 0, rotation: 0, opportunity: 0, swapping: 0 })}
                      </td>
                      <td className="p-3 font-medium text-primary">
                        {calculateChargers(equipment, chargingStrategies[equipment.name] || { depot: 0, rotation: 0, opportunity: 0, swapping: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Other Load Profiles */}
        <Card>
          <CardHeader className="bg-secondary text-secondary-foreground rounded-t-lg pb-6">
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Other Load Profiles
            </CardTitle>
            <CardDescription className="text-secondary-foreground/80 mt-2">
              Add shore power connections and reefer container loads to complete the comprehensive load assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            <div className="space-y-4">
              <h3 className="font-semibold">Shore Power</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="shore-connections">Number of connections</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for shore power connection calculations will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="shore-connections"
                  type="number"
                  value={shorePowerConnections}
                  onChange={(e) => setShorePowerConnections(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="shore-size">Size per connection (MW)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for shore power sizing will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="shore-size"
                  type="number"
                  step="0.1"
                  value={shorePowerSize}
                  onChange={(e) => setShorePowerSize(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="reefers" className="bg-yellow-200 px-2 py-1 rounded">
                    # reefer containers on ship and in terminal
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed instructions and methodology for reefer container load calculations will be provided to give user context.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="reefers"
                  type="number"
                  value={reeferContainers}
                  onChange={(e) => setReeferContainers(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: BESS System */}
        <Card>
          <CardHeader className="bg-muted text-muted-foreground rounded-t-lg pb-6">
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              BESS System
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 mt-2">
              Optional battery energy storage system configuration to manage peak loads and grid stability requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-8">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bess"
                checked={includeBESS}
                onCheckedChange={(checked) => setIncludeBESS(checked === true)}
              />
              <Label htmlFor="bess">Include BESS</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detailed instructions and methodology for BESS inclusion will be provided to give user context.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {includeBESS && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bess-size">Size (MW)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Detailed instructions and methodology for BESS sizing will be provided to give user context.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="bess-size"
                    type="number"
                    value={bessSize}
                    onChange={(e) => setBessSize(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost</Label>
                  <div className="p-3 bg-muted rounded text-sm">
                    ${bessSize}M USD (estimate: 1 MW = 1M USD)
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 6: Custom Load Input */}
        <Card>
          <CardHeader className="bg-accent/50 text-accent-foreground rounded-t-lg pb-6">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Custom Load Input
            </CardTitle>
            <CardDescription className="text-accent-foreground/80 mt-2">
              Upload your own load profile data if you have specific terminal load measurements or custom requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Input my own load</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Custom Load Profile</DialogTitle>
                  <DialogDescription>
                    The tool will allow users to submit their own data for load profiles if they have it.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Section 7: Calculate */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={() => setShowResults(true)} 
              size="lg" 
              className="w-full md:w-auto"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate
            </Button>
          </CardContent>
        </Card>

        {/* Section 8: Output Area */}
        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle>Outputs for the day recording the highest peak load in the year</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LoadProfileChart />
                </div>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Peak load of terminal</div>
                    <div className="text-2xl font-bold text-primary">42.5 MW</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Energy usage in 24 hours</div>
                    <div className="text-2xl font-bold text-primary">756 MWh</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Peak fluctuation within a day</div>
                    <div className="text-2xl font-bold text-primary">1.8 GW</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p>
                <strong>Notes:</strong> Key abbreviations of equipment – Ship to Shore Crane (STS), Rubber-Tired Gantry (RTG), 
                Automated Stacking Cranes (ASC), Terminal Tractor (TT), Straddle Carriers (SC), Automated Guided Vehicle (AGV), 
                Reach Stackers (RS).
              </p>
              <p>
                [1] Reach stackers (RS) will only have a depot charging strategy, as it is unlikely they will use a different 
                charging strategy.
              </p>
              <p>
                [2] In this table when the user changes one percentage the other percentages will immediately adapt.
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
