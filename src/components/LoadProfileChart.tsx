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
  time: string;
  sts: number;
  tt: number;
  rtg: number;
  shorePower: number;
  reefers: number;
}

interface TooltipData {
  equipment: string;
  value: number;
  time: string;
  color: string;
}

const LoadProfileChart: React.FC = () => {
  // Generate 15-minute interval data for 24 hours (96 data points)
  const generateLoadData = (): LoadData[] => {
    const data: LoadData[] = [];
    const baseHourlyData = [
      { sts: 10, tt: 12, rtg: 8, shorePower: 5, reefers: 5 },
      { sts: 9, tt: 10, rtg: 7, shorePower: 5, reefers: 5 },
      { sts: 8, tt: 9, rtg: 6, shorePower: 5, reefers: 5 },
      { sts: 8, tt: 9, rtg: 6, shorePower: 5, reefers: 5 },
      { sts: 9, tt: 10, rtg: 7, shorePower: 5, reefers: 5 },
      { sts: 11, tt: 14, rtg: 10, shorePower: 8, reefers: 5 },
      { sts: 13, tt: 16, rtg: 12, shorePower: 8, reefers: 5 },
      { sts: 12, tt: 15, rtg: 11, shorePower: 8, reefers: 5 },
      { sts: 13, tt: 16, rtg: 12, shorePower: 8, reefers: 5 },
      { sts: 14, tt: 14, rtg: 13, shorePower: 8, reefers: 5 },
      { sts: 15, tt: 14, rtg: 13, shorePower: 9, reefers: 5 },
      { sts: 15, tt: 15, rtg: 13, shorePower: 9, reefers: 5 },
      { sts: 14, tt: 16, rtg: 13, shorePower: 8, reefers: 5 },
      { sts: 15, tt: 14, rtg: 13, shorePower: 8, reefers: 5 },
      { sts: 13, tt: 16, rtg: 12, shorePower: 7, reefers: 5 },
      { sts: 11, tt: 14, rtg: 10, shorePower: 7, reefers: 5 },
      { sts: 10, tt: 12, rtg: 9, shorePower: 7, reefers: 5 },
      { sts: 12, tt: 14, rtg: 11, shorePower: 7, reefers: 5 },
      { sts: 10, tt: 12, rtg: 9, shorePower: 7, reefers: 5 },
      { sts: 9, tt: 10, rtg: 8, shorePower: 7, reefers: 5 },
      { sts: 8, tt: 9, rtg: 7, shorePower: 5, reefers: 5 },
      { sts: 8, tt: 9, rtg: 7, shorePower: 5, reefers: 5 },
      { sts: 9, tt: 10, rtg: 8, shorePower: 5, reefers: 5 },
      { sts: 10, tt: 12, rtg: 9, shorePower: 5, reefers: 5 },
    ];

    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Add slight variation to base values for realism
        const baseData = baseHourlyData[hour];
        const variation = 0.2; // ±20% variation
        
        data.push({
          time,
          sts: Math.round(baseData.sts * (1 + (Math.random() - 0.5) * variation)),
          tt: Math.round(baseData.tt * (1 + (Math.random() - 0.5) * variation)),
          rtg: Math.round(baseData.rtg * (1 + (Math.random() - 0.5) * variation)),
          shorePower: Math.round(baseData.shorePower * (1 + (Math.random() - 0.5) * variation)),
          reefers: Math.round(baseData.reefers * (1 + (Math.random() - 0.5) * variation)),
        });
      }
    }
    
    return data;
  };

  const loadData = generateLoadData();

  const gridCapacity = 52; // MW
  const maxLoad = Math.max(...loadData.map(d => d.sts + d.tt + d.rtg + d.shorePower + d.reefers));
  const yAxisMax = Math.max(gridCapacity * 1.1, maxLoad * 1.2); // Ensure grid capacity line is visible

  const equipmentColors = {
    sts: '#DEF4A1',        // light green
    tt: '#001160',         // dark blue  
    rtg: '#000850',        // navy blue
    shorePower: '#C6F069', // bright green
    reefers: '#EBEBEB',    // grey
  };

  const equipmentLabels = {
    sts: 'Ship to Shore Crane (STS)',
    tt: 'Terminal Tractor (TT)', 
    rtg: 'Rubber-Tired Gantry (RTG)',
    shorePower: 'Shore Power',
    reefers: 'Reefer Containers',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{`Time: ${label}`}</p>
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

  const formatXAxisTick = (value: string) => {
    // Show labels only at the top of each hour
    return value.endsWith(':00') ? value : '';
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
              dataKey="time" 
              stroke="#666"
              fontSize={11}
              tickLine={true}
              tickFormatter={formatXAxisTick}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10 }}
              tickSize={3}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              domain={[0, 70]}
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
              strokeWidth={2}
              strokeDasharray="5 5"
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoadProfileChart;