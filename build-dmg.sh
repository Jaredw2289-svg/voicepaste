#!/bin/bash

# VoicePaste DMG 打包脚本
# 生成签名和公证的 macOS 安装包

set -e

echo "🚀 开始打包 VoicePaste..."
echo ""

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf out/

# 运行打包
echo "📦 开始构建和签名..."
npm run make

echo ""
echo "✅ 打包完成！"
echo ""
echo "📁 生成的文件："
ls -lh out/make/**/*.dmg 2>/dev/null || ls -lh out/make/*.dmg 2>/dev/null || echo "未找到 DMG 文件"
echo ""
echo "🎉 你可以在 out/make/ 目录中找到签名的 DMG 安装包"
