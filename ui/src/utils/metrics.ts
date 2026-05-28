import type { AggregateMetrics, Detection } from "../types";

/**
 * Compute the aggregate metrics shown on the right-side panel.
 *
 * Cell Stress Index (per project spec, page 14 area):
 *   CSI = (abnormal / total) * meanConfidence
 *
 * Cell Health Score = 100 - CSI (clamped).
 */
export function aggregate(detections: Detection[]): AggregateMetrics {
  const total = detections.length;
  if (total === 0) {
    return {
      total: 0,
      normal: 0,
      dividing: 0,
      abnormal: 0,
      meanConfidence: 0,
      csi: 0,
      healthScore: 100,
      status: "healthy",
    };
  }

  let normal = 0;
  let dividing = 0;
  let abnormal = 0;
  let sumConf = 0;
  for (const d of detections) {
    sumConf += d.confidence;
    if (d.cls === "normal") normal++;
    else if (d.cls === "dividing") dividing++;
    else abnormal++;
  }
  const meanConfidence = sumConf / total;
  const csiRaw = (abnormal / total) * meanConfidence;
  const csi = +(csiRaw * 100).toFixed(1);
  const healthScore = +Math.max(0, 100 - csi).toFixed(1);

  let status: AggregateMetrics["status"] = "healthy";
  if (csi >= 25) status = "risk";
  else if (csi >= 10) status = "moderate";

  return {
    total,
    normal,
    dividing,
    abnormal,
    meanConfidence,
    csi,
    healthScore,
    status,
  };
}

export const CLASS_COLOR: Record<Detection["cls"], string> = {
  normal: "#34d399",
  dividing: "#22d3ee",
  abnormal: "#fb7185",
};

export const CLASS_LABEL: Record<Detection["cls"], string> = {
  normal: "Normal",
  dividing: "Mitosis",
  abnormal: "Abnormal",
};
