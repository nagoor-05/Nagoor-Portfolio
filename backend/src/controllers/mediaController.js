import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { MediaAsset } from "../models/MediaAsset.js";
import { sendSuccess } from "../utils/response.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, "../../uploads/media");
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "application/pdf",
  "model/gltf+json",
  "model/gltf-binary",
  "application/octet-stream",
]);
const maxFileSize = 12 * 1024 * 1024;

function parseDataUrl(dataUrl = "") {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], buffer: Buffer.from(match[2], "base64") };
}

function extensionFor(fileName = "", mimeType = "") {
  const existing = path.extname(fileName).replace(".", "");
  if (existing) return existing.toLowerCase();
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
    "application/pdf": "pdf",
    "model/gltf+json": "gltf",
    "model/gltf-binary": "glb",
  }[mimeType] || "bin";
}

function resourceTypeFor(mimeType = "") {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
}

function signCloudinary(params) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${serialized}${env.cloudinaryApiSecret}`).digest("hex");
}

function canUseCloudinary() {
  return env.mediaStorageProvider === "cloudinary" && env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;
}

async function uploadCloudinary(ownerId, fileName, dataUrl, explicitMimeType) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    const error = new Error("File must be sent as a base64 data URL");
    error.status = 400;
    throw error;
  }
  const mimeType = explicitMimeType || parsed.mimeType;
  if (!allowedTypes.has(mimeType)) {
    const error = new Error("Unsupported file type");
    error.status = 400;
    throw error;
  }
  if (parsed.buffer.length > maxFileSize) {
    const error = new Error("File is too large. Maximum supported size is 12 MB.");
    error.status = 400;
    throw error;
  }
  const resourceType = resourceTypeFor(mimeType);
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `portfolio/${ownerId}`;
  const signature = signCloudinary({ folder, timestamp });
  const formData = new FormData();
  formData.append("file", dataUrl);
  formData.append("api_key", env.cloudinaryApiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || "Cloudinary upload failed");
    error.status = 502;
    throw error;
  }
  return {
    mimeType,
    size: parsed.buffer.length,
    provider: "cloudinary",
    resourceType,
    url: payload.secure_url,
    publicId: payload.public_id,
  };
}

async function saveLocalFile(ownerId, fileName, dataUrl, explicitMimeType) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    const error = new Error("File must be sent as a base64 data URL");
    error.status = 400;
    throw error;
  }
  const mimeType = explicitMimeType || parsed.mimeType;
  if (!allowedTypes.has(mimeType)) {
    const error = new Error("Unsupported file type");
    error.status = 400;
    throw error;
  }
  if (parsed.buffer.length > maxFileSize) {
    const error = new Error("File is too large. Maximum supported size is 12 MB.");
    error.status = 400;
    throw error;
  }
  await fs.mkdir(uploadRoot, { recursive: true });
  const id = crypto.randomBytes(12).toString("hex");
  const safeExt = extensionFor(fileName, mimeType).replace(/[^a-z0-9]/gi, "");
  const storedName = `${ownerId}-${id}.${safeExt}`;
  const absolutePath = path.join(uploadRoot, storedName);
  await fs.writeFile(absolutePath, parsed.buffer);
  return {
    mimeType,
    size: parsed.buffer.length,
    provider: "local",
    resourceType: resourceTypeFor(mimeType),
    url: `/uploads/media/${storedName}`,
    publicId: storedName,
  };
}

async function saveFile(ownerId, fileName, dataUrl, explicitMimeType) {
  if (canUseCloudinary()) return uploadCloudinary(ownerId, fileName, dataUrl, explicitMimeType);
  return saveLocalFile(ownerId, fileName, dataUrl, explicitMimeType);
}

async function deleteCloudinary(asset) {
  if (!asset.publicId || !env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) return;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = signCloudinary({ public_id: asset.publicId, timestamp });
  const formData = new FormData();
  formData.append("public_id", asset.publicId);
  formData.append("api_key", env.cloudinaryApiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/${asset.resourceType || "image"}/destroy`, {
    method: "POST",
    body: formData,
  }).catch(() => null);
}

async function deleteStoredFile(asset) {
  if (asset.provider === "cloudinary") return deleteCloudinary(asset);
  if (asset.provider === "local" && asset.publicId) {
    await fs.unlink(path.join(uploadRoot, asset.publicId)).catch(() => null);
  }
}

export async function listMedia(req, res) {
  const { search = "", category = "" } = req.query;
  const query = { ownerId: req.user._id };
  if (category) query.category = category;
  if (search.trim()) query.$text = { $search: search.trim() };
  const assets = await MediaAsset.find(query).sort({ createdAt: -1 }).lean();
  return sendSuccess(res, assets.map((asset) => ({ id: asset._id, ...asset })));
}

export async function uploadMedia(req, res) {
  const { fileName, dataUrl, category = "other", altText = "", tags = [], title } = req.body;
  const file = await saveFile(req.user._id, fileName, dataUrl, req.body.mimeType);
  const asset = await MediaAsset.create({
    ownerId: req.user._id,
    title: title || fileName,
    originalName: fileName,
    category,
    altText,
    tags,
    ...file,
  });
  return sendSuccess(res, { id: asset._id, ...asset.toObject() }, "Media uploaded", 201);
}

export async function updateMedia(req, res) {
  const { title, category, altText, tags, isVisible } = req.body;
  const asset = await MediaAsset.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    { title, category, altText, tags, isVisible },
    { new: true, runValidators: true }
  );
  if (!asset) return res.status(404).json({ success: false, message: "Media asset not found" });
  return sendSuccess(res, { id: asset._id, ...asset.toObject() }, "Media updated");
}

export async function replaceMedia(req, res) {
  const asset = await MediaAsset.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!asset) return res.status(404).json({ success: false, message: "Media asset not found" });
  const file = await saveFile(req.user._id, req.body.fileName || asset.originalName, req.body.dataUrl, req.body.mimeType);
  await deleteStoredFile(asset);
  asset.set({
    originalName: req.body.fileName || asset.originalName,
    mimeType: file.mimeType,
    size: file.size,
    url: file.url,
    publicId: file.publicId,
    provider: file.provider,
    resourceType: file.resourceType,
  });
  await asset.save();
  return sendSuccess(res, { id: asset._id, ...asset.toObject() }, "Media replaced");
}

export async function deleteMedia(req, res) {
  const asset = await MediaAsset.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
  if (!asset) return res.status(404).json({ success: false, message: "Media asset not found" });
  await deleteStoredFile(asset);
  return sendSuccess(res, { id: asset._id }, "Media deleted");
}
