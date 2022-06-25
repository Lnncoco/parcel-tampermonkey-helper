/**
 * 正则 REGEX - GM函数提取
 * @param code 源码文本
 */
export const parser = (code: string) => {
  const data = new Set<string>();
  const regAnnotation = /\/\*[\s\S]*\*\/|\/\/.*$/gm;
  const text = code.replace(regAnnotation, "");
  // unsafeWindow
  const regUnsafeWindow = /unsafeWindow./;
  if (regUnsafeWindow.test(text)) data.add("unsafeWindow");
  // GM_*
  const funcs = text.matchAll(/(GM_.*?)\(/g);
  for (const func of funcs) {
    const name = func[1].trim();
    data.add(name);
  }
  return data;
};
