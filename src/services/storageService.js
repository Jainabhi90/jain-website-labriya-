import { supabase } from "@/lib/supabase";

/**
 * Converts a Base64 data string into a binary Blob object.
 */
function base64ToBlob(base64Str) {
  const mimeMatch = base64Str.match(/data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const base64Data = base64Str.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return { blob: new Blob([byteArray], { type: mimeType }), mimeType };
}

let cachedWorkingBucket = null;

async function getWorkingBucket() {
  if (cachedWorkingBucket) return cachedWorkingBucket;
  if (!supabase) throw new Error("Supabase client not initialized.");

  const candidateBuckets = ["temple-assets", "cms-assets", "public", "assets"];

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && buckets.length > 0) {
      const match = buckets.find(b => candidateBuckets.includes(b.name));
      if (match) {
        cachedWorkingBucket = match.name;
        return cachedWorkingBucket;
      }
      cachedWorkingBucket = buckets[0].name;
      return cachedWorkingBucket;
    }
  } catch (e) {
    console.warn("[StorageService] Unable to list buckets:", e.message);
  }

  try {
    const { error } = await supabase.storage.createBucket("temple-assets", { public: true });
    if (!error) {
      cachedWorkingBucket = "temple-assets";
      return cachedWorkingBucket;
    }
  } catch {
    /* ignore */
  }

  cachedWorkingBucket = "temple-assets";
  return cachedWorkingBucket;
}

export const storageService = {
  /**
   * Uploads a single physical image to Supabase Storage and returns its public HTTPS URL.
   * Throws an explicit error if upload fails (no silent fallbacks).
   */
  async uploadSingleImage(imageInput, fieldName = "cms_image") {
    if (!imageInput) return "";
    
    // If it's already a public URL or path, return as is
    if (typeof imageInput === "string" && !imageInput.startsWith("data:")) {
      return imageInput;
    }

    if (!supabase) {
      throw new Error("Supabase client not configured for image uploads.");
    }

    const startTime = Date.now();
    const { blob, mimeType } = base64ToBlob(imageInput);
    const ext = mimeType.split("/")[1] || "png";

    const targetBucket = await getWorkingBucket();
    const cleanField = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const uniquePath = `cms/${cleanField}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;

    const { error } = await supabase.storage
      .from(targetBucket)
      .upload(uniquePath, blob, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.error(`[StorageService Upload Error] Field: '${fieldName}', Bucket: '${targetBucket}':`, error.message);
      
      // Attempt fallback bucket 'public' before throwing
      const { error: fbError } = await supabase.storage
        .from("public")
        .upload(uniquePath, blob, { contentType: mimeType, cacheControl: "3600", upsert: true });

      if (fbError) {
        throw new Error(`Failed to upload image for '${fieldName}': ${error.message}`);
      }

      const { data: fbUrlData } = supabase.storage.from("public").getPublicUrl(uniquePath);
      const duration = Date.now() - startTime;
      const publicUrl = fbUrlData?.publicUrl;
      console.log(`[Storage Upload Success] ${fieldName} -> ${publicUrl} (${duration}ms)`);
      return publicUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(uniquePath);

    const duration = Date.now() - startTime;
    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error(`Could not generate public URL for '${fieldName}' after upload.`);
    }

    console.log(`[Storage Upload Success] ${fieldName} -> ${publicUrl} (${duration}ms)`);
    return publicUrl;
  },

  /**
   * Process all image uploads with Deduplication & Alias Syncing.
   * Replaces Base64 values with Storage URLs BEFORE diffing.
   */
  async processImageUploadsWithAliases(currentSettings, initialSettings = {}) {
    const startTime = Date.now();
    const processed = { ...currentSettings };
    const uploadedUrlsMap = new Map(); // base64 string -> uploaded HTTPS URL
    let uploadCount = 0;
    const uploadedFields = [];

    // Image fields that should share templeLogo URL if templeLogo is updated
    const logoAliases = ["portalLogo", "footerLogo", "adminLogo", "loadingLogo"];

    // 1. Check if templeLogo is a new Base64 upload
    if (typeof processed.templeLogo === "string" && processed.templeLogo.startsWith("data:")) {
      if (processed.templeLogo !== initialSettings.templeLogo) {
        console.log("[Storage Uploading] templeLogo (Primary branding image)...");
        const logoUrl = await this.uploadSingleImage(processed.templeLogo, "templeLogo");
        uploadedUrlsMap.set(processed.templeLogo, logoUrl);
        processed.templeLogo = logoUrl;
        uploadCount++;
        uploadedFields.push("templeLogo");

        // Sync branding alias fields to use the EXACT SAME uploaded URL (Zero duplicate uploads!)
        logoAliases.forEach(aliasKey => {
          processed[aliasKey] = logoUrl;
        });
      }
    }

    // 2. Process all other image fields with deduplication
    const imageKeys = [
      "heroBanner", "aboutHeroBanner", "guruImage", "donationQr",
      "dashboardBanner", "loginBackground", "defaultEventBanner"
    ];

    for (const key of imageKeys) {
      const val = processed[key];
      if (typeof val === "string" && val.startsWith("data:")) {
        if (val !== initialSettings[key]) {
          // If this exact Base64 string was already uploaded, reuse returned URL
          if (uploadedUrlsMap.has(val)) {
            processed[key] = uploadedUrlsMap.get(val);
          } else {
            console.log(`[Storage Uploading] ${key}...`);
            const publicUrl = await this.uploadSingleImage(val, key);
            uploadedUrlsMap.set(val, publicUrl);
            processed[key] = publicUrl;
            uploadCount++;
            uploadedFields.push(key);
          }
        }
      }
    }

    const totalUploadTimeMs = Date.now() - startTime;
    return { processedObj: processed, uploadCount, uploadedFields, totalUploadTimeMs };
  }
};
