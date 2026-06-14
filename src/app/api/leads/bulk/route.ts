import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { createLead } from "@/lib/leads";

interface CsvRow {
  name?: string;
  mobile?: string;
  last_purchase?: string;
  context?: string;
  offer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });

    const imported: string[] = [];
    const duplicates: { row: number; mobile: string }[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const rowNum = i + 2;

      if (!row.name?.trim() || !row.mobile?.trim()) {
        errors.push({
          row: rowNum,
          error: "name and mobile are required",
        });
        continue;
      }

      const result = await createLead({
        name: row.name,
        mobile: row.mobile,
        last_purchase: row.last_purchase,
        context: row.context,
        offer_text: row.offer,
      });

      if (result.duplicate) {
        duplicates.push({ row: rowNum, mobile: row.mobile });
        continue;
      }

      if (!result.success) {
        errors.push({ row: rowNum, error: result.error ?? "Import failed" });
        continue;
      }

      imported.push(result.lead!.id);
    }

    return NextResponse.json({
      imported: imported.length,
      duplicates,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk import failed" },
      { status: 500 },
    );
  }
}
