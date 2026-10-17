# Lab1 Phase 1：SVG 编辑器（CLI）

仓库：https://github.com/GodThunder-Zeus/Lab1

## 初始架构方案

使用 TypeScript 面向对象实现，一类一文件。

- `src/domain`：图形对象、容器、画布与树结构不变量。
- `src/application`：编辑会话、Command、历史记录与存储端口。
- `src/infrastructure`：SVG XML 读写及文件系统适配。
- `src/cli`：词法解析、命令注册与 REPL。
- `src/main.ts`：组合根，组装依赖。

依赖规则：CLI → application → domain；infrastructure → application 端口与 domain；domain 不依赖外层。Command 和 Composite 为必要模式，快照历史采用 Memento；文件 IO 经端口隔离。

计划分步提交：架构骨架 → 领域模型 → 命令与 IO → 验证与文档。最终文档将依据实际测试更新，不预先声称功能通过。
