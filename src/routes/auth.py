from flask import Blueprint, request, jsonify, session
from src.models.user import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    user_code = data.get('user_code')
    
    if not username or not user_code:
        return jsonify({'error': '用户名和编号不能为空'}), 400
    
    user = User.query.filter_by(username=username, user_code=user_code).first()
    if not user:
        return jsonify({'error': '用户名或编号错误'}), 401
    
    session['user_id'] = user.id
    session['user_role'] = user.role
    
    return jsonify({
        'message': '登录成功',
        'user': user.to_dict()
    })

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': '退出成功'})

@auth_bp.route('/current_user', methods=['GET'])
def current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '未登录'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    return jsonify({'user': user.to_dict()})

@auth_bp.route('/register', methods=['POST'])
def register():
    # 只有管理员或财务可以注册新用户
    current_user_role = session.get('user_role')
    if current_user_role not in ['管理', '财务']:
        return jsonify({'error': '权限不足'}), 403
    
    data = request.get_json()
    username = data.get('username')
    user_code = data.get('user_code')
    role = data.get('role')
    
    if not username or not user_code or not role:
        return jsonify({'error': '所有字段都不能为空'}), 400
    
    if role not in ['陪玩', '客服', '派单', '管理', '财务']:
        return jsonify({'error': '角色无效'}), 400
    
    # 检查用户名和编号是否已存在
    if User.query.filter_by(username=username).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    if User.query.filter_by(user_code=user_code).first():
        return jsonify({'error': '编号已存在'}), 400
    
    user = User(username=username, user_code=user_code, role=role)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': '用户注册成功',
        'user': user.to_dict()
    }), 201

