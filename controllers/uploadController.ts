import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import sharp from 'sharp';
import Settings from '../models/Settings.js';
import { deleteFile, getFile, putFile } from '../services/storageService.js';

const RESUME_FOLDER = 'portfolio/resumes';
const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const HERO_IMAGE_FOLDER = 'portfolio/hero-images';
const MAX_HERO_IMAGE_SIZE = 20 * 1024 * 1024;
const HERO_IMAGE_MAX_DIMENSION = 1600;

function getResumeUrl(req, key: string) {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/uploads/render`;
  return `${baseUrl}?key=${encodeURIComponent(key)}`;
}

function isManagedResumeKey(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith(`${RESUME_FOLDER}/`);
}

function isManagedHeroImageKey(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith(`${HERO_IMAGE_FOLDER}/`);
}

function heroImageType(file: Buffer, contentType: unknown) {
  const suppliedType = String(contentType || '')
    .split(';')[0]
    .toLowerCase();
  const isJpeg = file.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const isPng = file
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    file.subarray(0, 4).equals(Buffer.from('RIFF')) &&
    file.subarray(8, 12).equals(Buffer.from('WEBP'));

  if (isJpeg && suppliedType === 'image/jpeg') return true;
  if (isPng && suppliedType === 'image/png') return true;
  if (isWebp && suppliedType === 'image/webp') return true;
  return null;
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

export async function uploadHeroImage(req, res, next) {
  let uploadedKey = '';
  try {
    const file = req.body;
    if (!Buffer.isBuffer(file) || file.length === 0) {
      return res.status(400).json({ success: false, message: 'Select an image to upload.' });
    }
    if (file.length > MAX_HERO_IMAGE_SIZE) {
      return res
        .status(413)
        .json({ success: false, message: 'Hero image uploads must be 20 MB or smaller.' });
    }

    if (!heroImageType(file, req.headers['content-type'])) {
      return res.status(400).json({
        success: false,
        message: 'Only valid JPEG, PNG, and WebP images can be uploaded.',
      });
    }

    const optimizedImage = await sharp(file)
      .rotate()
      .resize({
        width: HERO_IMAGE_MAX_DIMENSION,
        height: HERO_IMAGE_MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    uploadedKey = `${HERO_IMAGE_FOLDER}/hero-${randomUUID()}.webp`;
    await putFile(uploadedKey, optimizedImage, 'image/webp');

    const previous = await Settings.findOne();
    const settings = await Settings.findOneAndUpdate(
      {},
      { heroImageUrl: getResumeUrl(req, uploadedKey), heroImageFileKey: uploadedKey },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    if (
      isManagedHeroImageKey(previous?.heroImageFileKey) &&
      previous.heroImageFileKey !== uploadedKey
    ) {
      deleteFile(previous.heroImageFileKey).catch((error) =>
        console.error('Could not remove the replaced hero image from storage:', error),
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
    const isResume = isManagedResumeKey(key);
    const isHeroImage = isManagedHeroImageKey(key);
    if (!isResume && !isHeroImage) {
      return res.status(400).json({ success: false, message: 'Invalid uploaded file.' });
    }
    const object = await getFile(key);
    if (!object.Body || !(object.Body instanceof Readable))
      throw new Error('Stored resume could not be read.');

    res.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
    if (isResume) {
      res.setHeader('Content-Disposition', 'attachment; filename="Jhumari-Job-Galos-Resume.pdf"');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    object.Body.on('error', (error) => res.destroy(error));
    object.Body.pipe(res);
  } catch (error) {
    next(error);
  }
}
