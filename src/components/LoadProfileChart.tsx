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
  sc: number;
  asc: number;
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
      { sts: 10, sc: 12, asc: 8, shorePower: 5, reefers: 5 },
      { sts: 9, sc: 10, asc: 7, shorePower: 5, reefers: 5 },
      { sts: 8, sc: 9, asc: 6, shorePower: 5, reefers: 5 },
      { sts: 8, sc: 9, asc: 6, shorePower: 5, reefers: 5 },
      { sts: 9, sc: 10, asc: 7, shorePower: 5, reefers: 5 },
      { sts: 11, sc: 14, asc: 10, shorePower: 8, reefers: 5 },
      { sts: 13, sc: 16, asc: 12, shorePower: 8, reefers: 5 },
      { sts: 12, sc: 15, asc: 11, shorePower: 8, reefers: 5 },
      { sts: 13, sc: 16, asc: 12, shorePower: 8, reefers: 5 },
      { sts: 14, sc: 14, asc: 13, shorePower: 8, reefers: 5 },
      { sts: 15, sc: 14, asc: 13, shorePower: 9, reefers: 5 },
      { sts: 15, sc: 15, asc: 13, shorePower: 9, reefers: 5 },
      { sts: 14, sc: 16, asc: 13, shorePower: 8, reefers: 5 },
      { sts: 15, sc: 14, asc: 13, shorePower: 8, reefers: 5 },
      { sts: 13, sc: 16, asc: 12, shorePower: 7, reefers: 5 },
      { sts: 11, sc: 14, asc: 10, shorePower: 7, reefers: 5 },
      { sts: 10, sc: 12, asc: 9, shorePower: 7, reefers: 5 },
      { sts: 12, sc: 14, asc: 11, shorePower: 7, reefers: 5 },
      { sts: 10, sc: 12, asc: 9, shorePower: 7, reefers: 5 },
      { sts: 9, sc: 10, asc: 8, shorePower: 7, reefers: 5 },
      { sts: 8, sc: 9, asc: 7, shorePower: 5, reefers: 5 },
      { sts: 8, sc: 9, asc: 7, shorePower: 5, reefers: 5 },
      { sts: 9, sc: 10, asc: 8, shorePower: 5, reefers: 5 },
      { sts: 10, sc: 12, asc: 9, shorePower: 5, reefers: 5 },
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
          sc: Math.round(baseData.sc * (1 + (Math.random() - 0.5) * variation)),
          asc: Math.round(baseData.asc * (1 + (Math.random() - 0.5) * variation)),
          shorePower: Math.round(baseData.shorePower * (1 + (Math.random() - 0.5) * variation)),
          reefers: Math.round(baseData.reefers * (1 + (Math.random() - 0.5) * variation)),
        });
      }
    }
    
    return data;
  };

  const loadData = generateLoadData();

  const gridCapacity = 38; // MW
  const maxLoad = Math.max(...loadData.map(d => d.sts + d.sc + d.asc + d.shorePower + d.reefers));
  const yAxisMax = Math.max(gridCapacity * 1.1, maxLoad * 1.2); // Ensure grid capacity line is visible

  const equipmentColors = {
    sts: '#DEF4A1',        // light green
    sc: '#001160',         // dark blue  
    asc: '#000850',        // navy blue
    shorePower: '#C6F069', // bright green
    reefers: '#EBEBEB',    // grey
  };

  const equipmentLabels = {
    sts: 'Ship to Shore Crane (STS)',
    sc: 'Straddle Carrier (SC)', 
    asc: 'Automated Stacking Crane (ASC)',
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
              boscom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey="time" 
              stroke="#666"
              fontSize={11}
              tickLine={true}
              tickFormascer={formatXAxisTick}
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
              verticalAlign="boscom" 
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
            
            {/* Stacked areas - order mascers for stacking */}
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
              dataKey="sc" 
              stackId="1"
              stroke={equipmentColors.sc} 
              fill={equipmentColors.sc}
              name={equipmentLabels.sc}
            />
            <Area 
              type="monotone" 
              dataKey="asc" 
              stackId="1"
              stroke={equipmentColors.asc} 
              fill={equipmentColors.asc}
              name={equipmentLabels.asc}
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