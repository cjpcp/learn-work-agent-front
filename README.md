# 学工智能体系统 - 前端

## 项目简介

这是学工智能体系统的前端项目，基于 Vue 3 + TypeScript + Vite + Ant Design Vue 构建。

## 技术栈

- **Vue 3**: 采用组合式 API
- **TypeScript 5.x**: 强类型支持
- **Vite 5.x**: 构建工具
- **Ant Design Vue 4.x**: UI 组件库
- **Pinia 2.x**: 状态管理
- **Vue Router 4.x**: 路由管理
- **Axios**: HTTP 客户端

## 功能模块

### 1. 认证模块
- 用户登录
- 用户注册

### 2. 智能咨询模块
- 问题提交（支持文本、图片、语音）
- 问题查询和历史记录
- 问题评价
- 转人工服务

### 3. 请假管理模块
- 请假申请（病假、事假、公假）
- 请假列表查询
- 请假审批（辅导员/管理员）
- 请假条生成和下载
- 销假功能

### 4. 奖助管理模块
- 奖助申请（奖学金、助学金、困难补助）
- 申请列表查询
- 申请审批（辅导员/管理员）

## 项目结构

```
learn-work-agent-front/
├── src/
│   ├── api/              # API 接口定义
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── layouts/         # 布局组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── views/           # 页面组件
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 环境配置

前端开发服务器已配置代理，将 `/api` 请求代理到后端服务器 `http://localhost:8080`。

如需修改后端地址，请编辑 `vite.config.ts` 中的 `server.proxy` 配置。

## API 接口

所有 API 接口定义在 `src/api/index.ts` 中，包括：

- `authApi`: 认证相关接口
- `consultationApi`: 咨询相关接口
- `leaveApi`: 请假相关接口
- `awardApi`: 奖助相关接口

## 状态管理

使用 Pinia 进行状态管理，主要 store：

- `user`: 用户信息和认证状态

## 路由配置

路由配置在 `src/router/index.ts` 中，包含路由守卫，未登录用户将被重定向到登录页。

## 注意事项

1. 确保后端服务已启动并运行在 `http://localhost:8080`
2. 上传功能需要后端提供文件上传接口
3. 图片和语音上传功能需要根据实际后端接口进行调整
