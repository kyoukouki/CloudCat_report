#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db, User, Customer
from src.main import app

def init_test_data():
    with app.app_context():
        # 创建测试用户
        test_users = [
            {'username': '小悔', 'user_code': 'YM001', 'role': '陪玩'},
            {'username': '小鑫', 'user_code': 'YM002', 'role': '陪玩'},
            {'username': '许愿', 'user_code': 'CS001', 'role': '客服'},
            {'username': '小冉', 'user_code': 'DS001', 'role': '派单'},
            {'username': '优米', 'user_code': 'MG001', 'role': '管理'},
            {'username': '姜姜', 'user_code': 'FN001', 'role': '财务'},
        ]
        
        for user_data in test_users:
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if not existing_user:
                user = User(**user_data)
                db.session.add(user)
                print(f"创建用户: {user_data['username']} ({user_data['role']})")
        
        # 创建测试客户
        test_customers = [
            {'name': '江江', 'balance': 584.0},
            {'name': '小明', 'balance': 1200.0},
            {'name': '小红', 'balance': -500.0},
        ]
        
        for customer_data in test_customers:
            existing_customer = Customer.query.filter_by(name=customer_data['name']).first()
            if not existing_customer:
                customer = Customer(**customer_data)
                db.session.add(customer)
                print(f"创建客户: {customer_data['name']} (余额: ¥{customer_data['balance']})")
        
        db.session.commit()
        print("测试数据初始化完成！")
        
        print("\n测试账号信息:")
        print("陪玩账号: 小悔 / YM001")
        print("陪玩账号: 小鑫 / YM002")
        print("客服账号: 许愿 / CS001")
        print("派单账号: 小冉 / DS001")
        print("管理账号: 优米 / MG001")
        print("财务账号: 姜姜 / FN001")

if __name__ == '__main__':
    init_test_data()

