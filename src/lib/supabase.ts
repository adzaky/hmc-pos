import type { Bucket } from "@/server/bucket";

import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function uploadFileToSignedUrl({
  file,
  path,
  token,
  bucket,
}: {
  file: File;
  path: string;
  token: string;
  bucket: Bucket;
}) {
  try {
    const result = await supabaseClient.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file);

    if (result.error) throw result.error;
    if (!result.data) throw new Error("No data");

    const fileurl = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(result.data.path);

    return fileurl.data.publicUrl;
  } catch (error) {
    throw error;
  }
}
