import sys
import subprocess
import tomllib

# from https://github.com/pypa/pip/issues/11440#issuecomment-1540974630
with open('pyproject.toml', 'rb') as f:
    data = tomllib.load(f)

if 'project' not in data:
    raise ValueError('No PEP 621 metadata in pyproject.toml')
if 'dependencies' in data['project'].get('dynamic', []):
    raise ValueError('Dependencies cannot be dynamic')

deps = data['project'].get('dependencies')

if deps:
    cmd = [sys.executable, '-m', 'pip', 'install', *deps]
    subprocess.run(cmd)

# NOTE:
# remember to setup redis
# https://realpython.com/asynchronous-tasks-with-django-and-celery/#install-redis-as-your-celery-broker-and-database-back-end
