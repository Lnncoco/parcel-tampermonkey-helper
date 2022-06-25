import type { arg } from "../types";

export type UserScript = Partial<{
  // 若为空则使用package中的信息
  "@name": string; // name 必存在
  "@version": string; // version 必存在
  "@namespace": string; // homepage
  "@author": string; // author
  "@description": string; // description
  // 字符串数组
  "@include": string[];
  "@match": string[];
  "@exclude": string[];
  "@require": string[];
  "@resource": string[];
  "@connect": string[];
  // 使用的函数申明列表
  "@grant": "none" | string[]; // none则不写入提取函数名 为字符串数组则与提取函数名合并
  // 其他信息
  "@homepage": string;
  "@homepageURL": string;
  "@website": string;
  "@source": string;
  "@icon": string;
  "@iconURL": string;
  "@defaulticon": string;
  "@icon64": string;
  "@icon64URL": string;
  "@updateURL": string;
  "@downloadURL": string;
  "@supportURL": string;
  "@run-at": string;
  "@noframes": string;
  "@unwrap": string;
  "@nocompat": string;
}>;

/**
 * 脚本的配置信息
 * @param arg
 */
export const getUserScript = async ({ config }: arg) => {
  let { contents: packageContents } = await config.getConfig<{
    name: string;
    version: string;
    homepage: string;
    author?: string;
    description?: string;
    tampermonkey?: {
      userScriptPath?: string;
    };
  }>(["package.json"], {});

  let { contents: userScriptContents } = await config.getConfig<UserScript>(
    [packageContents?.tampermonkey?.userScriptPath ?? "userscript.json"],
    {}
  );

  return {
    "@name": packageContents.name,
    "@version": packageContents.version,
    "@namespace": packageContents.homepage,
    "@author": packageContents.author,
    "@description": packageContents.description,
    ...userScriptContents,
  };
};

/**
 * 脚本优先字段
 */
const priorityKey = [
  "@name",
  "@version",
  "@namespace",
  "@author",
  "@description",
];

/**
 * 作为数组处理的字段
 */
const arrayKey = [
  "@include",
  "@match",
  "@exclude",
  "@require",
  "@resource",
  "@connect",
];

/**
 * 生成脚本文件头
 */
export const generateUserScriptHeader = (
  userScript: UserScript,
  funcs: string[],
  callback: () => string | null
) => {
  let header = "// ==UserScript==\r\n";
  const userScriptConfig: UserScript = JSON.parse(JSON.stringify(userScript));
  // @grant 信息最后处理
  const grant = userScriptConfig["@grant"];
  delete userScriptConfig["@grant"];

  const each = (text: string, key: string) => {
    const userScriptKey = `// ${key}`;
    const curData: string | string[] = userScriptConfig[key];
    if (!curData || !curData.length) return text;

    if (Array.isArray(curData)) {
      curData.forEach((str) => (text += `${userScriptKey} ${str}\r\n`));
    } else {
      text += `${userScriptKey} ${curData}\r\n`;
    }
    delete userScriptConfig[key];
    return text;
  };

  // 根据顺序生成元信息
  header += priorityKey.reduce(each, "");
  header += arrayKey.reduce(each, "");
  // 其余信息填充
  for (const [key, val] of Object.entries(userScriptConfig)) {
    header += `// ${key} ${val}\r\n`;
  }
  // @grant 信息
  header += processingGrant(grant, funcs);
  // 执行回调
  if (callback) {
    const insertion = callback();
    if (insertion) header += `${insertion}\r\n`;
  }

  header += "// ==/UserScript==\r\n";
  return header;
};

/**
 * 生成 grant 信息
 * @param grant 配置的 grant 信息
 * @param funcs 解析器提取的使用函数列表
 */
const processingGrant = (
  grant: "none" | string[] | undefined,
  funcs: string[]
) => {
  const userScriptKey = "// @grant";
  let header = "";
  if (grant === "none") {
    header += `${userScriptKey} none\r\n`;
    if (funcs.includes("GM_info")) {
      // none 下除了 GM_info 其余函数都禁用
      header += `${userScriptKey} GM_info\r\n`;
    }
    return header;
  }

  if (grant && grant.length) {
    grant.forEach((text) => (header += `${userScriptKey} ${text}\r\n`));
  }
  funcs.forEach((text) => (header += `${userScriptKey} ${text}\r\n`));
  return header;
};
