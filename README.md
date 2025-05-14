# ECode for Go

[![VS Code](https://img.shields.io/badge/visual-studio-marketplace)](https://marketplace.visualstudio.com/items?itemName=eframework-org.vsc-go)
![Version](https://img.shields.io/visual-studio-marketplace/v/eframework-org.vsc-go)
![Installs](https://img.shields.io/visual-studio-marketplace/i/eframework-org.vsc-go)  
[![Open VSC](https://img.shields.io/badge/open--vsc-registry-blue)](https://open-vsx.org/extension/eframework-org/vsc-go)
![Version](https://img.shields.io/open-vsx/v/eframework-org/vsc-go)
![Installs](https://img.shields.io/open-vsx/dt/eframework-org/vsc-go)  
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Explore-blue)](https://deepwiki.com/eframework-org/VSC.GO)

ECode for Go 优化了 Gopher 们的开发流程，包括快速构建及调试等。

## 功能特性

- 📦 支持多项目配置
- 🚀 快速构建和调试

## 使用手册

### 功能清单

- 🔨 Build Project(s)：编译项目
- 🚀 Start Project(s)：运行项目
- 🛑 Stop Project(s)：停止项目
- 🪲 Debug Project(s)：调试项目
- 📝 Edit Project(s)：编辑项目
- 📄 Show Output(s)：显示输出
- 🎛️ Show Command(s)：控制面板

### 配置说明

| 字段 | 必要 | 说明 |
| --- | :---: | --- |
| arch | ✅ | 指令集架构：arm/arm64/amd64/386 等 |
| os | ✅ | 运行时平台：windows/linux/darwin 等 |
| scriptPath | ✅ | 源码路径 |
| buildPath | ✅ | 构建输出路径 |
| buildArgs | ➖ | 构建参数，参考：go help build |
| buildCopy | ➖ | 构建后复制的文件，支持 glob 和路径映射 |
| startArgs | ➖ | 启动参数 |
| startDelay | ➖ | 启动延迟（秒） |
| stopDelay | ➖ | 停止延迟（秒） |
| stopPort | ➖ | 端口文件路径 |
| dlvFlags | ➖ | 调试参数 |
| extends | ➖ | 拓展配置 |

### 配置示例

```json
{
    "vsc-go.projectList": {
        "Greet": {
            "base": {
                "arch": "amd64",
                "os": "windows",
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
