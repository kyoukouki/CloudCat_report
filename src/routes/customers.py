from flask import Blueprint, request, jsonify, session
from src.models.user import db, Customer, Transaction, User
from datetime import datetime, date

customers_bp = Blueprint('customers', __name__)

def check_permission(required_roles):
    """检查用户权限"""
    user_role = session.get('user_role')
    if not user_role or user_role not in required_roles:
        return False
    return True

@customers_bp.route('/customers', methods=['GET'])
def get_customers():
    if not check_permission(['客服', '派单', '管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    customers = Customer.query.all()
    return jsonify({
        'customers': [customer.to_dict() for customer in customers]
    })

@customers_bp.route('/customers', methods=['POST'])
def create_customer():
    if not check_permission(['客服', '派单', '管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    data = request.get_json()
    name = data.get('name')
    initial_balance = data.get('balance', 0.0)
    
    if not name:
        return jsonify({'error': '客户姓名不能为空'}), 400
    
    # 检查客户是否已存在
    if Customer.query.filter_by(name=name).first():
        return jsonify({'error': '客户已存在'}), 400
    
    customer = Customer(name=name, balance=initial_balance)
    db.session.add(customer)
    db.session.commit()
    
    return jsonify({
        'message': '客户创建成功',
        'customer': customer.to_dict()
    }), 201

@customers_bp.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    if not check_permission(['管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()
    
    if 'name' in data:
        customer.name = data['name']
    if 'balance' in data:
        customer.balance = data['balance']
    
    customer.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': '客户信息更新成功',
        'customer': customer.to_dict()
    })

@customers_bp.route('/customers/<int:customer_id>/transactions', methods=['GET'])
def get_customer_transactions(customer_id):
    if not check_permission(['客服', '派单', '管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    customer = Customer.query.get_or_404(customer_id)
    transactions = Transaction.query.filter_by(customer_id=customer_id).order_by(Transaction.created_at.desc()).all()
    
    return jsonify({
        'customer': customer.to_dict(),
        'transactions': [transaction.to_dict() for transaction in transactions]
    })

@customers_bp.route('/customers/<int:customer_id>/transactions', methods=['POST'])
def create_transaction(customer_id):
    if not check_permission(['客服', '派单', '管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    user_id = session.get('user_id')
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()
    
    amount = data.get('amount')
    bonus = data.get('bonus', 0.0)
    transaction_date_str = data.get('transaction_date')
    
    if amount is None:
        return jsonify({'error': '交易金额不能为空'}), 400
    
    # 解析交易日期
    if transaction_date_str:
        try:
            transaction_date = datetime.strptime(transaction_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': '日期格式错误，请使用 YYYY-MM-DD 格式'}), 400
    else:
        transaction_date = date.today()
    
    # 记录原余额
    previous_balance = customer.balance
    
    # 计算新余额
    if amount > 0:  # 充值
        new_balance = previous_balance + amount + bonus
    else:  # 消费
        new_balance = previous_balance + amount  # amount 为负数
    
    # 创建交易记录
    transaction = Transaction(
        customer_id=customer_id,
        previous_balance=previous_balance,
        amount=amount,
        current_balance=new_balance,
        bonus=bonus,
        transaction_date=transaction_date,
        created_by=user_id
    )
    
    # 更新客户余额
    customer.balance = new_balance
    customer.updated_at = datetime.utcnow()
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': '交易记录创建成功',
        'transaction': transaction.to_dict(),
        'customer': customer.to_dict()
    }), 201

@customers_bp.route('/transactions', methods=['GET'])
def get_all_transactions():
    if not check_permission(['管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return jsonify({
        'transactions': [transaction.to_dict() for transaction in transactions]
    })

@customers_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    if not check_permission(['管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    transaction = Transaction.query.get_or_404(transaction_id)
    
    # 恢复客户余额
    customer = transaction.customer
    customer.balance = transaction.previous_balance
    customer.updated_at = datetime.utcnow()
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({'message': '交易记录删除成功'})

