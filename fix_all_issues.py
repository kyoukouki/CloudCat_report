#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User, Customer, Transaction
from datetime import datetime, date

def fix_all_issues():
    """修复所有问题：用户名格式、客户管理功能等"""
    
    with app.app_context():
        # 1. 重新创建数据库表
        db.drop_all()
        db.create_all()
        
        print("重新创建数据库表...")
        
        # 2. 创建管理员和其他角色用户
        admin_users = [
            {'username': '优米', 'user_code': 'MG001', 'role': '管理'},
            {'username': '姜姜', 'user_code': 'FN001', 'role': '财务'},
            {'username': '许愿', 'user_code': 'CS001', 'role': '客服'},
            {'username': '小冉', 'user_code': 'DS001', 'role': '派单'},
        ]
        
        for user_data in admin_users:
            user = User(
                username=user_data['username'],
                user_code=user_data['user_code'],
                role=user_data['role'],
                is_active=True
            )
            db.session.add(user)
            print(f"创建{user_data['role']}用户: {user_data['username']} / {user_data['user_code']}")
        
        # 3. 创建陪玩用户（去掉YM·前缀）
        players = [
            "阿禹", "小y", "瑞瑞", "小意", "雾雾", "小煜", "A酱", "栀尾",
            "粥粥", "麦麦", "小钻", "4399", "冰", "小悔", "可乐", "小熊",
            "七夜", "普普", "立青", "77", "馨馨", "好困", "小悦", "嘻嘻",
            "小熙", "小焱", "小甜", "十一", "好多鱼", "陈旭", "桉桉", "妮妮",
            "枫", "海胆", "周游", "小花1", "亦可", "竹宝", "小婕", "小花2",
            "佳多宝", "小千", "小钰", "小星", "oTe", "困困", "派派", "summer",
            "米饭", "打烊", "小t", "小逸", "4saken", "文文", "晚安", "小唯",
            "小霍", "小果", "kiko", "姚姚", "拉勾", "特效药", "泡泡", "栗栗",
            "嘉嘉", "小晨", "小兮", "小轩", "薏米", "w1nter", "杳杳", "若宇",
            "乔乔", "小冉2", "小咪", "小小", "小七", "Alan", "小汐", "fake",
            "小渡", "西芹炒肉", "星野", "雪梨", "花与墨", "小李", "西瓜", "小沫",
            "小欧", "小羊", "安慰", "小豆", "困告", "小葉", "Simon", "小柴",
            "白给", "浪漫", "山鬼", "uu", "冰块", "小白", "阿乐", "墨芊",
            "冷鱼", "oh", "叁柒", "小歪", "小葵", "秋秋", "泽泽", "小C",
            "小训", "空空", "溯溯", "Eason", "HaoKun", "Ace", "小祈", "林北",
            "701", "277", "瑜", "小夏", "18", "yy"
        ]
        
        for i, player_name in enumerate(players, 1):
            user_code = f"YM{i:03d}"
            user = User(
                username=player_name,
                user_code=user_code,
                role='陪玩',
                is_active=True
            )
            db.session.add(user)
            if i <= 10:  # 只显示前10个
                print(f"创建陪玩用户: {player_name} / {user_code}")
        
        print(f"... 共创建 {len(players)} 个陪玩用户")
        
        # 4. 创建测试客户
        customers = [
            {'name': '江江', 'balance': 584.0},
            {'name': '小明', 'balance': 1200.0},
            {'name': '小红', 'balance': -500.0},
        ]
        
        for customer_data in customers:
            customer = Customer(
                name=customer_data['name'],
                balance=customer_data['balance'],
                updated_at=datetime.utcnow()
            )
            db.session.add(customer)
            print(f"创建客户: {customer_data['name']} (余额: ¥{customer_data['balance']})")
        
        # 5. 提交所有更改
        try:
            db.session.commit()
            print("\n✅ 所有数据创建成功！")
            
            # 显示统计信息
            total_users = User.query.count()
            players_count = User.query.filter_by(role='陪玩').count()
            customers_count = Customer.query.count()
            
            print(f"系统总用户数: {total_users}")
            print(f"陪玩用户数: {players_count}")
            print(f"客户数: {customers_count}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ 数据库操作失败: {e}")

if __name__ == '__main__':
    fix_all_issues()

