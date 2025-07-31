// pdf-parse.d.ts
declare module "pdf-parse/lib/pdf-parse" {
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    version: string;
    text: string;
  }

  interface PDFData {
    text: string;
    info: PDFInfo["info"];
    metadata: any;
    version: string;
    numpages: number;
  }

  interface PDFParseOptions {
    pagerender?: (pageData: any) => Promise<string>;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFData>;

  export default pdfParse;
}
