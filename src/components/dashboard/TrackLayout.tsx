import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Train {
  id: string;
  name: string;
  status: 'on-time' | 'delayed' | 'conflict';
  currentLocation: string;
  delay: number;
  nextStation: string;
  eta: string;
}

interface TrackLayoutProps {
  trains: Train[];
}

export function TrackLayout({ trains }: TrackLayoutProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Track sections with their occupancy status
  const trackSections = [
    { id: 'AB', name: 'Section A-B', occupied: trains.some(t => t.currentLocation.includes('AB')) },
    { id: 'BC', name: 'Section B-C', occupied: trains.some(t => t.currentLocation.includes('BC')) },
    { id: 'CD', name: 'Section C-D', occupied: trains.some(t => t.currentLocation.includes('CD')) },
    { id: 'DE', name: 'Section D-E', occupied: false },
  ];

  const stations = [
    { id: 'A', name: 'Station A', position: { x: 50, y: 200 } },
    { id: 'B', name: 'Station B', position: { x: 200, y: 200 } },
    { id: 'C', name: 'Station C', position: { x: 350, y: 200 } },
    { id: 'D', name: 'Station D', position: { x: 500, y: 200 } },
    { id: 'E', name: 'Station E', position: { x: 650, y: 200 } },
  ];

  const getTrainInSection = (sectionId: string) => {
    return trains.find(t => t.currentLocation.includes(sectionId));
  };

  const getSectionColor = (sectionId: string, occupied: boolean) => {
    if (selectedSection === sectionId) return 'hsl(var(--accent))';
    if (occupied) {
      const train = getTrainInSection(sectionId);
      if (train?.status === 'conflict') return 'hsl(var(--destructive))';
      if (train?.status === 'delayed') return 'hsl(var(--warning))';
      return 'hsl(var(--track-occupied))';
    }
    return 'hsl(var(--track-clear))';
  };

  return (
    <div className="w-full h-80 relative bg-card/30 rounded-lg border border-border/30 p-4">
      <svg className="w-full h-full" viewBox="0 0 700 300">
        {/* Background grid */}
        <defs>
          <pattern id="trackGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#trackGrid)" />

        {/* Main track line */}
        <line 
          x1="30" 
          y1="200" 
          x2="670" 
          y2="200" 
          stroke="hsl(var(--track-line))" 
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Track sections */}
        {trackSections.map((section, index) => {
          const x1 = 50 + (index * 150);
          const x2 = x1 + 150;
          const occupied = section.occupied;
          
          return (
            <g key={section.id}>
              {/* Section line */}
              <line
                x1={x1}
                y1="200"
                x2={x2}
                y2="200"
                stroke={getSectionColor(section.id, occupied)}
                strokeWidth="6"
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedSection(
                  selectedSection === section.id ? null : section.id
                )}
              />
              
              {/* Section label */}
              <text
                x={x1 + 75}
                y="185"
                textAnchor="middle"
                className="text-xs fill-muted-foreground font-medium pointer-events-none"
              >
                {section.name}
              </text>

              {/* Occupancy indicator */}
              {occupied && (
                <>
                  <circle
                    cx={x1 + 75}
                    cy="200"
                    r="8"
                    fill={getSectionColor(section.id, occupied)}
                    className="animate-pulse"
                  />
                  <circle
                    cx={x1 + 75}
                    cy="200"
                    r="12"
                    fill="none"
                    stroke={getSectionColor(section.id, occupied)}
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Stations */}
        {stations.map((station) => (
          <g key={station.id}>
            {/* Station platform */}
            <rect
              x={station.position.x - 15}
              y={station.position.y - 25}
              width="30"
              height="50"
              fill="hsl(var(--secondary))"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              rx="4"
              className="cursor-pointer hover:fill-secondary/80 transition-colors"
            />
            
            {/* Station circle */}
            <circle
              cx={station.position.x}
              cy={station.position.y}
              r="6"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
            
            {/* Station label */}
            <text
              x={station.position.x}
              y={station.position.y + 45}
              textAnchor="middle"
              className="text-sm font-semibold fill-foreground"
            >
              {station.name}
            </text>
          </g>
        ))}

        {/* Signal indicators at stations */}
        {stations.slice(1, -1).map((station) => (
          <g key={`signal-${station.id}`}>
            <circle
              cx={station.position.x - 25}
              cy={station.position.y - 40}
              r="4"
              fill="hsl(var(--signal-green))"
              className="animate-pulse"
            />
            <circle
              cx={station.position.x}
              cy={station.position.y - 40}
              r="4"
              fill="hsl(var(--signal-yellow))"
              opacity="0.3"
            />
            <circle
              cx={station.position.x + 25}
              cy={station.position.y - 40}
              r="4"
              fill="hsl(var(--signal-red))"
              opacity="0.3"
            />
          </g>
        ))}

        {/* Loop line at Station B */}
        <path
          d="M 200 170 Q 230 140 260 170 Q 230 200 200 170"
          fill="none"
          stroke="hsl(var(--track-line))"
          strokeWidth="4"
          strokeDasharray="5,5"
          opacity="0.7"
        />
        
        {/* Loop line label */}
        <text
          x="230"
          y="135"
          textAnchor="middle"
          className="text-xs fill-muted-foreground font-medium"
        >
          Loop Line
        </text>
      </svg>

      {/* Track section info panel */}
      <div className="absolute top-4 left-4 space-y-2">
        {trackSections.map((section) => {
          const train = getTrainInSection(section.id);
          const isSelected = selectedSection === section.id;
          
          return (
            <div
              key={section.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
                ${isSelected 
                  ? 'bg-accent/20 border border-accent/50 shadow-glow-accent' 
                  : 'bg-card/60 border border-border/30 hover:bg-card/80'
                }`}
              onClick={() => setSelectedSection(
                selectedSection === section.id ? null : section.id
              )}
            >
              <div 
                className={`w-3 h-3 rounded-full transition-colors ${
                  section.occupied ? 'bg-track-occupied animate-pulse' : 'bg-track-clear'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">
                  {section.name}
                </div>
                {train && (
                  <div className="text-xs text-muted-foreground truncate">
                    {train.id} - {train.name}
                  </div>
                )}
              </div>
              
              {section.occupied && train && (
                <Badge 
                  variant={train.status === 'on-time' ? 'default' : 
                          train.status === 'delayed' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {train.status === 'delayed' ? `+${train.delay}m` : 
                   train.status === 'conflict' ? 'Conflict' : 'Active'}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card/80 border border-border/50 rounded-lg p-3 space-y-2">
        <div className="text-xs font-semibold text-foreground mb-2">Legend</div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-track-clear" />
          <span className="text-xs text-muted-foreground">Clear Track</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-track-occupied animate-pulse" />
          <span className="text-xs text-muted-foreground">Occupied</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs text-muted-foreground">Conflict Zone</span>
        </div>
      </div>
    </div>
  );
}