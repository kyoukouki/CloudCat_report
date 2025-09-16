from flask import Blueprint, jsonify, session, send_file
from src.models.user import db, Order, Transaction, Customer
import csv
import io
import os
from datetime import datetime

export_bp = Blueprint('export', __name__)

def check_permission(required_roles):
    """检查用户权限"""
    user_role = session.get('user_role')
    if not user_role or user_role not in required_roles:
        return False
    return True

@export_bp.route('/export/companion_stats', methods=['GET'])
def export_companion_stats():
    if not check_permission(['财务']):
        return jsonify({'error': '权限不足'}), 403
    
    # 按陪玩统计流水
    stats = db.session.query(
        Order.companion_name,
        db.func.sum(Order.total_price).label('total_amount'),
        db.func.count(Order.id).label('order_count')
    ).group_by(Order.companion_name).order_by(db.func.sum(Order.total_price).desc()).all()
    
    # 创建CSV文件
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 写入表头
    writer.writerow(['排名', '陪玩姓名', '总金额', '订单数量'])
    
    # 写入数据
    for index, stat in enumerate(stats, 1):
        writer.writerow([
            index,
            stat.companion_name,
            float(stat.total_amount) if stat.total_amount else 0,
            stat.order_count
        ])
    
    # 创建文件
    filename = f'companion_stats_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    filepath = os.path.join('/tmp', filename)
    
    with open(filepath, 'w', encoding='utf-8-sig') as f:
        f.write(output.getvalue())
    
    return send_file(filepath, as_attachment=True, download_name=filename, mimetype='text/csv')

@export_bp.route('/export/orders', methods=['GET'])
def export_orders():
    if not check_permission(['管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    orders = Order.query.order_by(Order.created_at.desc()).all()
    
    # 创建CSV文件
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 写入表头
    writer.writerow([
        'ID', '老板', '陪玩', '项目', '时间', '单时', '单价', '总价', 
        '备注', '派单信息', '客服接待', '反馈', '创建时间', '更新时间'
    ])
    
    # 写入数据
    for order in orders:
        writer.writerow([
            order.id,
            order.boss_name,
            order.companion_name,
            order.project,
            order.time_info or '',
            order.hours or '',
            order.unit_price or '',
            order.total_price,
            order.remarks or '',
            order.dispatch_info or '',
            order.customer_service_info or '',
            order.feedback or '',
            order.created_at.strftime('%Y-%m-%d %H:%M:%S') if order.created_at else '',
            order.updated_at.strftime('%Y-%m-%d %H:%M:%S') if order.updated_at else ''
        ])
    
    # 创建文件
    filename = f'orders_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    filepath = os.path.join('/tmp', filename)
    
    with open(filepath, 'w', encoding='utf-8-sig') as f:
        f.write(output.getvalue())
    
    return send_file(filepath, as_attachment=True, download_name=filename, mimetype='text/csv')

@export_bp.route('/export/transactions', methods=['GET'])
def export_transactions():
    if not check_permission(['管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    
    # 创建CSV文件
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 写入表头
    writer.writerow([
        'ID', '客户姓名', '原余额', '交易金额', '现余额', '充值赠送', '交易日期', '创建时间'
    ])
    
    # 写入数据
    for transaction in transactions:
        writer.writerow([
            transaction.id,
            transaction.customer.name if transaction.customer else '',
            transaction.previous_balance,
            transaction.amount,
            transaction.current_balance,
            transaction.bonus,
            transaction.transaction_date.strftime('%Y-%m-%d') if transaction.transaction_date else '',
            transaction.created_at.strftime('%Y-%m-%d %H:%M:%S') if transaction.created_at else ''
        ])
    
    # 创建文件
    filename = f'transactions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    filepath = os.path.join('/tmp', filename)
    
    with open(filepath, 'w', encoding='utf-8-sig') as f:
        f.write(output.getvalue())
    
    return send_file(filepath, as_attachment=True, download_name=filename, mimetype='text/csv')

