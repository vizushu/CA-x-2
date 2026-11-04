# Rip current model — training checkpoints (backup)

Backup of an in-progress YOLOv8n-seg rip current segmentation model, trained on the
Dumitriu et al. CVPR 2023 dataset (https://github.com/Irikos/rip_currents). That repo
has no license file, so treat these weights as research-only until that is clarified.

- `last.pt` — latest checkpoint (resume with `YOLO('last.pt').train(resume=True)` after fixing paths in its args)
- `best.pt` — best validation checkpoint so far
- `results.csv`, `args.yaml` — training log and settings
- `prep/` — dataset prep: labels keep only polygon lines (class 1 → 0); 90/10 random split

- `rip-yolov8n-seg-416-int8.onnx` — final model (epoch 25) for the browser, 3.7 MB; `rip.js` runs it with onnxruntime-web

Final held-out results (378 photos, random split): mask mAP50 0.915, precision 0.88, recall 0.82. At conf 0.4: 83% of rip photos flagged, 0/132 no-rip photos falsely flagged.
