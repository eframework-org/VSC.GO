// Copyright (c) 2025 EFramework Organization. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

/**
 * 插件入口模块，负责初始化、命令注册、视图渲染和流程控制。
 */

import * as vscode from "vscode"
import { XEnv, XFile, XLog, XString } from "org.eframework.uni.util"
import { Build } from "./Build"
import { Debug } from "./Debug"
import { Start } from "./Start"
import { Stop } from "./Stop"
import { Project } from "./Project"

/** 插件命令列表。 */
const commands = [
    {
        ID: `${XEnv.Identifier}.buildProject`,
        /** 处理构建项目的命令。 */
        Handler: async (context: string | Project) => {
            const projects = await selects(context, "build", "release")
            await Build.Process(projects, false)
        }
    },
    {
        ID: `${XEnv.Identifier}.startProject`,
        /** 处理启动项目的命令。 */
        Handler: async (context: string | Project) => {
            const projects = await selects(context, "start", "release", goArch(), goPlat())
            await Stop.Process(projects)
            await Start.Process(projects)
        }
    },
    {
        ID: `${XEnv.Identifier}.stopProject`,
        /** 处理停止项目的命令。 */
        Handler: async (context: string | Project) => {
            const projects = await selects(context, "stop", "debug", goArch(), goPlat())
            await Stop.Process(projects)
        }
    },
    {
        ID: `${XEnv.Identifier}.debugProject`,
        /** 处理调试项目的命令。 */
        Handler: async (context: string | Project) => {
            const projects = await selects(context, "debug", "debug", goArch(), goPlat())
            await Stop.Process(projects)
            await Build.Process(projects, true)
            await Debug.Process(projects)
        }
    },
    {
        ID: `${XEnv.Identifier}.editProject`,
        /** 处理编辑项目的命令。 */
        Handler: async () => vscode.commands.executeCommand("workbench.action.openSettings", `@id:${XEnv.Identifier}.projectList`)
    },
    {
        ID: `${XEnv.Identifier}.showOutput`,
        /** 处理显示输出的命令。 */
        Handler: async () => vscode.commands.executeCommand("workbench.action.output.toggleOutput")
    },
    {
        ID: `${XEnv.Identifier}.showCommand`,
        /** 显示命令面板的命令。 */
        Handler: async () => {
            try {
                const pkg = vscode.extensions.getExtension(`${XEnv.Author}.${XEnv.Identifier}`).packageJSON
                let cmds: Array<{ title: any, command: string }> = pkg.contributes ? pkg.contributes.commands : null
                if (cmds && cmds.length > 1) {
                    cmds = cmds.slice(0, cmds.length - 1)
                    // e.title.value 兼容多语言环境
                    const ret = await vscode.window.showQuickPick(cmds.map((e) => e.title.value ? e.title.value : e.title))
                    const cmd = cmds.find(e => e.title == ret || e.title.value == ret)
                    if (cmd) vscode.commands.executeCommand(cmd.command)
                }
            } catch (err) {
                XLog.Panic(err)
            }
        }
    }
]

/** 项目配置列表。 */
const projects = new Array<Project>()

/** 项目调试会话。 */
const sessions: Map<string, vscode.DebugSession> = new Map()

/** 树形视图实例。 */
var tree: vscode.TreeView<any>

/** 树形视图事件。 */
var treeEvent = new vscode.EventEmitter<void>()

/** 选择视图实例。 */
var selector: vscode.QuickPick<vscode.QuickPickItem>

/**
 * 选择项目配置。
 * @param action 当前操作名称。
 * @param matchs 匹配条件列表。
 * @returns 返回选中的项目配置列表。
 */
async function selects(context: string | Project, action: string, ...matchs: string[]): Promise<Project[]> {
    return new Promise<Project[]>((resolve, reject) => {
        try {
            const proj = vscode.workspace.rootPath
            const file = XFile.PathJoin(XEnv.LocalPath, "Selected.prefs")
            let bytree = false
            let labels = new Array<string>()
            if (context || (tree && tree.selection && tree.selection.length > 0)) {
                bytree = true
                let tmps = new Array<any>()
                if (context) tmps.push(context)
                if (tree && tree.selection && tree.selection.length > 0) tmps = tmps.concat(tree.selection)
                tmps.forEach(k => {
                    if (typeof (k) == "string") projects.forEach(v => { if (v.Name == k) labels.push(v.ID) })
                    else if (k instanceof Project) labels.push(k.ID)
                })
                labels = Array.from(new Set(labels))
            } else {
                projects.forEach(v => labels.push(v.ID))
            }

            /**
             * 获取本地已选择的项目配置。
             * @param raws 原始项目配置列表。
             * @returns 返回已选择的项目配置列表。
             */
            function getLocalSelected(raws: readonly vscode.QuickPickItem[]): readonly vscode.QuickPickItem[] {
                if (XFile.HasFile(file)) {
                    let pick = XFile.OpenFile(file)
                    if (pick) {
                        let obj = JSON.parse(pick.toString())
                        if (obj) {
                            obj = obj[proj]
                            if (obj) {
                                obj = obj[action]
                                if (obj) {
                                    let nitems = new Array()
                                    for (let k in obj) {
                                        let v = obj[k]
                                        if (v.label) {
                                            for (let i = 0; i < raws.length; i++) {
                                                let v2 = raws[i]
                                                if (v2.label == v.label) {
                                                    nitems.push(v2)
                                                    break
                                                }
                                            }
                                        }
                                    }
                                    return nitems
                                }
                            }
                        }
                    }
                }
                return raws
            }

            /**
             * 保存本地选择的项目配置。
             * @param raws 需要保存的项目配置列表。
             */
            function saveLocal(raws: readonly vscode.QuickPickItem[]) {
                let allObjs = {}
                if (XFile.HasFile(file)) {
                    let pick = XFile.OpenFile(file)
                    if (pick) allObjs = JSON.parse(pick.toString())
                    if (allObjs == null) allObjs = {}
                }
                let projObj = allObjs[proj]
                if (projObj == null) projObj = {}; allObjs[proj] = projObj
                projObj[action] = raws
                let str = JSON.stringify(allObjs)
                XFile.SaveText(file, str)
            }

            /**
             * 根据匹配条件过滤项目配置。
             * @returns 返回符合条件的项目配置列表。
             */
            function filterProjects(): string[] {
                const filter = new Array<string>()
                for (let i = 0; i < labels.length; i++) {
                    let s = labels[i]
                    let matched = true
                    if (matchs && matchs.length > 0) {
                        let strs = s.split(".")
                        for (let j = 0; j < matchs.length; j++) {
                            let sig = false
                            for (let k = 0; k < strs.length; k++) {
                                if (strs[k] == matchs[j]) {
                                    sig = true
                                    break
                                }
                            }
                            if (sig == false) {
                                matched = false
                                break
                            }
                        }
                    }
                    if (matched) filter.push(s)
                }
                return filter
            }

            /**
             * 处理项目选择确认事件。
             */
            function onDidAccept() {
                if (selector.selectedItems) {
                    const selected = new Array<Project>()
                    for (let i = 0; i < selector.selectedItems.length; i++) {
                        const label = selector.selectedItems[i].label
                        const proj = projects.find(v => v.ID == label)
                        if (proj) {
                            selected.push(proj)
                            break
                        }
                    }
                    saveLocal(selector.selectedItems)
                    selector.dispose()
                    selector = null
                    resolve(selected)
                }
            }

            if (bytree) {
                const filter = filterProjects()
                const selected = new Array<Project>()
                for (let i = 0; i < filter.length; i++) {
                    const proj = projects.find(v => v.ID == filter[i])
                    if (proj) selected.push(proj)
                }
                resolve(selected)
            } else {
                if (selector) {
                    onDidAccept()
                } else {
                    selector = vscode.window.createQuickPick()
                    selector.canSelectMany = true
                    selector.placeholder = vscode.l10n.t(XString.Format("Select project(s) to {0}.", action))
                    selector.items = filterProjects().map(label => ({ label }))
                    selector.selectedItems = getLocalSelected(selector.items)
                    selector.onDidAccept(onDidAccept)
                    selector.onDidHide(() => {
                        selector.dispose()
                        selector = null
                    })
                    selector.show()
                }
            }
        } catch (err) { reject(err) }
    })
}

/**
 * 获取当前 Go 环境的项目架构。
 * @returns 返回项目架构字符串。
 */
function goArch(): string {
    // nodejs-arch: 'arm'、'arm64'、'ia32'、'mips'、'mipsel'、'ppc'、'ppc64'、's390'、's390x'、'x64'
    let arch = process.arch as string
    if (process.arch == "x64") { arch = "amd64" }
    else if (process.arch == "ia32") { arch = "386" }
    return arch
}

/**
 * 获取当前 Go 环境的项目平台。
 * @returns 返回项目平台字符串。
 */
function goPlat(): string { return process.platform == "win32" ? "windows" : process.platform }

/**
 * 插件激活入口函数。
 * @param context 插件上下文。
 */
export function activate(context: vscode.ExtensionContext) {
    /**
     * 解析配置。
     */
    function parseConfig() {
        projects.length = 0
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(XEnv.Identifier)
        const projectList: any = config.get("projectList")
        if (projectList) {
            for (const name in projectList) {
                if (name == "$name") continue
                const oproject = projectList[name]
                const temp = new Map<string, Project>()
                for (const key in oproject) {
                    const raw: Project = oproject[key]
                    const base = temp.get(raw["extends"])
                    const scheme = new Project(name, key, base, raw)
                    temp.set(key, scheme)
                    if (projects.find(v => v.ID == scheme.ID) == null) {
                        projects.push(scheme)
                    }
                }
            }
        }
    }

    // 解析配置
    parseConfig()

    // 监听配置
    vscode.workspace.onDidChangeConfiguration(() => {
        parseConfig()
        treeEvent.fire()
    })

    // 注册命令
    for (let i = 0; i < commands.length; i++) {
        const meta = commands[i]
        vscode.commands.registerCommand(meta.ID, meta.Handler)
    }

    // 监听调试
    vscode.debug.onDidStartDebugSession((session) => {
        if (session) sessions.set(session.name, session)
        treeEvent.fire()
    })
    vscode.debug.onDidTerminateDebugSession((session) => {
        if (session) sessions.delete(session.name)
        treeEvent.fire()
    })

    // 注册视图
    tree = vscode.window.createTreeView("vsc-go.projectList", {
        treeDataProvider: {
            getChildren(element: string | Project): vscode.ProviderResult<any[]> {
                const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(XEnv.Identifier)
                const list: any = config.get("projectList")
                if (list) {
                    if (!element) return Array.from(new Set(projects.map(e => e.Name)))
                    else if (typeof (element) == "string") return projects.filter(e => e.Name == element)
                    else if (element instanceof Project) return Object.keys(element)
                }
            },
            getTreeItem(element: string | Project): vscode.TreeItem {
                if (typeof (element) == "string") {
                    let context = "notdebugging"
                    for (const [key] of sessions) {
                        const proj = projects.find(v => v.ID == key)
                        if (proj && proj.Name == element) {
                            context = "debugging"
                            break
                        }
                    }
                    return {
                        id: element,
                        label: element,
                        iconPath: new vscode.ThemeIcon("folder"),
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        contextValue: context
                    }
                } else if (element instanceof Project) {
                    let context = element.Os == goPlat() ? "notdebugging" : ""
                    for (const [key] of sessions) {
                        if (key == element.ID && element.Os == goPlat()) {
                            context = "debugging"
                            break
                        }
                    }
                    return {
                        id: element.ID,
                        label: element.ID.replace(element.Name + ".", ""),
                        iconPath: new vscode.ThemeIcon("folder-opened"),
                        tooltip: JSON.stringify(element, null, "\t"),
                        contextValue: context
                    }
                }
            },
            onDidChangeTreeData: treeEvent.event
        },
        canSelectMany: true
    })
    context.subscriptions.push(tree)

    XLog.Notice("extension has been activated.")
}

/**
 * 插件停用函数。
 */
export function deactivate() {
    if (selector) selector.dispose()
    XLog.Notice("extension has been deactivated.")
}