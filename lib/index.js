"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.init=void 0;var _utils=require("@strapi/utils"),_axios=_interopRequireDefault(require("axios")),_buffer=require("buffer"),_index=require("./utils/index.js");function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}const{ApplicationError}=_utils.errors,init=({api_key:a,storage_zone:b,pull_zone:c,hostname:d,upload_path:e})=>{if(!a||!b||!c||!d)throw new ApplicationError("BUNNY_API_KEY, BUNNY_HOSTNAME, BUNNY_STORAGE_ZONE or BUNNY_PULL_ZONE can't be null or undefined.");/**
   * Uploads a file to Bunny CDN.
   *
   * @param {Object} file - The file object to upload.
   * @param {Buffer|Stream} file.stream - The file data as a stream or buffer.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is uploaded.
   */const f=async f=>{const g=f.stream||_buffer.Buffer.from(f.buffer,"binary"),h=e?`${e}/`:"";try{const e=await _axios.default.put(`https://${d}/${b}/${h}${f.hash}${f.ext}`,g,{headers:{AccessKey:a,"content-type":"application/octet-stream"},maxContentLength:1/0,maxBodyLength:1/0});if(201!==e.data.HttpCode)throw new ApplicationError(`Error uploading to Bunny.net: ${e.data.Message}`);f.url=`https://${c}/${h}${f.hash}${f.ext}`}catch(a){throw new ApplicationError(`Error uploading to Bunny.net: ${a.message}`)}};/**
   * Downloads a file from Bunny CDN.
   *
   * @param {Object} file - The file object to download.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<Object>} A promise that resolves with the downloaded file data.
   *//**
   * Deletes a file from Bunny CDN.
   *
   * @param {Object} file - The file object to delete.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is deleted.
   */return{upload:f,download:async c=>{try{const f=e?`${e}/`:"",g=await _axios.default.get(`https://${d}/${b}/${f}${c.hash}${c.ext}`,{headers:{AccessKey:a},responseType:"arraybuffer"// Para manejar diferentes tipos de archivos
}),h=(0,_index.getMimeType)(c.ext);let i;return i=/^text(\/|$)/.test(h)?g.data.toString("utf8"):"application/json"===h?JSON.parse(g.data.toString("utf8")):_buffer.Buffer.from(g.data),{type:h,body:i}}catch(a){throw new ApplicationError(`Error downloading from Bunny.net: ${a.message}`)}},delete:async c=>{try{const f=e?`${e}/`:"",g=await _axios.default.delete(`https://${d}/${b}/${f}${c.hash}${c.ext}`,{headers:{AccessKey:a}});200!==g.data.HttpCode&&console.error("Soft Error: Failed to delete file; has it already been deleted?",g.data)}catch(a){console.error("Soft Error: Failed to delete file; has it already been deleted?",a.message)}},uploadStream:f}};/**
 * Initialize Bunny CDN Storage integration.
 *
 * @param {Object} config - The configuration object for Bunny CDN.
 * @param {string} config.api_key - The API key for Bunny CDN.
 * @param {string} config.storage_zone - The storage zone name in Bunny CDN.
 * @param {string} config.pull_zone - The pull zone name in Bunny CDN.
 * @param {string} config.hostname - The region of the Bunny CDN storage.
 * @param {string?} config.upload_path - The default upload path, optional
 * @returns {Object} The initialized upload, download, and delete methods.
 */exports.init=init;