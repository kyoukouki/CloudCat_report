from flask import Blueprint, request, jsonify, session
from src.models.user import db, Order, User
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

def check_permission(required_roles):
    """检查用户权限"""
    user_role = session.get('user_role')
    if not user_role or user_role not in required_roles:
        return False
    return True

@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    user_id = session.get('user_id')
    user_role = session.get('user_role')
    
    if not user_id:
        return jsonify({'error': '未登录'}), 401
    
    # 根据角色返回不同的订单数据
    if user_role == '陪玩':
        # 陪玩只能看到自己创建的订单
        orders = Order.query.filter_by(created_by=user_id).all()
    elif user_role in ['客服', '派单']:
        # 客服和派单可以看到所有订单
        orders = Order.query.all()
    elif user_role in ['管理', '财务']:
        # 管理和财务可以看到所有订单
        orders = Order.query.all()
    else:
        return jsonify({'error': '权限不足'}), 403
    
    return jsonify({
        'orders': [order.to_dict() for order in orders]
    })

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    user_id = session.get('user_id')
    user_role = session.get('user_role')
    
    if not user_id:
        return jsonify({'error': '未登录'}), 401
    
    if user_role != '陪玩':
        return jsonify({'error': '只有陪玩可以创建订单'}), 403
    
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['boss_name', 'companion_name', 'project', 'total_price']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} 不能为空'}), 400
    
    order = Order(
        boss_name=data.get('boss_name'),
        companion_name=data.get('companion_name'),
        project=data.get('project'),
        time_info=data.get('time_info'),
        hours=data.get('hours'),
        unit_price=data.get('unit_price'),
        total_price=data.get('total_price'),
        remarks=data.get('remarks'),
        created_by=user_id
    )
    
    db.session.add(order)
    db.session.commit()
    
    return jsonify({
        'message': '订单创建成功',
        'order': order.to_dict()
    }), 201

@orders_bp.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    user_id = session.get('user_id')
    user_role = session.get('user_role')
    
    if not user_id:
        return jsonify({'error': '未登录'}), 401
    
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    # 权限检查
    if user_role == '陪玩':
        # 陪玩只能修改自己创建的订单，且只能修改基本信息
        if order.created_by != user_id:
            return jsonify({'error': '只能修改自己的订单'}), 403
        
        # 陪玩可以修改的字段
        allowed_fields = ['boss_name', 'companion_name', 'project', 'time_info', 'hours', 'unit_price', 'total_price', 'remarks']
        for field in allowed_fields:
            if field in data:
                setattr(order, field, data[field])
    
    elif user_role in ['客服', '派单']:
        # 客服和派单只能添加派单、客服接待和反馈信息
        allowed_fields = ['dispatch_info', 'customer_service_info', 'feedback']
        for field in allowed_fields:
            if field in data:
                setattr(order, field, data[field])
    
    elif user_role in ['管理', '财务']:
        # 管理和财务可以修改所有字段
        for field, value in data.items():
            if hasattr(order, field):
                setattr(order, field, value)
    
    else:
        return jsonify({'error': '权限不足'}), 403
    
    order.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': '订单更新成功',
        'order': order.to_dict()
    })

@orders_bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    user_role = session.get('user_role')
    
    if not check_permission(['管理', '财务']):
        return jsonify({'error': '权限不足'}), 403
    
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({'message': '订单删除成功'})

@orders_bp.route('/orders/stats', methods=['GET'])
def get_order_stats():
    user_role = session.get('user_role')
    
    if not check_permission(['财务']):
        return jsonify({'error': '权限不足'}), 403
    
    # 按陪玩统计流水
    stats = db.session.query(
        Order.companion_name,
        db.func.sum(Order.total_price).label('total_amount'),
        db.func.count(Order.id).label('order_count')
    ).group_by(Order.companion_name).order_by(db.func.sum(Order.total_price).desc()).all()
    
    result = []
    for stat in stats:
        result.append({
            'companion_name': stat.companion_name,
            'total_amount': float(stat.total_amount) if stat.total_amount else 0,
            'order_count': stat.order_count
        })
    
    return jsonify({'stats': result})

