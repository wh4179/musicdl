# MusicDL Web 版本使用说明

## 项目简介

MusicDL Web 是基于 MusicDL 核心功能开发的 Web 界面版本，支持通过浏览器搜索、下载音乐和解析播放列表。

## 系统架构

- **后端**：使用 FastAPI 框架提供 RESTful API 接口
- **前端**：使用 React + TypeScript + Ant Design 实现 Web 界面
- **部署**：使用 Docker 容器化部署，支持前后端分离

## 目录结构

```text
musicdl/
├── api/             # 后端 API 服务
│   ├── main.py      # API 主文件
│   ├── __init__.py  # 初始化文件
│   ├── requirements.txt  # 依赖文件
│   └── Dockerfile   # 后端 Dockerfile
├── frontend/        # 前端项目
│   ├── src/         # 前端源码
│   ├── public/      # 静态文件
│   ├── package.json # 项目配置
│   ├── Dockerfile   # 前端 Dockerfile
│   └── nginx.conf   # Nginx 配置
├── docker-compose.yml  # Docker Compose 配置
└── README_WEB.md    # Web 版本使用说明
```

## 快速开始

### 方法一：使用 Docker 部署（推荐）

1. **安装 Docker**
   - 访问 [Docker 官网](https://www.docker.com/get-started) 下载并安装 Docker
   - 启动 Docker 服务

2. **构建和运行容器**
   ```bash
   # 在项目根目录执行
   docker-compose up -d --build
   ```

3. **访问应用**
   - 前端：http://localhost
   - 后端 API 文档：http://localhost:8000/docs

### 方法二：本地开发模式

#### 后端开发

1. **安装依赖**
   ```bash
   # 在项目根目录执行
   pip install -r requirements.txt
   pip install -r api/requirements.txt
   ```

2. **启动后端服务**
   ```bash
   # 在 api 目录执行
   python main.py
   ```

#### 前端开发

1. **安装依赖**
   ```bash
   # 在 frontend 目录执行
   npm install
   ```

2. **启动前端开发服务器**
   ```bash
   # 在 frontend 目录执行
   npm run dev
   ```

3. **访问应用**
   - 前端：http://localhost:3000
   - 后端 API 文档：http://localhost:8000/docs

## 功能说明

### 1. 搜索音乐

- 在搜索框中输入歌曲名、歌手名或专辑名
- 选择要使用的音乐源
- 点击搜索按钮，等待搜索结果
- 在搜索结果中选择要下载的歌曲
- 点击下载按钮，开始下载选中的歌曲

### 2. 解析播放列表

- 在播放列表 URL 输入框中输入播放列表链接
- 选择要使用的音乐源
- 点击解析播放列表按钮，等待解析结果
- 在解析结果中选择要下载的歌曲
- 点击下载按钮，开始下载选中的歌曲

### 3. 支持的音乐源

- MiguMusicClient
- NeteaseMusicClient
- QQMusicClient
- KuwoMusicClient
- QianqianMusicClient
- 以及其他 MusicDL 支持的音乐源

## API 接口

### 1. 获取支持的音乐源

- **URL**: `/api/music-sources`
- **Method**: GET
- **Response**:
  ```json
  {
    "music_sources": ["MiguMusicClient", "NeteaseMusicClient", ...]
  }
  ```

### 2. 搜索音乐

- **URL**: `/api/search`
- **Method**: POST
- **Request**:
  ```json
  {
    "keyword": "那些年",
    "music_sources": ["NeteaseMusicClient", "QQMusicClient"]
  }
  ```
- **Response**:
  ```json
  {
    "results": [
      {
        "source": "NeteaseMusicClient",
        "index": 0,
        "song_info": {
          "song_name": "那些年",
          "singers": "胡夏",
          "album": "那些年，我们一起追的女孩 电影原声带",
          "duration": "04:12",
          "file_size": "10.2 MB",
          "ext": "mp3",
          "download_url": "http://example.com/song.mp3",
          ...
        }
      },
      ...
    ]
  }
  ```

### 3. 下载音乐

- **URL**: `/api/download`
- **Method**: POST
- **Request**:
  ```json
  {
    "song_infos": [
      {
        "song_name": "那些年",
        "singers": "胡夏",
        "download_url": "http://example.com/song.mp3",
        ...
      },
      ...
    ]
  }
  ```
- **Response**:
  ```json
  {
    "ok": true
  }
  ```

### 4. 解析播放列表

- **URL**: `/api/parse-playlist`
- **Method**: POST
- **Request**:
  ```json
  {
    "playlist_url": "https://music.163.com/#/playlist?id=7583298906",
    "music_sources": ["NeteaseMusicClient"]
  }
  ```
- **Response**:
  ```json
  {
    "results": [
      {
        "song_name": "那些年",
        "singers": "胡夏",
        "album": "那些年，我们一起追的女孩 电影原声带",
        "duration": "04:12",
        "file_size": "10.2 MB",
        "ext": "mp3",
        "download_url": "http://example.com/song.mp3",
        ...
      },
      ...
    ]
  }
  ```

## 常见问题

### 1. 搜索结果为空

- 检查网络连接是否正常
- 检查音乐源是否可用
- 尝试使用其他音乐源

### 2. 下载失败

- 检查网络连接是否正常
- 检查音乐源是否可用
- 尝试使用其他音乐源
- 检查下载路径是否有写入权限

### 3. 解析播放列表失败

- 检查播放列表 URL 是否正确
- 检查网络连接是否正常
- 尝试使用其他音乐源

### 4. Docker 部署失败

- 检查 Docker 是否安装并运行
- 检查 Docker Compose 版本是否兼容
- 检查网络连接是否正常
- 查看 Docker 日志获取详细错误信息

## 技术栈

### 后端

- Python 3.9+
- FastAPI
- Uvicorn
- Requests

### 前端

- React 18
- TypeScript
- Ant Design
- Axios
- Vite

### 部署

- Docker
- Docker Compose
- Nginx

## 注意事项

1. 本项目仅供学习和研究使用，不得用于商业用途
2. 请遵守相关法律法规，尊重音乐版权
3. 部分音乐源可能需要登录凭证才能下载高质量音乐
4. 下载速度取决于网络环境和音乐源服务器状态

## 许可证

本项目使用 PolyForm-Noncommercial-1.0.0 许可证。
