const translationCache: Record<string, string> = {};

export async function translateText(text: string, targetLang: string | null | undefined): Promise<string> {
  if (!text || !targetLang) return text;
  
  // Normalize targetLang
  let lang = targetLang.toLowerCase().trim();
  if (lang.startsWith("en")) return text;

  // Handle standard short codes (e.g. 'hi-IN' -> 'hi', 'bn-IN' -> 'bn')
  if (lang.includes("-") && lang !== "zh-cn") {
    lang = lang.split("-")[0];
  }

  const cacheKey = `${lang}:${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;

    const data = await res.json();
    const translated = data?.[0]?.[0]?.[0] || text;
    translationCache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.error(`Translation failed for: "${text}" into language: "${lang}"`, err);
    return text;
  }
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[],
  targetLang: string | null | undefined
): Promise<T> {
  if (!targetLang || targetLang.toLowerCase().trim().startsWith("en")) {
    return obj;
  }

  const translatedObj = { ...obj };
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string") {
      translatedObj[key] = (await translateText(val, targetLang)) as any;
    }
  }
  return translatedObj;
}

export async function translateArray<T extends Record<string, any>>(
  arr: T[],
  keys: (keyof T)[],
  targetLang: string | null | undefined
): Promise<T[]> {
  if (!targetLang || targetLang.toLowerCase().trim().startsWith("en") || !Array.isArray(arr)) {
    return arr;
  }

  return Promise.all(arr.map((item) => translateObject(item, keys, targetLang)));
}
