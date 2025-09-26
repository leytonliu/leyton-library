/**
 * @description check if a string is a color string
 * @param str
 * @returns {boolean}
 */
export function isColor(str) {
    if (!str) {
        return false;
    }
    const style = new Option().style;
    style.color = str;
    return style.color !== '';
}
