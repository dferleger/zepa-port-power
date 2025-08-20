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
  bessCharge: number;
  bessDischarge: number;
  totalLoad: number;
  dischargeOverlayTop: number;
  dischargeOverlayBottom: number;
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
      { sc: 1, sts: 3, asc: 1, shorePower: 27, reefers: 4.42, lights: 1.3, bessCharge: 0.28 },
      { sc: 2, sts: 1, asc: 3, shorePower: 28, reefers: 4.47, lights: 1.3, bessCharge: 0 },
      { sc: 2, sts: 2, asc: 2, shorePower: 23, reefers: 4.24, lights: 1.3, bessCharge: 3.46 },
      { sc: 0, sts: 3, asc: 0, shorePower: 29, reefers: 4.16, lights: 1.3, bessCharge: 0.54 },
      { sc: 0, sts: 5, asc: 1, shorePower: 23, reefers: 4.45, lights: 1.3, bessCharge: 3.25 },
      { sc: 1, sts: 4, asc: 4, shorePower: 23, reefers: 4.59, lights: 1.3, bessCharge: 0.11 },
      { sc: 3, sts: 5, asc: 1, shorePower: 25, reefers: 4.21, lights: 1.3, bessCharge: 0 },
      { sc: 4, sts: 1, asc: 4, shorePower: 27, reefers: 4.2, lights: 1.3, bessCharge: 0 },
      { sc: 0, sts: 2, asc: 3, shorePower: 30, reefers: 4.86, lights: 0, bessCharge: 0 },
      { sc: 3, sts: 2, asc: 1, shorePower: 30, reefers: 4.65, lights: 0, bessCharge: 0 },
      { sc: 0, sts: 4, asc: 4, shorePower: 23, reefers: 4.03, lights: 0, bessCharge: 2.97 },
      { sc: 2, sts: 5, asc: 2, shorePower: 26, reefers: 4.83, lights: 0, bessCharge: 0 },
      { sc: 1, sts: 3, asc: 3, shorePower: 29, reefers: 5, lights: 0, bessCharge: 0 },
      { sc: 4, sts: 0, asc: 0, shorePower: 21, reefers: 4.69, lights: 0, bessCharge: 8.31 },
      { sc: 2, sts: 1, asc: 2, shorePower: 28, reefers: 4.83, lights: 0, bessCharge: 0.17 },
      { sc: 2, sts: 3, asc: 0, shorePower: 28, reefers: 4.92, lights: 0, bessCharge: 0.08 },
      { sc: 2, sts: 5, asc: 2, shorePower: 24, reefers: 4.77, lights: 0, bessCharge: 0.23 },
      { sc: 3, sts: 1, asc: 2, shorePower: 24, reefers: 4.13, lights: 0, bessCharge: 3.87 },
      { sc: 0, sts: 3, asc: 3, shorePower: 23, reefers: 4.16, lights: 0, bessCharge: 4.84 },
      { sc: 2, sts: 5, asc: 3, shorePower: 26, reefers: 4.71, lights: 1.3, bessCharge: 0 },
      { sc: 4, sts: 4, asc: 4, shorePower: 26, reefers: 4.81, lights: 1.3, bessCharge: 0 },
      { sc: 1, sts: 5, asc: 0, shorePower: 24, reefers: 4.41, lights: 1.3, bessCharge: 2.29 },
      { sc: 3, sts: 5, asc: 1, shorePower: 21, reefers: 4.03, lights: 1.3, bessCharge: 2.67 },
      { sc: 2, sts: 4, asc: 3, shorePower: 27, reefers: 4.28, lights: 1.3, bessCharge: 0 },
    ];

    // BESS Discharge hourly values provided by user
    const bessDischargeValues = [0, 1.77, 0, 0, 0, 0, 1.51, 3.5, 1.86, 2.65, 0, 1.83, 3, 0, 0, 0, 0, 0, 0, 4.01, 6.11, 0, 0, 3.58, 3.31];

    const data: LoadData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const hourData = hourlyData[hour];
        
        // Add slight variation (±5%) to base values for 15-min intervals
        const variation = 0.05;
        
        const sc = Math.max(0, Math.round(hourData.sc * (1 + (Math.random() - 0.5) * variation)));
        const sts = Math.max(0, Math.round(hourData.sts * (1 + (Math.random() - 0.5) * variation)));
        const asc = Math.max(0, Math.round(hourData.asc * (1 + (Math.random() - 0.5) * variation)));
        const shorePower = Math.round(hourData.shorePower * (1 + (Math.random() - 0.5) * variation));
        const reefers = Math.round(hourData.reefers * (1 + (Math.random() - 0.5) * variation) * 100) / 100;
        const lights = Math.round(hourData.lights * (1 + (Math.random() - 0.5) * variation) * 100) / 100;
        const bessCharge = Math.round(hourData.bessCharge * (1 + (Math.random() - 0.5) * variation) * 100) / 100;
        const bessDischarge = hour < bessDischargeValues.length ? bessDischargeValues[hour] : 0;
        
        // Calculate total load (excluding BESS discharge) for overlay positioning
        const totalLoad = sc + sts + asc + shorePower + reefers + lights + bessCharge;
        
        data.push({
          time,
          sc,
          sts,
          asc,
          shorePower,
          reefers,
          lights,
          bessCharge,
          bessDischarge,
          totalLoad,
          dischargeOverlayTop: totalLoad,
          dischargeOverlayBottom: Math.max(0, totalLoad - bessDischarge),
        });
      }
    }
    
    return data;
  };

  const loadData = generateLoadData();

  const gridCapacity = 38; // MW
  const maxLoad = Math.max(...loadData.map(d => d.sts + d.sc + d.asc + d.shorePower + d.reefers + d.lights + d.bessCharge));
  const yAxisMax = Math.max(gridCapacity * 1.1, maxLoad * 1.2); // Ensure grid capacity line is visible

  const equipmentColors = {
    sts: '#C8D6E5',        // light blue/gray to match reference
    sc: '#9B8B3A',         // olive/brown-green to match reference  
    asc: '#34495E',        // dark blue/navy to match reference
    shorePower: '#16A085', // teal/dark green to match reference
    reefers: '#A8E6CF',    // light green to match reference
    lights: '#F1C40F',     // yellow to match reference
    bessCharge: '#B19CD9', // light purple/lavender to match reference
    bessDischarge: '#007BFF', // bright blue for better visibility in overlay
  };

  const equipmentLabels = {
    sts: 'Ship to Shore Crane (STS)',
    sc: 'Straddle Carrier (SC)', 
    asc: 'Automated Stacking Crane (ASC)',
    shorePower: 'Shore Power',
    reefers: 'Reefer Containers',
    lights: 'Lighting',
    bessCharge: 'BESS Charge',
    bessDischarge: 'BESS Discharge',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter out transparent overlay elements and entries without valid labels
      const validPayload = payload.filter((entry: any) => 
        entry.dataKey !== 'dischargeOverlayBottom' && 
        equipmentLabels[entry.dataKey as keyof typeof equipmentLabels]
      );
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{`Time: ${label}`}</p>
          {validPayload.map((entry: any, index: number) => (
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
            <defs>
              <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" style={{stroke: '#007BFF', strokeWidth: 1}} />
              </pattern>
            </defs>
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
              payload={
                // Filter out the transparent overlay from legend
                Object.keys(equipmentLabels).map(key => ({
                  value: equipmentLabels[key as keyof typeof equipmentLabels],
                  type: 'rect',
                  color: equipmentColors[key as keyof typeof equipmentColors],
                  dataKey: key
                }))
              }
            />
            
            {/* Grid capacity reference line - red line to match reference */}
            <ReferenceLine 
              y={gridCapacity} 
              stroke="#E74C3C" 
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
              strokeWidth={0}
              name={equipmentLabels.sts}
            />
            <Area 
              type="monotone" 
              dataKey="sc" 
              stackId="1"
              stroke={equipmentColors.sc} 
              fill={equipmentColors.sc}
              strokeWidth={0}
              name={equipmentLabels.sc}
            />
            <Area 
              type="monotone" 
              dataKey="asc" 
              stackId="1"
              stroke={equipmentColors.asc} 
              fill={equipmentColors.asc}
              strokeWidth={0}
              name={equipmentLabels.asc}
            />
            <Area 
              type="monotone" 
              dataKey="shorePower" 
              stackId="1"
              stroke={equipmentColors.shorePower} 
              fill={equipmentColors.shorePower}
              strokeWidth={0}
              name={equipmentLabels.shorePower}
            />
            <Area 
              type="monotone" 
              dataKey="reefers" 
              stackId="1"
              stroke={equipmentColors.reefers} 
              fill={equipmentColors.reefers}
              strokeWidth={0}
              name={equipmentLabels.reefers}
            />
            <Area 
              type="monotone" 
              dataKey="lights" 
              stackId="1"
              stroke={equipmentColors.lights} 
              fill={equipmentColors.lights}
              strokeWidth={0}
              name={equipmentLabels.lights}
            />
            <Area 
              type="monotone" 
              dataKey="bessCharge" 
              stackId="1"
              stroke={equipmentColors.bessCharge} 
              fill={equipmentColors.bessCharge}
              strokeWidth={0}
              name={equipmentLabels.bessCharge}
            />
            
            {/* BESS Discharge - Overlay that appears on top of existing stack */}
            {/* First create a transparent area up to the full stack height */}
            <Area 
              type="monotone" 
              dataKey="dischargeOverlayBottom"
              stackId="overlay"
              stroke="transparent" 
              fill="transparent"
              strokeWidth={0}
              legendType="none"
            />
            {/* Then stack the hashed discharge area on top */}
            <Area 
              type="monotone" 
              dataKey="bessDischarge"
              stackId="overlay"
              stroke={equipmentColors.bessDischarge} 
              fill="url(#diagonalHatch)"
              fillOpacity={0.8}
              strokeWidth={2}
              name={equipmentLabels.bessDischarge}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoadProfileChart;