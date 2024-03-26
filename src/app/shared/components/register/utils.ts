/**
 * Eliminar carácteres especiales.
 * @param value
 * @returns
 */
export const removeSpecialCharacters = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[!@#$^&%*()+=\-[\]/\{}|:<>?,.]/g, '') // Elimina caracteres especiales
    .replace(/ /g, '_') // Reemplaza espacios con guiones bajos
    .replace(/[áéíóú]/gi, function (match: string) {
      // Elimina acentos
      return (
        {
          á: 'a',
          é: 'e',
          í: 'i',
          ó: 'o',
          ú: 'u',
        }[match.toLowerCase()] || match
      ); // Devuelve match si no hay coincidencia en el objeto de mapeo
    })
    .replace(/ñ/gi, 'n'); // Reemplaza la "ñ" con "n"
};
