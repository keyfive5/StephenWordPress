const DEFAULT_CURRENCY = 'USD';

const parseMaybeJson = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

export const parseProductMisc = (value) => {
  const parsedValue = parseMaybeJson(value);
  return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
};

export const getProductPricing = (product = {}) => {
  const misc = parseProductMisc(product.misc);
  const miscPricing = parseProductMisc(misc.pricing);

  const basePrice =
    toNumber(product.basePrice) ??
    toNumber(miscPricing.basePrice) ??
    toNumber(misc.basePrice) ??
    toNumber(miscPricing.amount) ??
    toNumber(miscPricing.price) ??
    toNumber(miscPricing.totalPrice) ??
    toNumber(misc.totalPrice) ??
    0;

  const usdPrice =
    toNumber(miscPricing.USD) ??
    toNumber(miscPricing.usd) ??
    toNumber(misc.usdPrice) ??
    toNumber(product.usdPrice) ??
    basePrice;

  const cadPrice =
    toNumber(miscPricing.CAD) ??
    toNumber(miscPricing.cad) ??
    toNumber(misc.cadPrice) ??
    toNumber(product.cadPrice) ??
    basePrice;

  return {
    basePrice,
    usdPrice,
    cadPrice,
    currency: miscPricing.currency || misc.currency || DEFAULT_CURRENCY,
    misc,
  };
};

export const buildProductPricingMisc = ({ basePrice, usdPrice, cadPrice, currency = DEFAULT_CURRENCY, ...rest } = {}) => {
  const safeBasePrice = toNumber(basePrice) ?? 0;
  const safeUsdPrice = toNumber(usdPrice) ?? safeBasePrice;
  const safeCadPrice = toNumber(cadPrice) ?? safeBasePrice;

  return {
    ...rest,
    pricing: {
      currency,
      basePrice: safeBasePrice,
      USD: safeUsdPrice,
      usd: safeUsdPrice,
      CAD: safeCadPrice,
      cad: safeCadPrice,
    },
  };
};

export const resolvePriceForCurrency = (productOrPricing, currency = DEFAULT_CURRENCY) => {
  const pricing = productOrPricing?.usdPrice !== undefined
    ? productOrPricing
    : getProductPricing(productOrPricing || {});

  return currency === 'CAD'
    ? pricing.cadPrice ?? pricing.basePrice ?? 0
    : pricing.usdPrice ?? pricing.basePrice ?? 0;
};

export const formatMoney = (value, currency = DEFAULT_CURRENCY) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 'N/A';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};
