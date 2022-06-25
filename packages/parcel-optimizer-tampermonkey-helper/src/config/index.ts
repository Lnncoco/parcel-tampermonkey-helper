import type { arg } from "../types";
import type { UserScript } from "./userScript";
export { getUserScript, generateUserScriptHeader } from "./userScript";

type Parser = "SWC" | "REGEX";
interface HelperConfig {
  parser?: Parser;
}

/**
 * 插件的配置信息
 * @param arg
 */
export const getHelperConfig = async ({ config, options }: arg) => {
  let { contents } = await config.getConfig<HelperConfig>(["package.json"], {
    packageKey: "tampermonkey",
  });

  return {
    parser: (contents.parser?.toUpperCase() as Parser) ?? "SWC",
  };
};

/**
 * 读取文件存放路径
 * TODO 同一文件可能输出多个位置
 * @param arg
 */
export const getOutputPath = async ({ config, options }: arg) => {
  let { contents } = await config.getConfig<any>(["package.json"], {});

  const pathMain = contents?.main;
  const pathBrowser = contents?.browser;
  const pathDistDir = contents?.targets?.default?.distDir;

  return pathMain ?? pathBrowser ?? pathDistDir ?? "dist/index.js";
};

/**
 * 最终导出的Config
 */
export interface ConfigType {
  helperConfig: HelperConfig;
  userScript: UserScript;
  outputFilePath: string;
}
