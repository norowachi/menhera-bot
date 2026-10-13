/**
 * Usage:
 *   const worker = await createOcrWorker();            // once, at startup
 *   ...
 *   client.on(Events.MessageCreate, async (message) => {
 *     const hit = await scanAttachments(message.attachments, ['/mrbeast', '/beast'], worker);
 *     if (hit) { ... }          // hit.attachment = matching Attachment, hit.match = value found
 *   });
 *   ...
 *   await worker.terminate();                           // on shutdown
 */

import type { Attachment } from 'discord.js';
import sharp from 'sharp';
import { createWorker, type Worker } from 'tesseract.js';

const CROP_HEIGHT = 100; // height (px) of the strip to scan
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // skip attachments larger than this

/** Creates the OCR worker. Create it once and reuse it; startup is expensive. */
export const createOcrWorker = (): Promise<Worker> => createWorker('eng');

// A tesseract worker handles one job at a time, so serialize scans to avoid
// overlapping recognize() calls when several messages arrive at once.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => {}); // keep the chain alive after a failed job
  return run;
}

/** Crops one strip out of the image and returns the OCR'd text. */
async function ocrStrip(imageBuffer: Buffer, worker: Worker): Promise<string> {
  const image = sharp(imageBuffer);
  const { width, height: imageHeight } = await image.metadata();
  if (!width || !imageHeight)
    throw new Error('Could not read image dimensions');

  const height = Math.min(CROP_HEIGHT, imageHeight);

  // Which strip to scan. `top` is the y offset (px) where the crop starts:
  //   top strip    (default):  top = 0
  //   bottom strip (100px):    top = imageHeight - height
  //   middle strip (20px):     set CROP_HEIGHT = 20, then
  //                            top = Math.floor((imageHeight - height) / 2)
  // To scan a specific offset instead (e.g. 300px down): top = Math.min(300, imageHeight - height)
  const top = 0;

  // Upscale 2x and grayscale: OCR is noticeably better on small/thin text.
  const strip = await image
    .extract({ left: 0, top, width, height })
    .resize({ width: width * 2 })
    .grayscale()
    .toBuffer();

  const { data } = await worker.recognize(strip);
  return data.text;
}

/**
 * Scans every image attachment (in order) and returns the first one whose
 * strip contains ANY of `searchValues` (case-insensitive), along with the
 * value that matched, or null if none match. Accepts a single string or a
 * list. Empty values are ignored (an empty string would match everything).
 * Non-images, oversized files, and failed downloads/scans are skipped.
 */
export async function scanAttachments(
  attachments: ReadonlyMap<string, Attachment>,
  searchValues: string | readonly string[],
  worker: Worker,
): Promise<{ attachment: Attachment; match: string } | null> {
  const needles = (
    typeof searchValues === 'string' ? [searchValues] : searchValues
  )
    .filter((value) => value.length > 0)
    .map((value) => ({ value, lower: value.toLowerCase() }));
  if (needles.length === 0) return null;

  for (const attachment of attachments.values()) {
    if (!attachment.contentType?.startsWith('image/')) continue;
    if (attachment.size > MAX_IMAGE_BYTES) continue;

    try {
      const res = await fetch(attachment.url);
      if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
      const imageBuffer = Buffer.from(await res.arrayBuffer());

      const text = (
        await enqueue(() => ocrStrip(imageBuffer, worker))
      ).toLowerCase();
      const hit = needles.find((needle) => text.includes(needle.lower));
      if (hit) return { attachment, match: hit.value };
    } catch (err) {
      console.error(`[scan] ${attachment.name} (${attachment.id}):`, err);
    }
  }

  return null;
}
