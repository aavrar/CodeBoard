declare module 'eld' {
  interface ELDResult {
    language: string;
    accuracy: number;
  }

  interface ELDInterface {
    detect(text: string): ELDResult | null;
    cleanText(text: string): string;
    dynamicLangSubset(languages: string[]): void;
    info(): object;
  }

  export const eld: ELDInterface;
}