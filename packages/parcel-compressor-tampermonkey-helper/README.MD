# parcel-compressor-tampermonkey-helper

`parcel-compressor-tampermonkey-helper` 是 parcel 的油猴脚本编写辅助插件：

1. 以现代化的前端工程项目编写脚本，享受现代化的库调用与代码分析优化
2. 一次性生成油猴脚本目标文件，无需手动组装 UserScript 数据
3. 自动分析 `GM_*` 函数与 `unsafeWindow` 并在 UserScript 中生成
4. 使用 JSON 文件配置 UserScript，方便维护管理
5. 更方便的 CSS 内联方式
6. 开发模式生成调试代码，支持热更新开发

使用请安装 `parcel-config-tampermonkey-helper` 配置包。

本插件做以下事项：

1. 开发模式的时候生成`dev.js`文件供调试使用
