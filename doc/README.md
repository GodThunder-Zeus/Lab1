# Lab1 Phase 1：SVG 编辑器（CLI）

**Git 仓库地址：https://github.com/GodThunder-Zeus/Lab1**

本项目使用 TypeScript 与面向对象方式实现 SVG 命令行编辑器，支持六种基本图形、树形分组、文件读写及撤销重做。代码与文档由 Codex 协作完成，开发过程保留在 Git 提交历史中。

- 作业文档：[doc/README.md](https://github.com/GodThunder-Zeus/Lab1/blob/main/doc/README.md)
- 源代码：[src](https://github.com/GodThunder-Zeus/Lab1/tree/main/src)
- 测试：[test](https://github.com/GodThunder-Zeus/Lab1/tree/main/test)
- 最终版本：[final 标签](https://github.com/GodThunder-Zeus/Lab1/tree/final)

## 1. 安装与使用

环境要求：Node.js 22 或以上版本，以及 npm。

```bash
git clone https://github.com/GodThunder-Zeus/Lab1.git
cd Lab1
npm install
npm run build
npm test
npm run cli
```

`build` 执行 TypeScript 严格类型检查，不生成 JavaScript；`cli` 使用 tsx 执行 TypeScript。也可以使用 pnpm；仓库提供 `pnpm-lock.yaml`，使用 `pnpm install --frozen-lockfile` 锁定依赖版本。`npm run check` 或 `pnpm run check` 连续执行类型检查与测试。

交互模式提示符为 `svg>`，输入 `help` 查看语法，使用 Ctrl+C 或输入结束符退出。脚本模式不打印提示符，以便保存输出。以 `#` 开头的整行是注释，颜色参数中的 `#` 不作为注释处理。空格参数使用双引号，可在引号内使用 `\"` 和 `\\`。

```text
init 800 600
create g scene
create rect r1 10 20 100 50 #4a90d9 in scene
create text t1 20 50 "Hello SVG" in scene
move scene 30 0
undo
redo
tree
save demo.svg
```

保存的 SVG 可直接用浏览器打开。完整流程图示例及输出位于 [examples](https://github.com/GodThunder-Zeus/Lab1/tree/main/examples)。PowerShell 回放方式：

```powershell
Get-Content -Encoding utf8 examples/flowchart.txt | npm run cli
```

macOS/Linux：`npm run cli < examples/flowchart.txt`。

## 2. 架构方案

### 2.1 模块划分

| 模块 | 职责 | 主要对象 |
|---|---|---|
| `src/domain/` | 图形行为、属性校验、树结构及画布不变量 | `Shape`、六种图形类、`Document`、`ShapeFactory` |
| `src/application/` | 命令协议、会话、历史记录、展示格式与存储端口 | `Command`、`Session`、`History`、`DocumentStore`、`TreeFormatter` |
| `src/application/commands/` | 每条命令的参数验证与用例编排 | `CreateCommand`、`MoveCommand` 等 19 个具体命令类 |
| `src/infrastructure/` | 文件系统操作、XML 解析与 SVG 序列化 | `FileDocumentStore`、`SvgCodec` |
| `src/cli/` | 分词、命令名注册与统一错误输出 | `Tokenizer`、`CommandRegistry`、`Repl` |
| `src/main.ts` | 组合根，连接输入输出与具体适配器 | 应用入口 |
| `test/` | 行为测试、文件集成测试及架构检查 | 内存存储替身、测试用例 |

下面是 PlantUML 组件图；独立源文件为 [architecture.puml](https://github.com/GodThunder-Zeus/Lab1/blob/main/doc/architecture.puml)，可用 PlantUML 渲染。GitHub 默认可能只显示源码。

```plantuml
@startuml
title Lab1 Phase 1 — 模块依赖
skinparam componentStyle rectangle
component "main.ts\n组合根" as main
package "cli" {
  component "Repl / Tokenizer / CommandRegistry" as cli
}
package "application" {
  component "Command / concrete commands\nSession / History / TreeFormatter" as app
  interface "DocumentStore" as store
}
package "domain" {
  component "Document / ShapeFactory\nShape / Group / Rect / Circle / Ellipse / Line / Text" as domain
}
package "infrastructure" {
  component "FileDocumentStore / SvgCodec" as infra
}
main --> cli
main --> app
main --> infra
cli --> app
app --> domain
app --> store
infra ..|> store
infra --> domain
@enduml
```

### 2.2 设计模式的选择与落地

**Command（命令模式，必选）**：每条命令是一类一文件的对象，继承 `Command`，实现 `execute(session)`。`CommandRegistry` 将文本名称转换成命令实例，`Repl` 不包含具体图形操作。`Session.run()` 根据命令类别统一处理事务、历史屏障与撤销单元。`CanvasCommand` 查询时是显示命令，修改时是文档命令。

**Composite（组合模式）**：六种图形共享 `Shape` 接口。叶子实现自身几何变换，`Group.move/scale` 递归调用子图形；命令无需按图形类型分支。`delete` 删除整棵子树。`set g fill/stroke/stroke-width` 设置组属性，通过 SVG 样式继承作用于后代，子元素显式设置的样式仍可覆盖它。`g` 没有 `x` 等几何属性，设置时按白名单拒绝。

**Memento（备忘录）**：`Document.clone()` 通过多态深拷贝图形树。一次成功编辑保存一个修改前快照；undo/redo 在两栈之间移动快照。失败恢复文档和文件路径，既不留下部分变更，也不清空原来的 redo。采用快照而非逐命令逆运算，避免分组、删除、顺序恢复时遗漏信息。代价是每次编辑及每份历史占用 O(n) 时间/空间，适合本阶段的小型图形文档；大规模编辑器可替换为增量记录。

**工厂与依赖倒置**：`ShapeFactory` 封装六种图形的构造与参数表；`DocumentStore` 是应用层接口，文件系统适配器实现该接口。测试注入内存存储，不需要改动命令代码。

**两处按名字分派及待重构项**：命令分派仅在 `CommandRegistry`，图形分派仅在 `ShapeFactory`。本阶段用注册表集中管理；下一阶段应将注册所有权移动到命令/图形 provider，消除新增类型时修改内核注册表的需求。当前未宣称实现完整插件系统。XML 根节点校验和容器能力判断不承担按六种类型分派行为的职责。

### 2.3 依赖方向规则

1. `domain` 仅依赖同层领域类，不导入 CLI、应用、文件系统或 XML 库。
2. `application` 可以依赖 `domain` 和本层端口，不依赖 `infrastructure`、CLI 或 Node 文件 API。
3. `cli` 依赖 `application`，只负责解析用户输入及反馈，不直接更改图形字段。
4. `infrastructure` 依赖 `DocumentStore` 端口及 `domain`，将外部 XML 转换为领域对象。
5. 只有组合根 `main.ts` 同时组装 CLI、应用会话与具体文件适配器；测试可以跨层验证。

这样图形规则可以独立测试，替换 CLI 或存储实现不应改写领域层。发现反向依赖时应作为架构修订项处理，不能仅修改文档掩盖它。

### 2.4 变化点假设

| 可能变化 | 当前预留与取舍 |
|---|---|
| 新图形/`box` 插件 | 用 `Shape` 多态及集中工厂隔离构造；动态 provider 注册、复合部件 ID 与 `data-kind` 恢复留待后续阶段 |
| 新命令 | 增加具体 Command 并注册，不修改 `Session` 的事务逻辑 |
| GUI / agent 输入 | 应用层不依赖终端，可复用命令与会话；本阶段不实现第二种交互界面 |
| 文件格式与存储位置 | `DocumentStore` 隔离 IO；`SvgCodec` 不操作文件系统 |
| 大文档与长期历史 | 快照简单可靠；当前不引入增量补丁、磁盘历史或容量管理 |
| 更全面的 SVG | 严格拒绝不支持的属性/节点，避免静默丢失语义；完整 transform、CSS、path 等需专门扩展 |

## 3. 功能与语义决策

| 功能 | 实现 |
|---|---|
| 文档命令 | `init`、`read`、`save`、`canvas` |
| 编辑命令 | `create`、`delete`、`move`、`scale`、`set`、`group`、`ungroup`、`addto`、`front`、`back` |
| 显示与历史 | `tree`、`show`、`help`、`undo`、`redo` |
| 图形类型 | `rect`、`circle`、`ellipse`、`line`、`text`、`g`；全部支持 `in <gid>` |
| ID | 大小写敏感、全局唯一；导入先预留全部显式 ID，再给无 ID 元素分配“标签+序号”并输出警告 |
| 失败语义 | 输出单行 `error:`，文档、默认保存路径、undo/redo 状态不因失败而改变 |

具体决策：

- `group` 保持原文档遍历顺序，不按参数顺序重排。同父级图形放回首个被选元素的位置；跨父级图形统一收编到根层末尾。拒绝重复选择、同时选择祖先和后代。
- `ungroup` 将子图形插回原位置，按附件要求拒绝直接位于 SVG 根下的容器。
- `front` 移到同级数组末尾，SVG 后绘制的元素显示在前；`back` 移到开头。
- `scale` 递归缩放位置与尺寸，比例必须有限且大于零；不缩放 `stroke-width`，因为它是样式属性。
- 成功执行 `init/read/save/canvas 修改` 清空历史并设置屏障，undo/redo 均报 `undo not allowed after io command`；下一次成功编辑解除屏障。查询和显示命令保留历史。
- `save <path>` 更新后续无参数保存路径；`init` 清除旧路径。文件适配器先写同目录临时文件再替换目标，降低写入失败破坏原文件的风险。
- 输出摘要采用统一的 `moved by` 与 `undone/redone`，语义与附件示例一致，但不逐字复刻其全部成功回显。`tree` 使用 SVG 属性全名，例如 `width`，不缩写成 `w`。

### SVG 支持边界

支持六种节点及白名单属性、文本内容、嵌套组、XML 转义、注释和缺失 ID 补全。画布尺寸支持数值或 `px`，缺省 800×600；`viewBox` 可省略，存在时要求 `0 0 width height`。自己保存的文件可以读回。

这不是任意 SVG 的无损编辑器：暂不支持 `path`、`use`、CSS、`font-size`、`text-anchor`、`transform`、不同坐标范围的 viewBox 和 DTD。读取时明确报错并保持旧文档，避免悄悄丢弃属性。附件背景部分含 transform/font-size 的一般 SVG 示例不属于当前导入支持范围；命令示例及 `other.svg` 属于支持范围。`create box` 按本阶段要求报未知类型；普通 `g` 的 `data-kind` 标记可降级读取，但不恢复插件语义或保留标记。

## 4. 过程记录

以下记录来自本次实际实现与验证，没有补写不存在的人工评审或历史讨论。

| 迭代 | 发现与处理 | 验证依据 |
|---|---|---|
| 需求拆解与骨架 | 提交物虽为 README，但附件另要求完整代码、分步提交、最终标签，因此先建立分层方案与 TypeScript 工程 | 首次提交保存初始架构文档 |
| 领域模型 | 容器与叶子需要统一移动/缩放，不能在每个命令内按 tag 分支 | 引入 `Shape` 层次和 `Group` 递归实现 |
| 命令与历史 | 删除/分组涉及父级、顺序、子孙，手写逆操作容易遗漏；后代数值溢出也可能留下半成品 | 快照事务测试验证后代溢出后整棵树回滚 |
| ID 导入 | 边读边补 ID 可能与后面出现的显式 `rect1` 冲突 | 两遍遍历；测试未命名矩形与后置 `rect1` 共存 |
| 验证环境修正 | 首轮 42 项测试中，41 项通过，真实文件写入测试因沙箱临时目录限制失败 | 改在项目目录建立并清理测试临时目录，重跑 42 项全部通过 |
| 代码复查 | `show` 初稿用 text 标签判断展示内容；pnpm 生成的构建许可项还是占位文本 | 展示改由图形 `details()` 多态实现；明确 esbuild 构建配置并统一源码排版 |
| 真实示例回放 | 执行附件两节点流程图，核对层级、移动后撤销、文字修改与保存 | 生成 `examples/flowchart.svg`，保存 8 个元素 |
| 提交与交付 | 分阶段提交并推送 GitHub，没有伪造提交时间 | 历史包含架构、模型、命令/IO、测试、完善与文档等阶段 |

未提供作业截止时间，Git 标签时间以仓库真实记录为准，不对“截止前提交”作额外假定。

## 5. 一致性自查

**模块划分是否一致？** 一致。实际目录对应初始方案。`application/commands/` 为应用模块内部细分；`Arguments`、`TreeFormatter` 是职责拆分后的辅助类，不改变层次。每个生产类单独放在同名文件中，属性通过方法访问与修改。

**依赖方向是否违反？** 本次检查未发现已定义规则的反向依赖。抽样如下：

- `domain/Group.ts` 只导入 `Shape`，不引用命令或文件系统。
- `application/Session.ts` 导入领域文档、历史及 `DocumentStore` 接口，不导入具体文件适配器。
- `cli/Repl.ts` 使用应用会话与命令注册器，不操作图形字段。
- `infrastructure/FileDocumentStore.ts` 实现应用端口，文件操作不泄漏到命令层。
- `main.ts` 作为明确允许的组合根组装具体实现。

`test/architecture.test.ts` 自动检查领域层、应用层的禁止导入、一类一文件以及没有 `switch`。检查是静态规则，不等于完整的形式化架构证明。

待重构项仍是 `CommandRegistry` 与 `ShapeFactory` 的内核注册表，以及大文档下快照成本；这些是有记录的阶段取舍。

## 6. 质量保证手段

测试采用 Node 内置测试框架及严格断言，使用内存存储替身隔离业务，并另测真实文件系统适配器。

| 检查 | 覆盖内容 |
|---|---|
| 类型检查 | `strict` TypeScript 配置，全部源码及测试均参与 |
| 功能 | 六种图形、引号与中文、创建归属、容器递归操作、属性白名单 |
| 树结构 | 同父级/跨父级分组、顺序保持、嵌套解组、循环拒绝、删除恢复、z-order |
| 历史 | 一次命令一次撤销、redo 分支清理、显示不入栈、文档命令屏障 |
| 原子性 | 重复 ID、无效目标、非法比例、未知属性、IO 失败、数值溢出均回滚且保留 redo |
| 文件 | SVG 往返、转义与文本保留、预留 ID、不支持内容拒绝、文件写入与替换 |
| 架构 | 依赖方向、一类一文件、无 switch 分派 |

实际验证环境为 Windows、Node.js 24.19.0、TypeScript 5.9.3；最终类型检查通过，**42 项自动化测试全部通过**。结果保存于 [doc/test-report.txt](https://github.com/GodThunder-Zeus/Lab1/blob/main/doc/test-report.txt)。此外实际回放了 `examples/flowchart.txt`，生成可在浏览器中打开的 SVG。

这些结果支持本阶段定义范围内的功能与结构质量，不声称覆盖所有外部 SVG、超大图形性能或跨平台文件系统行为。源码、测试、示例和提交记录共同提供可复现的验证依据。
