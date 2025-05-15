# ECode for Go

[![VS Code](https://img.shields.io/badge/visual-studio-marketplace)](https://marketplace.visualstudio.com/items?itemName=eframework-org.vsc-go)
![Version](https://img.shields.io/visual-studio-marketplace/v/eframework-org.vsc-go)
![Installs](https://img.shields.io/visual-studio-marketplace/i/eframework-org.vsc-go)  
[![Open VSC](https://img.shields.io/badge/open--vsc-registry-blue)](https://open-vsx.org/extension/eframework-org/vsc-go)
![Version](https://img.shields.io/open-vsx/v/eframework-org/vsc-go)
![Installs](https://img.shields.io/open-vsx/dt/eframework-org/vsc-go)  
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Explore-blue)](https://deepwiki.com/eframework-org/VSC.GO)

ECode for Go 优化了 Gopher 们的开发体验，提供快速构建与调试能力，兼容 Cursor、Trae 等 VSCode Like 编辑器。

## 功能特性

- 📦 支持多项目配置
- 🚀 快速构建和调试

## 使用手册

### 功能清单

- 🪲 Debug Project(s)：调试项目
- 🛑 Stop Project(s)：停止项目
- 🚀 Start Project(s)：启动项目
- 🔨 Build Project(s)：构建项目
- 📝 Edit Project(s)：编辑项目
- 📄 Show Output(s)：显示输出
- 🎛️ Show Command(s)：显示命令

### 配置说明

| 字段 | 必要 | 说明 |
| --- | :---: | --- |
| os | ✅ | 运行时平台，参考 GOOS |
| arch | ✅ | 指令集架构，参考 GOARCH |
| scriptPath | ✅ | 源码路径 |
| buildPath | ✅ | 构建路径 |
| buildArgs | ➖ | 构建参数，参考 go help build |
| buildCopy | ➖ | 构建拷贝，支持 glob 和路径映射 |
| startArgs | ➖ | 启动参数 |
| startDelay | ➖ | 启动延迟 |
| stopDelay | ➖ | 停止延迟 |
| stopPort | ➖ | 端口文件 |
| dlvFlags | ➖ | 调试参数 |
| extends | ➖ | 拓展配置 |

### 配置示例

```json
{
    "vsc-go.projectList": {
        "Greet": {
            "base": {
                "os": "windows",
                "arch": "amd64",
                "scriptPath": "src/main",
                "buildPath": "bin",
                "buildCopy": [
                    "configs/*.json",
                    "assets/data:resources"
                ]
            },
            "debug.windows.amd64": {
                "extends": "base"
            },
            "release.windows.amd64": {
                "extends": "base",
                "buildArgs": ["-trimpath"]
            }
        }
    }
}
```

## 常见问题

更多问题，请查阅[问题反馈](CONTRIBUTING.md#问题反馈)。

## 项目信息

- [更新记录](CHANGELOG.md)
- [贡献指南](CONTRIBUTING.md)
- [许可证](LICENSE)
