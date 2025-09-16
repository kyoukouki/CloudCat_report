#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User

def import_players():
    """导入陪玩名单"""
    
    # 陪玩名单（去重处理）
    players_raw = [
        "YM·阿禹", "YM·小y", "YM·瑞瑞", "YM·小意", "YM·雾雾", "YM·小煜", "YM·A酱", "YM·栀尾",
        "YM·粥 粥", "YM·麦麦", "YM·小钻", "YM·4399", "YM·冰", "YM·小悔", "YM·可乐", "YM·小熊",
        "YM·七夜", "YM·普普", "YM·立青", "YM·77", "YM·馨馨", "YM·好困", "YM·小悦", "YM·嘻嘻",
        "YM·小熙", "YM·小焱", "YM·小甜", "YM·十一", "YM·好多鱼", "YM·陈旭", "YM·桉桉", "YM·妮妮",
        "YM·枫", "YM·海胆", "YM·周游", "YM·小花1", "YM·亦可", "YM·竹宝", "YM·小婕", "YM·小花2",
        "YM·佳多宝", "YM·小千", "YM·小钰", "YM·小星", "YM·oTe", "YM·困困", "YM·派派", "YM·summer",
        "YM·米饭", "YM·打烊", "YM·小t", "YM·小逸", "YM·4saken.", "YM·文文", "YM·晚安", "YM·小唯",
        "YM·小霍", "YM·小果", "YM·kiko", "YM·姚姚", "YM·拉勾", "YM·特效药", "YM·泡泡🫧", "YM·栗栗",
        "YM·嘉嘉", "YM·小晨", "YM·小兮", "YM·小轩", "YM·薏米", "YM·w1nter", "YM·杳杳", "YM·若宇",
        "YM·乔乔", "YM·小冉", "YM·小咪", "YM·小小", "YM·小七", "YM·Alan", "YM·小汐", "YM·fake",
        "YM·小渡", "YM·西芹炒肉", "YM·星野", "YM·雪梨", "YM·花与墨", "YM·小李", "YM·西瓜", "YM·小沫",
        "YM·小欧", "YM·小羊", "YM·安慰", "YM·小豆", "YM·困告", "YM·小葉", "YM·Simon", "YM·小柴",
        "YM·白给", "YM·浪漫", "YM·山鬼", "YM·uu", "YM·冰块", "YM·小白", "YM·阿乐", "YM·墨芊",
        "YM·冷鱼", "YM·oh", "YM·叁柒", "YM·小歪", "YM·小葵", "YM·秋秋", "YM·泽泽", "YM·小C",
        "YM·小训", "YM·空空", "YM·溯溯", "YM·Eason", "YM·HaoKun", "YM·Ace", "YM·小祈", "YM·林北",
        "YM·701", "YM·277", "YM·瑜", "YM·小夏", "YM·18", "YM·yy"
    ]
    
    # 去重
    players = list(dict.fromkeys(players_raw))
    
    with app.app_context():
        # 删除现有的陪玩用户（保留其他角色）
        existing_players = User.query.filter_by(role='陪玩').all()
        for player in existing_players:
            db.session.delete(player)
        db.session.commit()
        
        # 导入新的陪玩名单
        success_count = 0
        for i, player_name in enumerate(players, 1):
            try:
                # 生成用户编号
                user_code = f"YM{i:03d}"  # YM001, YM002, ...
                
                # 检查编号是否已存在
                existing_user = User.query.filter_by(user_code=user_code).first()
                if existing_user:
                    print(f"编号 {user_code} 已存在，跳过用户 {player_name}")
                    continue
                
                # 创建用户
                user = User(
                    username=player_name,
                    user_code=user_code,
                    role='陪玩',
                    is_active=True
                )
                
                db.session.add(user)
                db.session.commit()  # 立即提交每个用户
                success_count += 1
                print(f"创建陪玩: {player_name} / {user_code}")
                
            except Exception as e:
                db.session.rollback()
                print(f"创建用户 {player_name} 失败: {e}")
        
        print(f"\n成功导入 {success_count} 个陪玩用户！")
        
        # 显示统计信息
        total_users = User.query.count()
        players_count = User.query.filter_by(role='陪玩').count()
        print(f"系统总用户数: {total_users}")
        print(f"陪玩用户数: {players_count}")
        
        # 显示前10个陪玩用户
        print("\n前10个陪玩用户:")
        first_players = User.query.filter_by(role='陪玩').limit(10).all()
        for player in first_players:
            print(f"  {player.username} / {player.user_code}")

if __name__ == '__main__':
    import_players()

