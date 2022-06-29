# parcel-optimizer-tampermonkey-helper

`parcel-optimizer-tampermonkey-helper` 是 parcel 的油猴脚本编写辅助插件：

1. 以现代化的前端工程项目编写脚本，享受现代化的库调用与代码分析优化
2. 一次性生成油猴脚本目标文件，无需手动组装 UserScript 数据
3. 自动分析 `GM_*` 函数与 `unsafeWindow` 并在 UserScript 中生成
4. 使用 JSON 文件配置 UserScript，方便维护管理
5. 更方便的 CSS 内联方式
6. 开发模式生成调试代码，支持热更新开发

使用请安装 `parcel-config-tampermonkey-helper` 配置包。

本插件做以下事项：

1. 分析项目中用到的 `GM_*` 与 `unsafeWindow`
2. 读取 UserScript 的 JSON 配置并组装到目标文件中
3. 开发模式生成 `dev.js` 文件供调试使用

## 插件配置

在 `package.json` 中可以对插件进行配置（一般无需配置）

```json5
{
  tampermonkey: {
    metaPath: "./userScriptPath.json", // 默认值 同目录下的userScriptPath.json 可自定义文件位置
    parser: "SWC", // SWC | REGEX 默认值 SWC
  },
}
```

## UserScript 信息

油猴脚本使用时需要添加 UserScript 信息，默认读取根目录下的 `userScriptPath.json` 文件。

`userScriptPath.json` 文件以键值对的形式定义所需的 UserScript 信息。可重复的字段使用数组定义，不可重复的字段填写字符串。

编码中使用到的 `GM_*` 与 `unsafeWindow` 函数需要使用 `@grant` 先申明一下，程序会自动分析使用到的函数，并与配置文件中的定义融合。

支持数组的字段：

```typescript
  "@include": string[];
  "@match": string[];
  "@exclude": string[];
  "@require": string[];
  "@resource": string[];
  "@connect": string[];
  "@grant": "none" | string[]; // none则仅允许写入GM_info函数 为字符串数组则与提取函数名合并
```

以下信息若为空时，会使用 `package.json` 中的数据填充。

```typescript
  "@name": string; // package.json#name
  "@version": string; // package.json#version
  "@namespace": string; // package.json#homepage
  "@author": string; // package.json#author
  "@description": string; // package.json#description
```

`userScriptPath` 示例：

```json
{
  "@description": "示例",
  "@run-at": "document-end",
  "@match": ["*://www.example.com/*"],
  "@require": ["https://unpkg.com/jquery@3.6.0/dist/jquery.js"]
}
```

## 开发模式

当以 `parcel watch` 启动时，会在输出目录生成一个调试用的 `*.dev.js` 文件。

使用前需要手动执行几个步骤：

1. 在浏览器中开启 Tampermonkey 插件的 “允许访问文件 URL”，以便本地环境开发调试。
2. Tampermonkey 插件中“添加新的脚本”，将生成的 `*.dev.js` 文件内容复制到其中即可。

## 配置 HRM 连接地址

HRM 默认使用浏览器地址连接，但不适合脚本的开发场景，导致无法正确连接到服务没法自动刷新。

使用 `--host` 参数指定地址即可： `parcel watch --host localhost` 。
