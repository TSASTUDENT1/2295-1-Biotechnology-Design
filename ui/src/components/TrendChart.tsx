import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  t: number;
  csi: number;
  health: number;
}

interface Props {
  data: TrendPoint[];
}

export function TrendChart({ data }: Props) {
  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title">Cell Stress Index · 60s Window</span>
        <div className="flex items-center gap-3">
          <LegendDot color="#fb7185" label="CSI" />
          <LegendDot color="#34d399" label="HEALTH" />
        </div>
      </div>
      <div className="h-[calc(100%-44px)] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="g-csi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-h" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1c2c45" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              hide
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={26}
            />
            <Tooltip
              contentStyle={{
                background: "#0a1320",
                border: "1px solid #1c2c45",
                borderRadius: 8,
                fontFamily: "JetBrains Mono",
                fontSize: 11,
                color: "#e2e8f0",
              }}
              labelFormatter={() => ""}
            />
            <Area
              type="monotone"
              dataKey="health"
              stroke="#34d399"
              strokeWidth={1.5}
              fill="url(#g-h)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="csi"
              stroke="#fb7185"
              strokeWidth={1.8}
              fill="url(#g-csi)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="mono flex items-center gap-1.5 text-[9.5px] tracking-[0.22em] text-slate-400">
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </div>
  );
}
