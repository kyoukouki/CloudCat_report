# 云喵电竞俱乐部财务管理系统

一个专为电竞俱乐部设计的财务管理系统，支持多角色权限管理、报单管理、客户管理等功能。

## 功能特色

### 🎮 多角色权限管理
- **陪玩**：创建和管理个人报单
- **客服**：客户管理、报单反馈
- **派单**：派单管理、客户服务
- **管理**：全局管理权限
- **财务**：完整财务管理功能

### 📊 核心功能
- ✅ 报单管理（创建、查看、修改）
- ✅ 客户管理（充值、消费、余额管理）
- ✅ 用户管理（添加、编辑、权限控制）
- ✅ 数据统计（流水排行、收入统计）
- ✅ 数据导出（Excel格式）

### 🎨 界面特色
- 粉色主题设计，符合云喵品牌风格
- 响应式设计，支持手机和电脑访问
- 直观的用户界面，操作简单易懂

## 技术架构

### 后端
- **框架**：Flask (Python)
- **数据库**：SQLite
- **API**：RESTful API设计

### 前端
- **框架**：React
- **样式**：CSS3 + 响应式设计
- **构建**：Vite

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/kyoukouki/CloudCat_report.git
cd CloudCat_report
```

2. **后端设置**
```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 初始化数据库
python fix_all_issues.py
```

3. **前端设置**
```bash
# 进入前端目录
cd ../yunmao-frontend

# 安装依赖
npm install

# 构建前端
npm run build

# 复制到后端静态目录
cp -r dist/* ../CloudCat_report/src/static/
```

4. **启动系统**
```bash
cd ../CloudCat_report
python src/main.py
```

5. **访问系统**
打开浏览器访问：http://localhost:5000

## 默认账号

### 管理员账号
- **管理员**：优米 / MG001
- **财务**：姜姜 / FN001
- **客服**：许愿 / CS001
- **派单**：小冉 / DS001

### 陪玩账号
系统预置了126个陪玩账号：
- 阿禹 / YM001
- 小y / YM002
- 瑞瑞 / YM003
- ... (更多账号请查看系统用户管理)

## 使用说明

### 陪玩操作
1. 使用群昵称和编号登录
2. 点击"新建报单"创建订单
3. 填写老板、项目、总价等信息
4. 提交后等待审核

### 财务操作
1. 登录财务账号
2. 在"客户管理"中管理客户充值消费
3. 在"报单管理"中审核陪玩报单
4. 在"数据统计"中查看收入排行
5. 使用"导出"功能生成Excel报表

### 管理操作
- 在"用户管理"中添加/编辑用户
- 管理所有报单和客户信息
- 查看系统统计数据

## 部署说明

### 本地部署
适合小团队内部使用，按照上述安装步骤即可。

### 云服务器部署
1. 购买云服务器（推荐配置：1核2G）
2. 安装Python和Node.js环境
3. 克隆项目并按照安装步骤配置
4. 使用nginx反向代理（可选）
5. 配置域名和SSL证书（可选）

## 开发说明

### 项目结构
```
CloudCat_report/
├── src/                    # 后端源码
│   ├── main.py            # 主应用文件
│   ├── models/            # 数据模型
│   ├── routes/            # API路由
│   └── static/            # 前端静态文件
├── requirements.txt       # Python依赖
└── README.md             # 项目说明
```

### 开发环境
1. 后端开发：修改src/目录下的Python文件
2. 前端开发：需要单独的React项目
3. 数据库：SQLite文件位于src/database/app.db

## 贡献指南

欢迎提交Issue和Pull Request来改进系统！

## 许可证

MIT License

## 联系方式

如有问题请提交Issue或联系项目维护者。

---

**云喵电竞俱乐部财务管理系统** - 让财务管理更简单高效！

