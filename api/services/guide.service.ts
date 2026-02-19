import type { Filter } from 'mongodb';
import { collections } from '~/database/mongo';
import type { GuideReviewDoc } from '~/database/types';
import type { GuideReviewBody, GuideReviewsQuery } from '~/schemas/guide';
import { generateId } from '~/utils/id';
import { escapeRegex } from '~/utils/strings';

export async function addReview(
  userId: string,
  userEmail: string,
  body: GuideReviewBody,
): Promise<void> {
  await collections.guideReviews.insertOne({
    id: generateId(),
    userId,
    userEmail,
    pageId: body.pageId,
    thumb: body.thumb,
    comment: body.comment ?? null,
    createdAt: new Date(),
  });
}

export async function listReviews(query: GuideReviewsQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const filter: Filter<GuideReviewDoc> = {};

  if (query.pageId) {
    filter.pageId = query.pageId;
  }

  if (query.thumb) {
    filter.thumb = Number(query.thumb) as 1 | -1;
  }

  if (query.since || query.until) {
    filter.createdAt = {};
    if (query.since) filter.createdAt.$gte = new Date(query.since);
    if (query.until) filter.createdAt.$lte = new Date(query.until);
  }

  if (query.q) {
    const safeQ = escapeRegex(query.q);
    filter.$or = [
      { userEmail: { $regex: safeQ, $options: 'i' } },
      { comment: { $regex: safeQ, $options: 'i' } },
    ];
  }

  const [total, data] = await Promise.all([
    collections.guideReviews.countDocuments(filter),
    collections.guideReviews
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
    },
  };
}
