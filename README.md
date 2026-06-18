# MaiMai Multiplayer Song Filter | MaiMai 拼机音游推荐歌曲计算器

一个专门为拼机时双方实力差距过大的舞萌DX玩家设计的拼机选曲推荐工具。通过输入两位玩家的水平参数（定数范围、期望定数），自动筛选并排序出最适合拼机游玩的曲目。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 验证 PWA

Service Worker 只在生产构建中启用。本地验证安装与离线能力：

```bash
pnpm build
pnpm preview
```

更新 `assets/pwa-icon-source.png` 后，可重新生成各平台图标：

```bash
pnpm generate:pwa-assets
```

## 鸣谢

歌曲列表数据源：https://maimai.lxns.net/
