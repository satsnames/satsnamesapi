export function getCodePoints(str: string) {
  const codePoints = str.split("").map((char) => {
    const point = char.codePointAt(0);
    if (typeof point === "undefined") return "";

    if (point <= 256) {
      return char;
    } else {
      return `{\\u${point.toString(16)}}`;
    }
  });

  return codePoints.join("");
}
