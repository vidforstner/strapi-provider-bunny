"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.init=void 0;var _utils=require("@strapi/utils"),_axios=_interopRequireDefault(require("axios")),_buffer=require("buffer"),_index=require("./utils/index.js");function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}const{ApplicationError}=_utils.errors,init=({api_key:a,storage_zone:b,pull_zone:c,hostname:d})=>{if(!a||!b||!c||!d)throw new ApplicationError("BUNNY_API_KEY, BUNNY_HOSTNAME, BUNNY_STORAGE_ZONE or BUNNY_PULL_ZONE can't be null or undefined.");/**
   * Uploads a file to Bunny CDN.
   *
   * @param {Object} file - The file object to upload.
   * @param {Buffer|Stream} file.stream - The file data as a stream or buffer.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is uploaded.
   */const e=async e=>{const f=e.stream||_buffer.Buffer.from(e.buffer,"binary");try{const g=await _axios.default.put(`https://${d}/${b}/${e.hash}${e.ext}`,f,{headers:{AccessKey:a,"content-type":"application/octet-stream"}});if(201!==g.data.HttpCode)throw new ApplicationError(`Error uploading to Bunny.net: ${g.data.Message}`);e.url=`https://${c}/${e.hash}${e.ext}`}catch(a){throw new ApplicationError(`Error uploading to Bunny.net: ${a.message}`)}};/**
   * Downloads a file from Bunny CDN.
   *
   * @param {Object} file - The file object to download.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<Object>} A promise that resolves with the downloaded file data.
   */ /**
   * Deletes a file from Bunny CDN.
   *
   * @param {Object} file - The file object to delete.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is deleted.
   */return{upload:e,download:async c=>{try{const e=await _axios.default.get(`https://${d}/${b}/${c.hash}${c.ext}`,{headers:{AccessKey:a},responseType:"arraybuffer"// Para manejar diferentes tipos de archivos
}),f=(0,_index.getMimeType)(c.ext);let g;return g=/^text(\/|$)/.test(f)?e.data.toString("utf8"):"application/json"===f?JSON.parse(e.data.toString("utf8")):_buffer.Buffer.from(e.data),{type:f,body:g}}catch(a){throw new ApplicationError(`Error downloading from Bunny.net: ${a.message}`)}},delete:async c=>{try{const e=await _axios.default.delete(`https://${d}/${b}/${c.hash}${c.ext}`,{headers:{AccessKey:a}});200!==e.data.HttpCode&&console.error("Soft Error: Failed to delete file; has it already been deleted?",e.data)}catch(a){console.error("Soft Error: Failed to delete file; has it already been deleted?",a.message)}},uploadStream:e}};/**
 * Initialize Bunny CDN Storage integration.
 *
 * @param {Object} config - The configuration object for Bunny CDN.
 * @param {string} config.api_key - The API key for Bunny CDN.
 * @param {string} config.storage_zone - The storage zone name in Bunny CDN.
 * @param {string} config.pull_zone - The pull zone name in Bunny CDN.
 * @param {string} config.hostname - The region of the Bunny CDN storage.
 * @returns {Object} The initialized upload, download, and delete methods.
 */exports.init=init;