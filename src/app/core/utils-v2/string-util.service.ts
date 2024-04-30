export class StringUtilService {
  /**
   * Poner primera letra en mayúscula.
   * @param input
   * @returns
   */
  static capitalizeFirstLetter(input: string): string {
    if (!input.length) return input;
    const firstLetter = input.charAt(0).toUpperCase();
    const restOfString = input.slice(1);
    return firstLetter + restOfString;
  }
}
