# Gemini CLI 快速入门指南

本文档基于 Google Codelabs 的 [《亲自体验 Gemini CLI》](https://codelabs.developers.google.com/gemini-cli-hands-on?hl=zh-cn#0) 教程编写，旨在提供一个关于 `gemini-cli` 的快速入门参考。

## 1. 什么是 Gemini CLI？

Gemini CLI 是一个集成在 Google Cloud CLI (`gcloud`) 中的 AI 助手。它将 Gemini 的强大功能带到您的终端，可以帮助您查找、理解和转换 `gcloud` 命令，从而极大地提升您的工作效率。

## 2. 准备工作

在开始之前，请确保您已经安装并配置好了 [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)。

## 3. 安装与配置

### 安装组件

Gemini CLI 作为 `gcloud` 的一个组件提供。通过以下命令进行安装：

```bash
gcloud components install gemini-cli
```

### 基础配置

安装后，您需要配置 `gemini-cli` 以关联您的 Google Cloud 项目。

```bash
gcloud gemini-cli config set project YOUR_PROJECT_ID
```

请将 `YOUR_PROJECT_ID` 替换为您自己的项目 ID。

## 4. 核心功能与命令

Gemini CLI 主要通过三个核心动词来工作：`suggest`、`describe` 和 `translate`。

### `suggest` (建议命令)

当您不确定某个操作需要使用什么 `gcloud` 命令时，`suggest` 可以给您提供建议。它会返回一个可执行的命令，而不是仅仅是文本。

**示例：**

> 需求：列出我项目中的所有 GKE (Google Kubernetes Engine) 集群。

```bash
gcloud gemini-cli suggest "list all my GKE clusters"
```

### `describe` (解释命令)

当您看到一个不熟悉的 `gcloud` 命令时，`describe` 可以用自然语言为您解释该命令的作用、它的各个参数以及如何使用。

**示例：**

> 需求：解释 `gcloud compute instances create` 命令是做什么的。

```bash
gcloud gemini-cli describe "gcloud compute instances create my-instance --machine-type=e2-medium --image-family=debian-11 --image-project=debian-cloud"
```

`describe` 甚至可以解释包含在上下文文件中的脚本。

### `translate` (翻译命令)

`translate` 功能可以将一种壳语言（如 Bash）的命令转换为另一种（如 Zsh），并解释两者之间的差异。

**示例：**

> 需求：将一个 Bash 的 for 循环转换为 Zsh。

```bash
gcloud gemini-cli translate --source-shell=bash --target-shell=zsh "for i in {1..3}; do echo \$i; done"
```

## 5. 提供上下文 (`--context`)

为了让 Gemini CLI 给出更精确的回答，您可以通过 `--context` 标志提供文件或目录作为上下文。

**示例：**

> 需求：解释一个名为 `my-script.sh` 的脚本文件。

```bash
gcloud gemini-cli describe --context=my-script.sh "this script"
```

## 6. 总结

Gemini CLI 是一个强大的终端工具，它通过将自然语言与 `gcloud` 命令相结合，简化了 Google Cloud 的管理和操作。熟练使用 `suggest`、`describe` 和 `translate` 命令，将使您的云端工作流更加顺畅。
