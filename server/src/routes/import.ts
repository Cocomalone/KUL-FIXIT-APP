import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { parseFile, executeImport } from '../services/importService';

const router = Router();

// Step 1: Upload file and get column preview
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  try {
    const preview = await parseFile(req.file.path);
    res.json({ ...preview, filePath: req.file.path });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Step 2: Execute import with column mapping
router.post('/execute', async (req: Request, res: Response) => {
  const { filePath, mapping } = req.body;
  if (!filePath || !mapping) {
    res.status(400).json({ error: 'filePath and mapping are required' });
    return;
  }
  try {
    const result = await executeImport(filePath, mapping);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
