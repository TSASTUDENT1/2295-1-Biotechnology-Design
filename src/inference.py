"""
inference.py — YOLOv5n inference on the Hailo-10H NPU via HailoRT 5.x.

Detection output per frame:
  [{"class": "normal"|"dividing"|"abnormal", "confidence": float, "bbox": [x1,y1,x2,y2]}, ...]
  bbox coordinates are absolute pixels in the original frame dimensions.
"""

import numpy as np
from hailo_platform import VDevice, FormatType

CLASS_LABELS = {0: "normal", 1: "dividing", 2: "abnormal"}
NUM_CLASSES = 3

INPUT_WIDTH = 640
INPUT_HEIGHT = 640
CONFIDENCE_THRESHOLD = 0.35

# Hailo NMS buffer layout: NUM_CLASSES × (1 count + MAX_DETS × 5 bbox+score)
# shape=[1503] → 1503/3=501 per class → (501-1)/5=100 max detections per class
_ELEMENTS_PER_CLASS = 501
_MAX_DETS_PER_CLASS = 100


class Inference:
    def __init__(self, hef_path: str):
        self._target = VDevice()
        self._infer_model = self._target.create_infer_model(hef_path)
        self._infer_model.set_batch_size(1)
        self._infer_model.input().set_format_type(FormatType.FLOAT32)
        self._configured = self._infer_model.configure()
        self._output_name = self._infer_model.output_names[0]

    def run(self, frame: np.ndarray) -> list[dict]:
        h, w = frame.shape[:2]
        preprocessed = self._preprocess(frame)

        bindings = self._configured.create_bindings()
        bindings.input().set_buffer(preprocessed)

        output_buffer = np.empty(_ELEMENTS_PER_CLASS * NUM_CLASSES, dtype=np.float32)
        bindings.output(self._output_name).set_buffer(output_buffer)

        self._configured.run([bindings], timeout=1000)
        return self._postprocess(output_buffer, orig_w=w, orig_h=h)

    def _preprocess(self, frame: np.ndarray) -> np.ndarray:
        import cv2
        resized = cv2.resize(frame, (INPUT_WIDTH, INPUT_HEIGHT))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        normalized = rgb.astype(np.float32) / 255.0
        return normalized[np.newaxis, ...]

    def _postprocess(self, buf: np.ndarray, orig_w: int, orig_h: int) -> list[dict]:
        detections = []
        for cls_id in range(NUM_CLASSES):
            offset = cls_id * _ELEMENTS_PER_CLASS
            count = int(buf[offset])
            for i in range(min(count, _MAX_DETS_PER_CLASS)):
                base = offset + 1 + i * 5
                y1, x1, y2, x2 = buf[base:base + 4]
                score = float(buf[base + 4])
                if score < CONFIDENCE_THRESHOLD:
                    continue
                detections.append({
                    "class": CLASS_LABELS[cls_id],
                    "confidence": score,
                    "bbox": [
                        int(x1 * orig_w), int(y1 * orig_h),
                        int(x2 * orig_w), int(y2 * orig_h),
                    ],
                })
        return detections

    def close(self) -> None:
        del self._configured
        del self._infer_model
        self._target.release()
