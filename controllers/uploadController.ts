import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import Settings from '../models/Settings.js';
import { deleteFile, getFile, putFile } from '../services/storageService.js';

const RESUME_FOLDER = 'portfolio/resumes';
const MAX_RESUME_SIZE = 10 * 1024 * 1024;

function getResumeUrl(req, key: string) {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/uploads/render`;
  return `${baseUrl}?key=${encodeURIComponent(key)}`;
}

function isManagedResumeKey(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith(`${RESUME_FOLDER}/`);
}

export async function uploadResume(req, res, next) {
  let uploadedKey = '';
  try {
    const file = req.body;
    if (!Buffer.isBuffer(file) || file.length === 0) {
      return res.status(400).json({ success: false, message: 'Select a PDF resume to upload.' });
    }
    if (file.length > MAX_RESUME_SIZE) {
      return res
        .status(413)
        .json({ success: false, message: 'Resume files must be 10 MB or smaller.' });
    }
    if (
      req.headers['content-type']?.split(';')[0] !== 'application/pdf' ||
      !file.subarray(0, 5).equals(Buffer.from('%PDF-'))
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Only valid PDF files can be uploaded.' });
    }

    uploadedKey = `${RESUME_FOLDER}/resume-${randomUUID()}.pdf`;
    await putFile(uploadedKey, file, 'application/pdf');

    const previous = await Settings.findOne();
    const settings = await Settings.findOneAndUpdate(
      {},
      { resumeUrl: getResumeUrl(req, uploadedKey), resumeFileKey: uploadedKey },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    if (isManagedResumeKey(previous?.resumeFileKey) && previous.resumeFileKey !== uploadedKey) {
      deleteFile(previous.resumeFileKey).catch((error) =>
        console.error('Could not remove the replaced resume from storage:', error),
      );
    }
    res.status(201).json({ success: true, data: settings });
  } catch (error) {
    if (uploadedKey) deleteFile(uploadedKey).catch(() => undefined);
    next(error);
  }
}

export async function renderFile(req, res, next) {
  try {
    const key = String(req.query.key || '');
    if (!isManagedResumeKey(key)) {
      return res.status(400).json({ success: false, message: 'Invalid resume file.' });
    }
    const object = await getFile(key);
    if (!object.Body || !(object.Body instanceof Readable))
      throw new Error('Stored resume could not be read.');

    res.setHeader('Content-Type', object.ContentType || 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Jhumari-Job-Galos-Resume.pdf"');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    object.Body.on('error', (error) => res.destroy(error));
    object.Body.pipe(res);
  } catch (error) {
    next(error);
  }
}
