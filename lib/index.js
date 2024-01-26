"use strict"

const axios = require("axios")
const mime = require('mime');
const { ApplicationError } = require("@strapi/utils").errors
const { generateChecksum } = require("./utils")

/**
 * Initialize Bunny CDN Storage integration.
 * 
 * @param {Object} config - The configuration object for Bunny CDN.
 * @param {string} config.api_key - The API key for Bunny CDN.
 * @param {string} config.storage_zone - The storage zone name in Bunny CDN.
 * @param {string} config.pull_zone - The pull zone name in Bunny CDN.
 * @param {string} config.region - The region of the Bunny CDN storage.
 * @returns {Object} The initialized upload, download, and delete methods.
 */
module.exports = {
  init({ api_key, storage_zone, pull_zone, region }) {
    console.log("storage_endpoint", storage_endpoint)

    if (!api_key || !storage_zone || !pull_zone || !region) {
      throw new ApplicationError("BUNNY_API_KEY, BUNNY_REGION, BUNNY_STORAGE_ZONE or BUNNY_PULL_ZONE can't be null or undefined.")
    }

    /**
     * Uploads a file to Bunny CDN.
     * 
     * @param {Object} file - The file object to upload.
     * @param {Buffer|Stream} file.stream - The file data as a stream or buffer.
     * @param {string} file.hash - The hash of the file.
     * @param {string} file.ext - The file extension.
     * @returns {Promise<void>} A promise that resolves when the file is uploaded.
     */
    const upload = async (file) => {
      const data = file.stream || Buffer.from(file.buffer, "binary");
      const checksum = generateChecksum(data);

      try {
        const response = await axios.put(
          `${region}.storage.bunnycdn.com/${storage_zone}/${file.hash}${file.ext}`, 
          data, 
          {
            headers: {
              AccessKey: api_key,
              Checksum: checksum,
              'content-type': 'application/octet-stream',
            },
          }
        );

        if (response.data.HttpCode !== 201) {
          throw new Error(`Error uploading to Bunny.net: ${response.data.Message}`);
        }

        file.url = `${pull_zone}/${file.hash}${file.ext}`;
      } catch (error) {
        throw new Error(`Error uploading to Bunny.net: ${error.message}`);
      }
    };

    /**
     * Downloads a file from Bunny CDN.
     * 
     * @param {Object} file - The file object to download.
     * @param {string} file.hash - The hash of the file.
     * @param {string} file.ext - The file extension.
     * @returns {Promise<Object>} A promise that resolves with the downloaded file data.
     */
    const download = async (file) => {
      try {
        const response = await axios.get(`${region}.storage.bunnycdn.com/${storage_zone}/${file.hash}${file.ext}`, {
          headers: {
            AccessKey: api_key,
          },
          responseType: 'arraybuffer' // Para manejar diferentes tipos de archivos
        });
    
        const type = mime.getType(file.ext);
        let body;
    
        if (/^text(\/|$)/.test(type)) {
          body = response.data.toString('utf8');
        } else if (type === 'application/json') {
          body = JSON.parse(response.data.toString('utf8'));
        } else {
          body = Buffer.from(response.data);
        }
    
        return { type, body };
      } catch (error) {
        throw new Error(`Error downloading from Bunny.net: ${error.message}`);
      }
    };

    /**
     * Deletes a file from Bunny CDN.
     * 
     * @param {Object} file - The file object to delete.
     * @param {string} file.hash - The hash of the file.
     * @param {string} file.ext - The file extension.
     * @returns {Promise<void>} A promise that resolves when the file is deleted.
     */
    const deleteFile = async (file) => {
      try {
        const response = await axios.delete(`${region}.storage.bunnycdn.com/${storage_zone}/${file.hash}${file.ext}`, {
          headers: {
            AccessKey: api_key
          }
        });
    
        if (response.data.HttpCode !== 200) {
          console.error("Soft Error: Failed to delete file; has it already been deleted?", response.data);
        }
      } catch (error) {
        console.error("Soft Error: Failed to delete file; has it already been deleted?", error.message);
      }
    };

    return {
      upload,
      download,
      delete: deleteFile
    };
  },
}
