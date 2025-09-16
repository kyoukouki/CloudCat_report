from flask import Blueprint, jsonify, request, session
from src.models.user import User, db

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    # 检查权限
    user_role = session.get('user_role')
    if user_role not in ['管理', '财务']:
        return jsonify({'error': '权限不足'}), 403
    
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]})

@user_bp.route('/users', methods=['POST'])
def create_user():
    # 检查权限
    user_role = session.get('user_role')
    if user_role not in ['管理', '财务']:
        return jsonify({'error': '权限不足'}), 403
    
    data = request.json
    
    # 检查用户编号是否已存在
    existing_user = User.query.filter_by(user_code=data.get('user_code')).first()
    if existing_user:
        return jsonify({'error': '用户编号已存在'}), 400
    
    # 检查用户名是否已存在
    existing_username = User.query.filter_by(username=data.get('username')).first()
    if existing_username:
        return jsonify({'error': '用户名已存在'}), 400
    
    user = User(
        username=data.get('username'),
        user_code=data.get('user_code'),
        role=data.get('role'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': '用户创建成功',
        'user': user.to_dict()
    }), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # 检查权限
    user_role = session.get('user_role')
    if user_role not in ['管理', '财务']:
        return jsonify({'error': '权限不足'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.json
    
    # 检查用户编号是否与其他用户冲突
    if 'user_code' in data and data['user_code'] != user.user_code:
        existing_user = User.query.filter_by(user_code=data['user_code']).first()
        if existing_user:
            return jsonify({'error': '用户编号已存在'}), 400
    
    # 检查用户名是否与其他用户冲突
    if 'username' in data and data['username'] != user.username:
        existing_username = User.query.filter_by(username=data['username']).first()
        if existing_username:
            return jsonify({'error': '用户名已存在'}), 400
    
    user.username = data.get('username', user.username)
    user.user_code = data.get('user_code', user.user_code)
    user.role = data.get('role', user.role)
    user.is_active = data.get('is_active', user.is_active)
    
    db.session.commit()
    return jsonify({
        'message': '用户更新成功',
        'user': user.to_dict()
    })

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # 检查权限
    user_role = session.get('user_role')
    if user_role not in ['管理', '财务']:
        return jsonify({'error': '权限不足'}), 403
    
    user = User.query.get_or_404(user_id)
    
    # 不能删除自己
    current_user_id = session.get('user_id')
    if user_id == current_user_id:
        return jsonify({'error': '不能删除自己的账号'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': '用户删除成功'}), 200

@user_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
def toggle_user_status(user_id):
    # 检查权限
    user_role = session.get('user_role')
    if user_role not in ['管理', '财务']:
        return jsonify({'error': '权限不足'}), 403
    
    user = User.query.get_or_404(user_id)
    
    # 不能禁用自己
    current_user_id = session.get('user_id')
    if user_id == current_user_id:
        return jsonify({'error': '不能禁用自己的账号'}), 400
    
    user.is_active = not user.is_active
    db.session.commit()
    
    status_text = '启用' if user.is_active else '禁用'
    return jsonify({
        'message': f'用户已{status_text}',
        'user': user.to_dict()
    })

