#!/bin/bash
# OpenClaw Flutter 客户端构建脚本

set -e

# 设置 Flutter 路径
export PATH="$PATH:$HOME/flutter/bin"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}OpenClaw Flutter 客户端构建${NC}"
echo "================================"

# 检查 Flutter
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}Flutter 未找到，请安装 Flutter SDK${NC}"
    echo "下载地址: https://docs.flutter.dev/get-started/install"
    exit 1
fi

echo -e "${YELLOW}Flutter 版本:${NC}"
flutter --version

# 获取项目目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# 获取依赖
echo -e "${YELLOW}获取依赖...${NC}"
flutter pub get

# 生成代码 (freezed, json_serializable)
echo -e "${YELLOW}生成代码...${NC}"
flutter pub run build_runner build --delete-conflicting-outputs

# 选择目标平台
PLATFORM=${1:-"all"}

build_platform() {
    local platform=$1
    echo -e "${GREEN}构建 $platform...${NC}"
    
    case $platform in
        macos)
            flutter build macos --release
            ;;
        ios)
            flutter build ios --release --no-codesign
            ;;
        android)
            flutter build apk --release
            ;;
        windows)
            flutter build windows --release
            ;;
        linux)
            flutter build linux --release
            ;;
        web)
            flutter build web --release
            ;;
    esac
}

if [ "$PLATFORM" = "all" ]; then
    # 构建所有支持的平台
    if [[ "$OSTYPE" == "darwin"* ]]; then
        build_platform macos
        build_platform ios
        build_platform android
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        build_platform windows
        build_platform android
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        build_platform linux
        build_platform android
    fi
else
    build_platform "$PLATFORM"
fi

echo -e "${GREEN}构建完成!${NC}"
