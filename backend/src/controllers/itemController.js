import { PortfolioItem } from "../models/PortfolioItem.js";
import { createSlug } from "../utils/slug.js";
import { createHttpError, sendSuccess } from "../utils/response.js";
import { recordAdminActivity } from "../services/activityService.js";

function serialize(item) {
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    order: item.order,
    isVisible: item.isVisible,
    ...item.data,
  };
}

export function listPublicItems(type) {
  return async (req, res) => {
    const items = await PortfolioItem.find({ ownerId: req.owner._id, type, isVisible: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return sendSuccess(res, items.map(serialize));
  };
}

export function listAdminItems(type) {
  return async (req, res) => {
    const items = await PortfolioItem.find({ ownerId: req.user._id, type }).sort({ order: 1, createdAt: 1 }).lean();
    return sendSuccess(res, items.map(serialize));
  };
}

export function getPublicItem(type) {
  return async (req, res) => {
    const item = await PortfolioItem.findOne({
      ownerId: req.owner._id,
      type,
      slug: req.params.slug,
      isVisible: true,
    }).lean();
    if (!item) throw createHttpError("Item not found", 404);
    return sendSuccess(res, serialize(item));
  };
}

export function createItem(type) {
  return async (req, res) => {
    const { title = "", slug, order = 0, isVisible = true, ...data } = req.body;
    const item = await PortfolioItem.create({
      ownerId: req.user._id,
      type,
      title,
      slug: slug || createSlug(title) || `${type}-${Date.now()}`,
      order,
      isVisible,
      data,
    });
    await recordAdminActivity(req, "create", type, item._id, { title });
    return sendSuccess(res, serialize(item.toObject()), `${type} created`, 201);
  };
}

export function updateItem(type) {
  return async (req, res) => {
    const { title, slug, order, isVisible, ...data } = req.body;
    const update = { data };
    if (title !== undefined) update.title = title;
    if (slug !== undefined) update.slug = slug || createSlug(title);
    if (order !== undefined) update.order = order;
    if (isVisible !== undefined) update.isVisible = isVisible;
    const item = await PortfolioItem.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id, type },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();
    if (!item) throw createHttpError("Item not found", 404);
    await recordAdminActivity(req, "update", type, item._id, { title: item.title });
    return sendSuccess(res, serialize(item), `${type} updated`);
  };
}

export function deleteItem(type) {
  return async (req, res) => {
    const item = await PortfolioItem.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id, type });
    if (!item) throw createHttpError("Item not found", 404);
    await recordAdminActivity(req, "delete", type, item._id, { title: item.title });
    return sendSuccess(res, null, `${type} deleted`);
  };
}
