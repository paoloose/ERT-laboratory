from flask_socketio import SocketIO

socketio = SocketIO(
    async_mode='gevent', # default is threading
    cors_allowed_origins='*'
)
