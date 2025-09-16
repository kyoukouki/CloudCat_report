from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)  # 群昵称
    user_code = db.Column(db.String(20), unique=True, nullable=False)  # 特定编号
    role = db.Column(db.String(20), nullable=False)  # 角色：陪玩、客服、派单、管理、财务
    is_active = db.Column(db.Boolean, default=True, nullable=False)  # 是否启用
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'user_code': self.user_code,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    boss_name = db.Column(db.String(100), nullable=False)  # 老板
    companion_name = db.Column(db.String(100), nullable=False)  # 陪玩
    project = db.Column(db.String(200), nullable=False)  # 项目
    time_info = db.Column(db.String(200))  # 时间
    hours = db.Column(db.Float)  # 单时
    unit_price = db.Column(db.Float)  # 单价
    total_price = db.Column(db.Float, nullable=False)  # 总价
    remarks = db.Column(db.Text)  # 备注
    dispatch_info = db.Column(db.Text)  # 派单信息
    customer_service_info = db.Column(db.Text)  # 客服接待信息
    feedback = db.Column(db.Text)  # 反馈
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = db.relationship('User', backref=db.backref('orders', lazy=True))

    def __repr__(self):
        return f'<Order {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'boss_name': self.boss_name,
            'companion_name': self.companion_name,
            'project': self.project,
            'time_info': self.time_info,
            'hours': self.hours,
            'unit_price': self.unit_price,
            'total_price': self.total_price,
            'remarks': self.remarks,
            'dispatch_info': self.dispatch_info,
            'customer_service_info': self.customer_service_info,
            'feedback': self.feedback,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # 持卡人
    balance = db.Column(db.Float, default=0.0)  # 当前余额
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Customer {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'balance': self.balance,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    previous_balance = db.Column(db.Float, nullable=False)  # 原余额
    amount = db.Column(db.Float, nullable=False)  # 消费金额（正数为充值，负数为消费）
    current_balance = db.Column(db.Float, nullable=False)  # 现余额
    bonus = db.Column(db.Float, default=0.0)  # 充值赠送
    transaction_date = db.Column(db.Date, nullable=False)  # 消费日期
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship('Customer', backref=db.backref('transactions', lazy=True))
    creator = db.relationship('User', backref=db.backref('transactions', lazy=True))

    def __repr__(self):
        return f'<Transaction {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'previous_balance': self.previous_balance,
            'amount': self.amount,
            'current_balance': self.current_balance,
            'bonus': self.bonus,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

