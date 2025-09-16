#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User

def update_usernames():
    """更新用户名格式，去掉YM·前缀"""
    
    with app.app_context():
        # 获取所有陪玩用户
        players = User.query.filter_by(role='陪玩').all()
        
        success_count = 0
        for player in players:
            try:
                # 去掉YM·前缀
                old_name = player.username
                if old_name.startswith('YM·'):
                    new_name = old_name[3:]  # 去掉前3个字符"YM·"
                elif old_name.startswith('YM•'):
                    new_name = old_name[3:]  # 去掉前3个字符"YM•"
                elif old_name.startswith('YM '):
                    new_name = old_name[3:]  # 去掉前3个字符"YM "
                else:
                    new_name = old_name
                
                # 更新用户名
                player.username = new_name
                success_count += 1
                print(f"更新用户名: {old_name} -> {new_name} / {player.user_code}")
                
            except Exception as e:
                print(f"更新用户 {player.username} 失败: {e}")
        
        try:
            db.session.commit()
            print(f"\n成功更新 {success_count} 个用户名！")
            
            # 显示前10个更新后的用户
            print("\n前10个更新后的用户:")
            first_players = User.query.filter_by(role='陪玩').limit(10).all()
            for player in first_players:
                print(f"  {player.username} / {player.user_code}")
                
        except Exception as e:
            db.session.rollback()
            print(f"提交数据库失败: {e}")

if __name__ == '__main__':
    update_usernames()

