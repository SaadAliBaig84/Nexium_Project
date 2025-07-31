// pdf-parse.d.ts
declare module "pdf-parse/lib/pdf-parse" {
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
    text: string;
  }

  interface PDFData {
    text: string;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
    numpages: number;
  }

  interface PDFParseOptions {
    pagerender?: (pageData: unknown) => Promise<string>;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFData>;

  export default pdfParse;
}
