import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface LoadData {
  hour: number;
  sts: number;
  tt: number;
  rtg: number;
  shorePower: number;
  reefers: number;
  batteryCharge: number;
  total: number;
}

interface TooltipData {
  equipment: string;
  value: number;
  hour: number;
  color: string;
}

const LoadProfileChart: React.FC = () => {
  // Sample load data for 24 hours
  const loadData: LoadData[] = [
    { hour: 1, sts: 5, tt: 8, rtg: 6, shorePower: 0, reefers: 2, batteryCharge: 3, total: 24 },
    { hour: 2, sts: 4, tt: 6, rtg: 5, shorePower: 0, reefers: 2, batteryCharge: 2, total: 19 },
    { hour: 3, sts: 3, tt: 4, rtg: 4, shorePower: 0, reefers: 2, batteryCharge: 1, total: 14 },
    { hour: 4, sts: 3, tt: 4, rtg: 4, shorePower: 0, reefers: 2, batteryCharge: 1, total: 14 },
    { hour: 5, sts: 4, tt: 6, rtg: 5, shorePower: 0, reefers: 2, batteryCharge: 2, total: 19 },
    { hour: 6, sts: 6, tt: 10, rtg: 8, shorePower: 5, reefers: 2, batteryCharge: 4, total: 35 },
    { hour: 7, sts: 8, tt: 12, rtg: 10, shorePower: 8, reefers: 2, batteryCharge: 5, total: 45 },
    { hour: 8, sts: 10, tt: 15, rtg: 12, shorePower: 10, reefers: 2, batteryCharge: 6, total: 55 },
    { hour: 9, sts: 12, tt: 18, rtg: 14, shorePower: 10, reefers: 2, batteryCharge: 7, total: 63 },
    { hour: 10, sts: 15, tt: 20, rtg: 16, shorePower: 12, reefers: 2, batteryCharge: 8, total: 73 },
    { hour: 11, sts: 18, tt: 22, rtg: 18, shorePower: 15, reefers: 2, batteryCharge: 9, total: 84 },
    { hour: 12, sts: 20, tt: 25, rtg: 20, shorePower: 15, reefers: 2, batteryCharge: 10, total: 92 },
    { hour: 13, sts: 18, tt: 22, rtg: 18, shorePower: 12, reefers: 2, batteryCharge: 8, total: 80 },
    { hour: 14, sts: 16, tt: 20, rtg: 16, shorePower: 10, reefers: 2, batteryCharge: 7, total: 71 },
    { hour: 15, sts: 14, tt: 18, rtg: 14, shorePower: 8, reefers: 2, batteryCharge: 6, total: 62 },
    { hour: 16, sts: 12, tt: 15, rtg: 12, shorePower: 5, reefers: 2, batteryCharge: 5, total: 51 },
    { hour: 17, sts: 10, tt: 12, rtg: 10, shorePower: 8, reefers: 2, batteryCharge: 4, total: 46 },
    { hour: 18, sts: 8, tt: 10, rtg: 8, shorePower: 10, reefers: 2, batteryCharge: 3, total: 41 },
    { hour: 19, sts: 6, tt: 8, rtg: 6, shorePower: 5, reefers: 2, batteryCharge: 2, total: 29 },
    { hour: 20, sts: 5, tt: 6, rtg: 5, shorePower: 0, reefers: 2, batteryCharge: 2, total: 20 },
    { hour: 21, sts: 4, tt: 5, rtg: 4, shorePower: 0, reefers: 2, batteryCharge: 1, total: 16 },
    { hour: 22, sts: 4, tt: 5, rtg: 4, shorePower: 0, reefers: 2, batteryCharge: 1, total: 16 },
    { hour: 23, sts: 5, tt: 6, rtg: 5, shorePower: 0, reefers: 2, batteryCharge: 2, total: 20 },
    { hour: 24, sts: 5, tt: 8, rtg: 6, shorePower: 0, reefers: 2, batteryCharge: 3, total: 24 },
  ];

  const gridCapacity = 45; // MW
  const maxLoad = Math.max(...loadData.map(d => d.total));
  const yAxisMax = Math.max(gridCapacity * 0.8, maxLoad * 0.9); // Set max below grid capacity

  const equipmentColors = {
    sts: '#DEF4A1',        // light green
    tt: '#001160',         // dark blue  
    rtg: '#000850',        // navy blue
    shorePower: '#C6F069', // bright green
    reefers: '#EBEBEB',    // grey
    batteryCharge: '#FF69B4' // pink
  };

  const equipmentLabels = {
    sts: 'Ship to Shore Crane (STS)',
    tt: 'Terminal Tractor (TT)', 
    rtg: 'Rubber-Tired Gantry (RTG)',
    shorePower: 'Shore Power',
    reefers: 'Reefer Containers',
    batteryCharge: 'Battery Charging'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{`Hour ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {equipmentLabels[entry.dataKey as keyof typeof equipmentLabels]}: {entry.value} MW
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={loadData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey="hour" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              domain={[0, yAxisMax]}
              label={{ value: 'Load (MW)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="rect"
            />
            
            {/* Grid capacity reference line - thin line */}
            <ReferenceLine 
              y={gridCapacity} 
              stroke="#FF69B4" 
              strokeWidth={1}
              strokeDasharray="5 5"
              label="Grid Capacity (45 MW)"
            />
            
            {/* Stacked areas - order matters for stacking */}
            <Area 
              type="monotone" 
              dataKey="sts" 
              stackId="1"
              stroke={equipmentColors.sts} 
              fill={equipmentColors.sts}
              name={equipmentLabels.sts}
            />
            <Area 
              type="monotone" 
              dataKey="tt" 
              stackId="1"
              stroke={equipmentColors.tt} 
              fill={equipmentColors.tt}
              name={equipmentLabels.tt}
            />
            <Area 
              type="monotone" 
              dataKey="rtg" 
              stackId="1"
              stroke={equipmentColors.rtg} 
              fill={equipmentColors.rtg}
              name={equipmentLabels.rtg}
            />
            <Area 
              type="monotone" 
              dataKey="shorePower" 
              stackId="1"
              stroke={equipmentColors.shorePower} 
              fill={equipmentColors.shorePower}
              name={equipmentLabels.shorePower}
            />
            <Area 
              type="monotone" 
              dataKey="reefers" 
              stackId="1"
              stroke={equipmentColors.reefers} 
              fill={equipmentColors.reefers}
              name={equipmentLabels.reefers}
            />
            <Area 
              type="monotone" 
              dataKey="batteryCharge" 
              stackId="1"
              stroke={equipmentColors.batteryCharge} 
              fill={equipmentColors.batteryCharge}
              name={equipmentLabels.batteryCharge}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoadProfileChart;