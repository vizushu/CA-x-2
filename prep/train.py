from ultralytics import YOLO
import sys
m = YOLO('yolov8n-seg.pt')
m.train(data='ds/data.yaml', epochs=int(sys.argv[1]), imgsz=416, batch=16, device='cpu', workers=4, project='runs', name='rip25', exist_ok=True, plots=False, patience=50, fraction=float(sys.argv[2]) if len(sys.argv)>2 else 1.0)
