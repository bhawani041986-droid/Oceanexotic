import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Define the Physical Vault Path - Redirected to original for pipeline processing
    const uploadDir = path.join(process.cwd(), "public", "uploads", "original");
    
    // Ensure the directory exists (Automatic Path Repair)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename to prevent maritime collisions
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    // Commit to Filesystem
    fs.writeFileSync(filePath, buffer);

    // Return the stable Public URL (Original for now, background worker creates optimized)
    const publicUrl = `/uploads/original/${fileName}`;
    console.log(`✅ Asset Committed to Pipeline Inbox: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("❌ Maritime Asset Pipeline Error:", error);
    return NextResponse.json({ error: "Failed to upload asset" }, { status: 500 });
  }
}
