# 光影生活 · Life Timeline

长期记录生活的网站，第一阶段为「狗狗成长时间轴」。

- 站点名称：光影生活
- 计划域名：`life.guangying.world`

## 技术栈

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Cloudflare Pages + Pages Functions
- Cloudflare D1（数据库）
- Cloudflare R2（媒体存储，预留）

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 创建本地 D1 并执行 migration

```bash
npm run db:migrate:local
```

### 3. 配置本地环境变量

项目根目录已有 `.dev.vars`（本地开发用，勿提交生产密码）：

```env
ADMIN_PASSWORD=dev-password
JWT_SECRET=dev-jwt-secret-change-in-production
```

### 4. 启动开发服务器

```bash
npm run dev
```

推荐访问 **`http://localhost:5173`**（Vite 热更新，API 自动代理到 Wrangler）。

也可访问 **`http://localhost:8788`**（需等待 `vite build --watch` 同步 dist 后再刷新）。

- 前台首页：`/`
- 狗狗主页：`/dog`
- 时间轴：`/dog/timeline`
- 管理后台：`/gy-admin`（默认密码见 `.dev.vars`）

## 创建 D1 数据库

在 Cloudflare 控制台或使用 Wrangler CLI：

```bash
# 创建生产数据库
npx wrangler d1 create life-db
```

命令会输出 `database_id`，将其填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "life-db"
database_id = "你的-database-id"
```

## 执行 Migration

### 本地

```bash
npm run db:migrate:local
```

### 生产（远程）

```bash
npm run db:migrate:remote
```

Migration 文件位于 `migrations/0001_init.sql`，包含三张表：

- `pet_profile` — 狗狗基本信息
- `timeline_nodes` — 时间轴节点
- `timeline_media` — 节点媒体（图片/视频）

## 环境变量配置

### 本地开发

使用根目录 `.dev.vars` 文件（Wrangler 自动读取）。

### Cloudflare Pages 生产环境

在 Cloudflare Dashboard → Pages → 你的项目 → Settings → Environment variables 中添加：

| 变量名 | 说明 |
|--------|------|
| `ADMIN_PASSWORD` | 管理后台登录密码 |
| `JWT_SECRET` | JWT 签名密钥（建议使用长随机字符串） |

同时在 Pages → Settings → Functions → D1 database bindings 中绑定：

- Variable name: `DB`
- D1 database: `life-db`

（可选）R2 绑定：

- Variable name: `MEDIA`
- R2 bucket: `life-media`

## 部署到 Cloudflare Pages

### 方式一：通过 Git 连接（推荐）

1. 将代码推送到 GitHub / GitLab
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
3. 构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 配置环境变量和 D1 绑定（见上文）
5. 执行远程 migration：`npm run db:migrate:remote`
6. 部署完成后访问 Pages 提供的 `*.pages.dev` 域名

### 方式二：Wrangler CLI 直接部署

```bash
npm run build
npx wrangler pages deploy dist --project-name=life-site
```

## 绑定自定义域名 `life.guangying.world`

1. 确保域名 `guangying.world` 已添加到 Cloudflare（DNS 由 Cloudflare 托管）
2. Pages 项目 → Custom domains → Set up a custom domain
3. 输入 `life.guangying.world`
4. Cloudflare 会自动创建 CNAME 记录指向 Pages 项目
5. 等待 SSL 证书签发（通常几分钟）

如果主域名不在 Cloudflare，需手动添加 CNAME：

```
life.guangying.world  →  your-project.pages.dev
```

## 项目结构

```
├── src/                  # React 前端
│   ├── routes/           # 页面路由
│   ├── components/       # UI 组件
│   └── lib/              # API、工具函数
├── functions/api/        # Cloudflare Pages Functions
├── migrations/           # D1 数据库迁移
├── public/               # 静态资源
└── wrangler.toml         # Cloudflare 配置
```

## API 概览

### 公开接口

- `GET /api/pet` — 狗狗信息
- `GET /api/timeline?order=desc&limit=20&cursor=` — 公开时间轴
- `GET /api/timeline/:id` — 节点详情

### 管理接口（需 Bearer Token）

- `POST /api/admin/login` — 登录
- `GET/PUT /api/admin/pet` — 狗狗信息管理
- `GET/POST /api/admin/timeline` — 时间轴列表 / 新增
- `PUT/DELETE /api/admin/timeline/:id` — 编辑 / 删除
- `POST /api/admin/media` — 保存媒体记录
- `POST /api/admin/media/upload-url` — R2 上传（预留）

## MVP 功能清单

- [x] 首页展示站点信息与最近节点
- [x] 狗狗主页（年龄、陪伴天数自动计算）
- [x] 成长时间轴（正序/倒序、分页）
- [x] 节点详情页（图片预览、视频播放）
- [x] 管理后台登录（JWT）
- [x] 编辑狗狗信息
- [x] 新增/编辑/删除时间节点
- [x] 支持图片 URL、视频 URL、标签、地点
- [x] 节点公开/私密设置
- [x] D1 migration
- [x] 手动填写媒体 URL（R2 上传接口已预留）

## 后续扩展

- R2 直传上传
- 家庭生活、旅行、纪念日模块
- 多宠物支持
