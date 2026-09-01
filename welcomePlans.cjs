'use strict';

const listPlans = value => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.plans)) return value.plans;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.plans)) return value.data.plans;
  return [];
};

const firstValue = (plan, ...keys) => {
  for (const key of keys) {
    const value = plan?.features?.[key] ?? plan?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
};

const readable = value => typeof value === 'boolean'
  ? (value ? 'Included' : 'Not included')
  : value == null ? 'Not specified' : String(value);

const normalizeWelcomePlan = (plan, index = 0) => {
  const interval = firstValue(plan, 'billingInterval', 'billing_interval', 'interval');
  const price = firstValue(plan, 'price', 'monthlyPrice', 'monthly_price', 'amount');
  const formattedPrice = firstValue(plan, 'displayPrice', 'display_price', 'formattedPrice', 'formatted_price');
  return {
    id: plan?.id || plan?.slug || `${plan?.name || 'plan'}-${index}`,
    name: plan?.name || plan?.title || 'Unnamed plan',
    price: formattedPrice || (price !== null ? `${plan?.currency || ''} ${price}`.trim() : 'Price unavailable'),
    currency: plan?.currency || null,
    interval: interval ? String(interval).replace(/^per\s+/i, '') : null,
    quality: readable(firstValue(plan, 'videoQuality', 'video_quality', 'quality')),
    streams: readable(firstValue(plan, 'simultaneousStreams', 'simultaneous_streams', 'streams')),
    ads: readable(firstValue(plan, 'advertisements', 'ads', 'adSupported', 'ad_supported')),
    downloads: readable(firstValue(plan, 'downloads', 'downloadEnabled', 'download_enabled')),
    available: firstValue(plan, 'available', 'isAvailable', 'is_available') !== false
      && firstValue(plan, 'active', 'isActive', 'is_active') !== false,
  };
};

module.exports = { listPlans, normalizeWelcomePlan };
