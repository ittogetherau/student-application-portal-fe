export const MAX_FILE_SIZE_BYTES = Math.floor(5 * 1024 * 1024);
export const MAX_FILES_PER_UPLOAD = 10;

export const IGNORED_DOCUMENT_TYPES = new Set([
  "COE_PAYMENT_PROOF",
  "COE_DOCUMENTS",
  "OFFER_LETTER_SIGNED",
]);

export const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const DROPZONE_ACCEPT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export const FILE_TYPE_LABEL = "PDF, JPG, PNG";

export const isAllowedFileType = (file: File) => {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );
  const hasAllowedMime =
    !file.type || ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  return hasAllowedExtension || hasAllowedMime;
};

export const getFileKey = (documentTypeId: string, file: File) =>
  `${documentTypeId}-${file.name}-${file.size}`;

//
// Source - https://stackoverflow.com/a/14919494
// Posted by mpen, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-30, License - CC BY-SA 4.0

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export const getDropzoneHelperText = (maxBytes: number) =>
  `Max file size: ${humanFileSize(maxBytes, true, 1)}. Supports ${FILE_TYPE_LABEL}.`;
