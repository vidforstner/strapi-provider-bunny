"use strict"

const axios = require("axios")
const mime = require('mime');
const { ApplicationError } = require("@strapi/utils").errors
const { generateChecksum } = require("./utils")

module.exports = {
  init({ api_key, storage_zone, pull_zone, region }) {
    console.log("storage_endpoint", storage_endpoint)

    if (!api_key || !storage_zone || !pull_zone || !region) {
      throw new ApplicationError("BUNNY_API_KEY, BUNNY_REGION, BUNNY_STORAGE_ZONE or BUNNY_PULL_ZONE can't be null or undefined.")
    }

    const bunny_api = axios.create({
      baseURL: `${storage_endpoint}/${storage_zone}/`,
      timeout: 0,
      headers: {
        AccessKey: api_key,
        "content-type": "application/octet-stream",
      },
    })

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
      upload(file) {
        return upload(file)
      },
      download(file) {
        return download(file)
      },
      delete: async (file) => {
        return deleteFile(file)
      },
    }
  },
}
