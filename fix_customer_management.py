#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User, Customer, Transaction
from datetime import datetime, date

def fix_customer_management():
    """修复客户管理功能"""
    with app.app_context():
        # 检查数据库表是否存在
        try:
            # 测试查询
            customers = Customer.query.all()
            print(f"找到 {len(customers)} 个客户")
            
            transactions = Transaction.query.all()
            print(f"找到 {len(transactions)} 条交易记录")
            
            # 测试创建交易记录
            if customers:
                customer = customers[0]
                print(f"测试客户: {customer.name}, 当前余额: {customer.balance}")
                
                # 创建测试交易
                test_transaction = Transaction(
                    customer_id=customer.id,
                    previous_balance=customer.balance,
                    amount=-50.0,  # 消费50元
                    current_balance=customer.balance - 50.0,
                    bonus=0.0,
                    transaction_date=date.today(),
                    created_by=1  # 假设用户ID为1
                )
                
                # 更新客户余额
                customer.balance = customer.balance - 50.0
                customer.updated_at = datetime.utcnow()
                
                db.session.add(test_transaction)
                db.session.commit()
                
                print(f"测试交易创建成功，新余额: {customer.balance}")
                
                # 回滚测试交易
                db.session.delete(test_transaction)
                customer.balance = customer.balance + 50.0
                db.session.commit()
                
                print("测试交易已回滚")
                
        except Exception as e:
            print(f"数据库操作错误: {e}")
            # 重新创建表
            db.create_all()
            print("数据库表已重新创建")

if __name__ == '__main__':
    fix_customer_management()

