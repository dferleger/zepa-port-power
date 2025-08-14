import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
  const [hoveredData, setHoveredData] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Sample load data for 24 hours
  const loadData: LoadData[] = useMemo(() => [
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
  ], []);

  const gridCapacity = 45; // MW
  const maxLoad = Math.max(...loadData.map(d => d.total));

  const equipmentColors = {
    sts: '#DEF4A1',        // light green
    tt: '#001160',         // dark blue  
    rtg: '#000850',        // navy blue
    shorePower: '#DEF4A1', // light green
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

  // Create nodes for the chart
  const nodes: Node[] = useMemo(() => {
    const chartNodes: Node[] = [];
    const chartWidth = 800;
    const chartHeight = 400;
    const paddingX = 60;
    const paddingY = 60;
    const plotWidth = chartWidth - 2 * paddingX;
    const plotHeight = chartHeight - 2 * paddingY;

    // Add background chart area
    chartNodes.push({
      id: 'chart-background',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { label: '' },
      style: {
        width: chartWidth,
        height: chartHeight,
        backgroundColor: 'white',
        border: '2px solid hsl(var(--border))',
        borderRadius: '8px',
        zIndex: 0,
      },
      draggable: false,
      selectable: false,
    });

    // Add grid lines
    for (let i = 0; i <= 5; i++) {
      const y = paddingY + (plotHeight * i) / 5;
      const value = maxLoad - (maxLoad * i) / 5;
      
      // Horizontal grid line
      chartNodes.push({
        id: `grid-h-${i}`,
        type: 'default',
        position: { x: paddingX, y: y - 1 },
        data: { label: '' },
        style: {
          width: plotWidth,
          height: 1,
          backgroundColor: '#E5E5E5',
          border: 'none',
        },
        draggable: false,
        selectable: false,
      });

      // Y-axis label
      chartNodes.push({
        id: `y-label-${i}`,
        type: 'default',
        position: { x: 10, y: y - 10 },
        data: { label: Math.round(value).toString() },
        style: {
          width: 40,
          height: 20,
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '12px',
          color: '#666',
        },
        draggable: false,
        selectable: false,
      });
    }

    // Add vertical grid lines and X-axis labels
    for (let i = 0; i <= 24; i += 4) {
      const x = paddingX + (plotWidth * i) / 24;
      
      if (i > 0) {
        chartNodes.push({
          id: `grid-v-${i}`,
          type: 'default',
          position: { x: x - 1, y: paddingY },
          data: { label: '' },
          style: {
            width: 1,
            height: plotHeight,
            backgroundColor: '#E5E5E5',
            border: 'none',
          },
          draggable: false,
          selectable: false,
        });
      }

      // X-axis label
      chartNodes.push({
        id: `x-label-${i}`,
        type: 'default',
        position: { x: x - 10, y: chartHeight - 40 },
        data: { label: i === 0 ? '0' : i.toString() },
        style: {
          width: 20,
          height: 20,
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '12px',
          color: '#666',
        },
        draggable: false,
        selectable: false,
      });
    }

    // Add data bars
    loadData.forEach((data, index) => {
      const x = paddingX + (plotWidth * index) / 24;
      const barWidth = plotWidth / 24 * 0.8;
      
      let cumulativeHeight = 0;
      const equipmentOrder = ['sts', 'tt', 'rtg', 'shorePower', 'reefers', 'batteryCharge'];
      
      equipmentOrder.forEach((equipment) => {
        const value = data[equipment as keyof LoadData] as number;
        if (value > 0) {
          const segmentHeight = (plotHeight * value) / maxLoad;
          const y = paddingY + plotHeight - cumulativeHeight - segmentHeight;
          
          chartNodes.push({
            id: `bar-${index}-${equipment}`,
            type: 'default',
            position: { x, y },
            data: { 
              label: '',
              equipment,
              value,
              hour: data.hour,
              color: equipmentColors[equipment as keyof typeof equipmentColors]
            },
            style: {
              width: barWidth,
              height: segmentHeight,
              backgroundColor: equipmentColors[equipment as keyof typeof equipmentColors],
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '0px',
              cursor: 'pointer',
            },
            draggable: false,
            selectable: false,
          });
          
          cumulativeHeight += segmentHeight;
        }
      });
    });

    // Add grid capacity line
    const gridCapacityY = paddingY + plotHeight - (plotHeight * gridCapacity) / maxLoad;
    chartNodes.push({
      id: 'grid-capacity-line',
      type: 'default',
      position: { x: paddingX, y: gridCapacityY - 2 },
      data: { label: '' },
      style: {
        width: plotWidth,
        height: 4,
        backgroundColor: '#FF69B4',
        border: 'none',
        borderRadius: '2px',
        zIndex: 10,
      },
      draggable: false,
      selectable: false,
    });

    // Grid capacity label
    chartNodes.push({
      id: 'grid-capacity-label',
      type: 'default',
      position: { x: paddingX + plotWidth - 120, y: gridCapacityY - 25 },
      data: { label: `Grid Capacity: ${gridCapacity} MW` },
      style: {
        width: 120,
        height: 20,
        backgroundColor: 'rgba(255, 105, 180, 0.9)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '2px 4px',
      },
      draggable: false,
      selectable: false,
    });

    // Add axis labels
    chartNodes.push({
      id: 'x-axis-title',
      type: 'default',
      position: { x: chartWidth / 2 - 30, y: chartHeight - 15 },
      data: { label: 'Time (Hours)' },
      style: {
        width: 80,
        height: 20,
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
      },
      draggable: false,
      selectable: false,
    });

    chartNodes.push({
      id: 'y-axis-title',
      type: 'default',
      position: { x: 15, y: 20 },
      data: { label: 'Load (MW)' },
      style: {
        width: 80,
        height: 20,
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        transform: 'rotate(-90deg)',
        transformOrigin: 'center',
      },
      draggable: false,
      selectable: false,
    });

    return chartNodes;
  }, [loadData, maxLoad, gridCapacity]);

  const handleNodeMouseEnter = (event: React.MouseEvent, node: Node) => {
    if (node.id.startsWith('bar-')) {
      const { equipment, value, hour, color } = node.data;
      setHoveredData({
        equipment: equipmentLabels[equipment as keyof typeof equipmentLabels],
        value: value as number,
        hour: hour as number,
        color: color as string,
      });
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleNodeMouseLeave = () => {
    setHoveredData(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="relative">
      <div style={{ width: '100%', height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={[]}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onMouseMove={handleMouseMove}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Tooltip */}
      {hoveredData && (
        <div
          className="absolute z-50 bg-white p-3 rounded-lg shadow-lg border pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: hoveredData.color }}
            />
            <span className="font-semibold text-sm">{hoveredData.equipment}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Hour {hoveredData.hour}: <span className="font-medium">{hoveredData.value} MW</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {Object.entries(equipmentLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: equipmentColors[key as keyof typeof equipmentColors] }}
            />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadProfileChart;