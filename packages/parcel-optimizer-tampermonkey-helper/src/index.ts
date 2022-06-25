import { Optimizer } from "@parcel/plugin";
import { blobToString } from "@parcel/utils";
import { join as pathJoin } from "path";
import { SwcParser, RegexParser } from "./parser";
import {
  ConfigType,
  getOutputPath,
  getHelperConfig,
  getUserScript,
  generateUserScriptHeader,
} from "./config";

// GM函数使用信息
let tampermonkeyFuncInfo: Set<string> = new Set();

export default new Optimizer<ConfigType>({
  async loadConfig(arg) {
    return {
      helperConfig: await getHelperConfig(arg),
      userScript: await getUserScript(arg),
      outputFilePath: await getOutputPath(arg),
    };
  },
  async optimize({ contents, map, config, options }) {
    const code = await blobToString(contents);

    // 解析使用到的函数
    if (config?.helperConfig.parser === "REGEX") {
      tampermonkeyFuncInfo = RegexParser(code);
    } else {
      tampermonkeyFuncInfo = SwcParser(code);
    }

    // 处理脚本头部信息
    const devFilePath = config.outputFilePath;
    const helperUserScript = generateUserScriptHeader(
      config.userScript,
      Array.from(tampermonkeyFuncInfo),
      () =>
        requireLoaclFile({
          mode: options.mode,
          projectRoot: options.projectRoot,
          devFilePath,
        })
    );

    return {
      contents: `${helperUserScript}\r\n${code}`,
      map,
    };
  },
});

/**
 * 开发模式引入本地文件
 * 默认路径 dist/index.js，package.json 中的 browser 、 main 、 targets.default.distDir 字段可配置输出位置，同时存在同时输出
 * @param options
 */
const requireLoaclFile = ({
  mode,
  projectRoot,
  devFilePath = "dist/index.js",
}: {
  mode: string;
  projectRoot: string;
  devFilePath?: string;
}) => {
  if (mode === "production") return null;
  const timestampStr = `t=${Date.now()}`;
  const requireKey = `// @require `;

  const path = `file://${pathJoin(projectRoot, devFilePath)}`;
  return `${requireKey}${path}?${timestampStr}`;
};
