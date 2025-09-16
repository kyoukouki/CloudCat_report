#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User, Customer, Transaction
import json

def test_api():
    """测试API接口"""
    
    with app.app_context():
        # 检查数据库
        users = User.query.all()
        customers = Customer.query.all()
        
        print(f"用户数: {len(users)}")
        print(f"客户数: {len(customers)}")
        
        # 查找财务用户
        finance_user = User.query.filter_by(role='财务').first()
        if finance_user:
            print(f"财务用户: {finance_user.username} / {finance_user.user_code}")
        
        # 查看客户信息
        for customer in customers:
            print(f"客户: {customer.name}, 余额: {customer.balance}")

def test_local_api():
    """测试本地API"""
    
    # 启动应用
    with app.test_client() as client:
        # 模拟登录
        with client.session_transaction() as sess:
            sess['user_id'] = 2  # 财务用户ID
            sess['user_role'] = '财务'
            sess['username'] = '姜姜'
        
        # 测试获取客户列表
        response = client.get('/api/customers')
        print(f"获取客户列表状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.get_json()
            print(f"客户数量: {len(data.get('customers', []))}")
        else:
            print(f"错误: {response.get_data(as_text=True)}")
        
        # 测试创建交易
        customer_id = 1  # 江江的ID
        transaction_data = {
            'amount': -100,
            'bonus': 0,
            'transaction_date': '2025-09-16'
        }
        
        response = client.post(f'/api/customers/{customer_id}/transactions', 
                             json=transaction_data,
                             content_type='application/json')
        print(f"创建交易状态码: {response.status_code}")
        if response.status_code == 201:
            data = response.get_json()
            print(f"交易创建成功: {data.get('message')}")
        else:
            print(f"交易错误: {response.get_data(as_text=True)}")

if __name__ == '__main__':
    print("=== 数据库检查 ===")
    test_api()
    print("\n=== API测试 ===")
    test_local_api()

