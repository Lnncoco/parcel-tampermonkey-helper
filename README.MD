# parcel-tampermonkey-helper

parcel 的油猴脚本编写辅助插件。

1. 以现代化的前端工程项目编写脚本，享受现代化的库调用与代码分析优化
2. 一次性生成油猴脚本目标文件，无需手动组装 UserScript 数据
3. 自动分析 `GM_*` 函数与 `unsafeWindow` 并在 UserScript 中生成
4. 使用 JSON 文件配置 UserScript，方便维护管理
5. 更方便的 CSS 内联方式
6. 开发模式生成调试代码，支持热更新开发

## 插件使用

得益于 `parcel` 的便捷性，只需要配置 `parcel` 使用此插件即可开始工作。

1. 首先已安装好 `parcel`，再安装插件包

   ```
   npm i parcel-tampermonkey-helper
   ```

2. 项目下新建配置文件 `.parcelrc`，引入配置包即可：

   ```
   {
     "extends": [
       "@parcel/config-default",
       "parcel-config-tampermonkey-helper"
     ]
   }
   ```

## 插件配置

在 `package.json` 中可以对插件进行配置（一般无需配置）

```json
{
  "tampermonkey": {
    "metaPath": "./meta.json", // 默认值 同目录下的meta.json 可自定义文件位置
    "parser": "SWC" | "REGEX" // 默认值 SWC
  }
}
```

## UserScript 信息

油猴脚本使用时需要添加 UserScript 信息，默认读取根目录下的 `meta.json` 文件。

`meta.json` 文件以键值对的形式定义所需的 UserScript 信息。可重复的字段使用数组定义，不可重复的字段填写字符串。

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

`meta.json` 示例：

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

## 添加 CSS

由于油猴脚本是 JS 文件，引入 CSS 相对比较麻烦，官方提供了 `GM_addStyle` 函数插入 CSS。

对于较小的文件可以直接使用 `GM_addStyle` 添加。

较大的 CSS 需要在 UserScript 中定义 `@resource`，然后使用 `GM_getResourceURL` 或 `GM_getResourceText` 读取信息，再传入 `GM_addStyle`。

在工程项目中将 CSS 写成文本相对不方便，缺少语法提示或是需要手动处理。在 Parcel 中可以使用命名管道语法 `bundle-text:`，使用后会自动将引入的 CSS 转换成文本：

```typescript
import style from "bundle-text:./style.css";
GM_addStyle(style);
```
