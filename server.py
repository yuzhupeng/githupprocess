#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的 HTTP 服务器 - 用于本地开发
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # 添加 CORS 头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 HTTP 服务器已启动")
        print(f"📍 访问地址: http://localhost:{PORT}")
        print(f"📁 服务目录: {DIRECTORY}")
        print(f"⏹️  按 Ctrl+C 停止服务器\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n⏹️  服务器已停止")

if __name__ == '__main__':
    main()
