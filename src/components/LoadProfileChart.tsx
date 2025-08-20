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
  lights: number;
}

interface TooltipData {
  equipment: string;
  value: number;
  time: string;
  color: string;
}

const LoadProfileChart: React.FC = () => {
  // Generate 15-minute interval data for 24 hours (96 data points) based on hourly values
  const generateLoadData = (): LoadData[] => {
    const hourlyData = [
      { sc: 1, sts: 3, asc: 1, shorePower: 27, reefers: 4.42, lights: 1.3 },
      { sc: 2, sts: 1, asc: 3, shorePower: 28, reefers: 4.47, lights: 1.3 },
      { sc: 2, sts: 2, asc: 2, shorePower: 23, reefers: 4.24, lights: 1.3 },
      { sc: 0, sts: 3, asc: 0, shorePower: 29, reefers: 4.16, lights: 1.3 },
      { sc: 0, sts: 5, asc: 1, shorePower: 23, reefers: 4.45, lights: 1.3 },
      { sc: 1, sts: 4, asc: 4, shorePower: 23, reefers: 4.59, lights: 1.3 },
      { sc: 3, sts: 5, asc: 1, shorePower: 25, reefers: 4.21, lights: 1.3 },
      { sc: 4, sts: 1, asc: 4, shorePower: 27, reefers: 4.2, lights: 1.3 },
      { sc: 0, sts: 2, asc: 3, shorePower: 30, reefers: 4.86, lights: 0 },
      { sc: 3, sts: 2, asc: 1, shorePower: 30, reefers: 4.65, lights: 0 },
      { sc: 0, sts: 4, asc: 4, shorePower: 23, reefers: 4.03, lights: 0 },
      { sc: 2, sts: 5, asc: 2, shorePower: 26, reefers: 4.83, lights: 0 },
      { sc: 1, sts: 3, asc: 3, shorePower: 29, reefers: 5, lights: 0 },
      { sc: 4, sts: 0, asc: 0, shorePower: 21, reefers: 4.69, lights: 0 },
      { sc: 2, sts: 1, asc: 2, shorePower: 28, reefers: 4.83, lights: 0 },
      { sc: 2, sts: 3, asc: 0, shorePower: 28, reefers: 4.92, lights: 0 },
      { sc: 2, sts: 5, asc: 2, shorePower: 24, reefers: 4.77, lights: 0 },
      { sc: 3, sts: 1, asc: 2, shorePower: 24, reefers: 4.13, lights: 0 },
      { sc: 0, sts: 3, asc: 3, shorePower: 23, reefers: 4.16, lights: 0 },
      { sc: 2, sts: 5, asc: 3, shorePower: 26, reefers: 4.71, lights: 1.3 },
      { sc: 4, sts: 4, asc: 4, shorePower: 26, reefers: 4.81, lights: 1.3 },
      { sc: 1, sts: 5, asc: 0, shorePower: 24, reefers: 4.41, lights: 1.3 },
      { sc: 3, sts: 5, asc: 1, shorePower: 21, reefers: 4.03, lights: 1.3 },
      { sc: 2, sts: 4, asc: 3, shorePower: 27, reefers: 4.28, lights: 1.3 },
    ];

    const data: LoadData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const hourData = hourlyData[hour];
        
        // Add slight variation (±5%) to base values for 15-min intervals
        const variation = 0.05;
        
        data.push({
          time,
          sc: Math.max(0, Math.round(hourData.sc * (1 + (Math.random() - 0.5) * variation))),
          sts: Math.max(0, Math.round(hourData.sts * (1 + (Math.random() - 0.5) * variation))),
          asc: Math.max(0, Math.round(hourData.asc * (1 + (Math.random() - 0.5) * variation))),
          shorePower: Math.round(hourData.shorePower * (1 + (Math.random() - 0.5) * variation)),
          reefers: Math.round(hourData.reefers * (1 + (Math.random() - 0.5) * variation) * 100) / 100,
          lights: Math.round(hourData.lights * (1 + (Math.random() - 0.5) * variation) * 100) / 100,
        });
      }
    }
    
    return data;
  };

  const loadData = generateLoadData();

  // Calculate statistics from the data
  const totalLoads = loadData.map(d => d.sts + d.sc + d.asc + d.shorePower + d.reefers + d.lights);
  const peakLoad = Math.max(...totalLoads);
  const minLoad = Math.min(...totalLoads);
  const averageLoad = totalLoads.reduce((sum, load) => sum + load, 0) / totalLoads.length;
  const peakLoadTime = loadData[totalLoads.indexOf(peakLoad)].time;
  
  // Peak fluctuation (difference between max and min load)
  const peakFluctuation = peakLoad - minLoad;
  
  // Total energy consumption in 24 hours (MW * 0.25h per interval = MWh)
  const totalEnergy = totalLoads.reduce((sum, load) => sum + load * 0.25, 0);
  
  // Individual equipment energy totals
  const equipmentEnergy = {
    sts: loadData.reduce((sum, d) => sum + d.sts * 0.25, 0),
    sc: loadData.reduce((sum, d) => sum + d.sc * 0.25, 0),
    asc: loadData.reduce((sum, d) => sum + d.asc * 0.25, 0),
    shorePower: loadData.reduce((sum, d) => sum + d.shorePower * 0.25, 0),
    reefers: loadData.reduce((sum, d) => sum + d.reefers * 0.25, 0),
    lights: loadData.reduce((sum, d) => sum + d.lights * 0.25, 0),
  };
  
  // Load factor (average load / peak load)
  const loadFactor = (averageLoad / peakLoad) * 100;

  const gridCapacity = 38; // MW
  const yAxisMax = Math.max(gridCapacity * 1.1, peakLoad * 1.2); // Ensure grid capacity line is visible

  const equipmentColors = {
    sts: '#DEF4A1',        // light green
    sc: '#001160',         // dark blue  
    asc: '#FF69B4',        // hot pink
    shorePower: '#FF8C00', // dark orange
    reefers: '#EBEBEB',    // grey
    lights: '#FFD700',     // gold
  };

  const equipmentLabels = {
    sts: 'Ship to Shore Crane (STS)',
    sc: 'Straddle Carrier (SC)', 
    asc: 'Automated Stacking Crane (ASC)',
    shorePower: 'Shore Power',
    reefers: 'Reefer Containers',
    lights: 'Lighting',
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
    // Show labels only at the top of each hour, display just the hour number
    if (value.endsWith(':00')) {
      const hour = parseInt(value.split(':')[0]);
      return hour.toString();
    }
    return '';
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
              axisLine={true}
              interval={0}
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 10 }}
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
              height={50}
              iconType="rect"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
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
            <Area 
              type="monotone" 
              dataKey="lights" 
              stackId="1"
              stroke={equipmentColors.lights} 
              fill={equipmentColors.lights}
              name={equipmentLabels.lights}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistics Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Peak Load</h3>
          <p className="text-2xl font-bold text-gray-900">{peakLoad.toFixed(1)} MW</p>
          <p className="text-xs text-gray-500">at {peakLoadTime}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Energy Usage (24hr)</h3>
          <p className="text-2xl font-bold text-gray-900">{totalEnergy.toFixed(1)} MWh</p>
          <p className="text-xs text-gray-500">total consumption</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Peak Fluctuation</h3>
          <p className="text-2xl font-bold text-gray-900">{peakFluctuation.toFixed(1)} MW</p>
          <p className="text-xs text-gray-500">max - min load</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Load Factor</h3>
          <p className="text-2xl font-bold text-gray-900">{loadFactor.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">avg/peak ratio</p>
        </div>
      </div>
      
      {/* Equipment Energy Breakdown */}
      <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Energy Consumption by Equipment (24hr)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(equipmentEnergy).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="w-4 h-4 rounded mx-auto mb-1" 
                style={{ backgroundColor: equipmentColors[key as keyof typeof equipmentColors] }}
              />
              <p className="text-xs text-gray-600">{equipmentLabels[key as keyof typeof equipmentLabels]}</p>
              <p className="text-sm font-semibold">{value.toFixed(1)} MWh</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadProfileChart;