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

const formatMinorPrice = (minor, currency, locale = 'en') => {
  if (typeof minor !== 'number' || !Number.isFinite(minor) || !currency) return null;
  try { return new Intl.NumberFormat(locale, { style:'currency', currency }).format(minor / 100); }
  catch { return null; }
};

const normalizeWelcomePlan = (plan, index = 0) => {
  const interval = firstValue(plan, 'billingInterval', 'billing_interval', 'interval');
  const priceMinor = firstValue(plan, 'price_minor', 'priceMinor');
  const price = firstValue(plan, 'price', 'monthlyPrice', 'monthly_price', 'amount');
  const formattedPrice = firstValue(plan, 'displayPrice', 'display_price', 'formattedPrice', 'formatted_price');
  const name = firstValue(plan, 'name', 'display_name', 'displayName', 'title');
  const currency = firstValue(plan, 'currency');
  const displayPrice = formattedPrice ?? formatMinorPrice(priceMinor, currency)
    ?? (price !== null ? `${currency ?? ''} ${price}`.trim() : null);
  if (typeof name !== 'string' || !name.trim() || !displayPrice) return null;
  return {
    id: plan?.id ?? plan?.code ?? plan?.slug ?? `plan-${index}`,
    name: name.trim(),
    price: displayPrice,
    currency: currency ?? null,
    interval: interval ? String(interval).replace(/^per\s+/i, '') : null,
    quality: readable(firstValue(plan, 'max_video_quality', 'maxVideoQuality', 'videoQuality', 'video_quality', 'quality')),
    streams: readable(firstValue(plan, 'simultaneousStreams', 'simultaneous_streams', 'streams')),
    ads: readable(firstValue(plan, 'ads_enabled', 'adsEnabled', 'advertisements', 'ads', 'adSupported', 'ad_supported')),
    downloads: readable(firstValue(plan, 'downloads_allowed', 'downloadsAllowed', 'downloads', 'downloadEnabled', 'download_enabled')),
    available: firstValue(plan, 'available', 'isAvailable', 'is_available') !== false
      && firstValue(plan, 'active', 'isActive', 'is_active') !== false,
  };
};

module.exports = { listPlans, normalizeWelcomePlan };
