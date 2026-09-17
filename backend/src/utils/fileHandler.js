const fs = require('fs');
const path = require('path');
const imagekit = require('./imagekit');

/**
 * Safely delete a file from local storage or ImageKit CDN.
 * Guaranteed to be non-blocking (never throws errors to caller).
 *
 * @param {string|null} filePathOrUrl - The relative URL (/uploads/file.png), local path, or CDN URL.
 * @param {string|null} imagekitFileId - The direct ImageKit fileId (if stored in database).
 * @returns {Promise<boolean>} True if deletion succeeded or was gracefully skipped, false if error occurred.
 */
async function deleteFile(filePathOrUrl, imagekitFileId = null) {
  const driver = (process.env.UPLOAD_DRIVER || 'local').toLowerCase();

  try {
    // 1. Cloud / ImageKit Mode Deletion
    if (driver === 'cloud' || imagekitFileId || (filePathOrUrl && filePathOrUrl.includes('ik.imagekit.io'))) {
      let targetFileId = imagekitFileId;

      // Fallback: If fileId is missing, resolve it via ImageKit API using filename
      if (!targetFileId && filePathOrUrl) {
        try {
          // Clean URL / path to extract pure filename
          const cleanUrlPath = filePathOrUrl.split('?')[0].split('#')[0];
          const filename = path.basename(cleanUrlPath);

          if (filename) {
            // Attempt search via searchQuery first, then fallback to name parameter
            let searchResults = [];
            try {
              searchResults = await imagekit.listFiles({
                searchQuery: `name = "${filename}"`,
              });
            } catch (searchErr) {
              searchResults = await imagekit.listFiles({ name: filename });
            }

            if (Array.isArray(searchResults) && searchResults.length > 0) {
              targetFileId = searchResults[0].fileId;
            }
          }
        } catch (resolveErr) {
          console.error('[fileHandler] Failed to resolve ImageKit fileId from URL/name:', resolveErr.message);
        }
      }

      if (targetFileId) {
        try {
          await imagekit.deleteFile(targetFileId);
          console.log(`[fileHandler] ImageKit file deleted successfully (fileId: ${targetFileId})`);
          return true;
        } catch (ikDeleteErr) {
          console.error(`[fileHandler] ImageKit deleteFile failed (fileId: ${targetFileId}):`, ikDeleteErr.message);
          return false;
        }
      } else {
        console.warn(`[fileHandler] ImageKit deletion skipped: Could not resolve fileId for "${filePathOrUrl}"`);
        return false;
      }
    }

    // 2. Local Storage Mode Deletion with Path Traversal Prevention
    if (filePathOrUrl) {
      const cleanUrlPath = filePathOrUrl.split('?')[0].split('#')[0];
      const filename = path.basename(cleanUrlPath);

      if (!filename) {
        return false;
      }

      const allowedDirs = [
        path.join(process.cwd(), 'public', 'uploads'),
        path.join(process.cwd(), 'uploads'),
      ];

      for (const baseDir of allowedDirs) {
        const targetPath = path.join(baseDir, filename);
        const resolvedPath = path.resolve(targetPath);
        const resolvedBaseDir = path.resolve(baseDir);

        // Strict Path Traversal Check
        if (!resolvedPath.startsWith(resolvedBaseDir + path.sep) && resolvedPath !== resolvedBaseDir) {
          console.error(`[fileHandler] Security Warning: Path traversal detected for path "${filePathOrUrl}"`);
          return false;
        }

        if (fs.existsSync(resolvedPath)) {
          await fs.promises.unlink(resolvedPath);
          console.log(`[fileHandler] Local file deleted successfully: ${resolvedPath}`);
          return true;
        }
      }

      console.warn(`[fileHandler] Local file not found on disk: "${filename}"`);
      return true; // Missing file is considered safely handled
    }

    return false;
  } catch (err) {
    // Non-blocking catch all to ensure DB operations are never interrupted
    console.error('[fileHandler] Unexpected error during file deletion:', err.message);
    return false;
  }
}

module.exports = {
  deleteFile,
};
