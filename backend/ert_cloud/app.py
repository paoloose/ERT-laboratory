from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import numpy as np
import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
from matplotlib.figure import Figure
import pygimli as pg
from pygimli import meshtools as mt
from pygimli.physics import ert
import tempfile

import base64
import io

@app.post('/render')
def render_mesh():
    body = request.get_json()
    poly_file_str = body['poly_file_str']
    rhomap = body['rhomap']
    print(rhomap)

    # workflow from
    # https://github.com/halbmy/pyGIMLi-workshop/blob/main/2_ERT/1_2D_surface_ERT_rrays.ipynb

    # write string to a tempfile
    with tempfile.NamedTemporaryFile(suffix='.poly', delete=False) as f:
        f.write(poly_file_str.encode())
        f.close()

        geom = mt.readPLC(f.name)
        scheme = ert.createData(elecs=np.linspace(start=0, stop=50, num=50), schemeName='dd')

        for p in scheme.sensors():
            geom.createNode(p)
            geom.createNode(p - [0, 5])

        # Create a mesh for the finite element modelling with appropriate mesh quality.
        # https://www.pygimli.org/pygimliapi/_generated/pygimli.physics.ert.html#pygimli.physics.ert.ERTManager.createMesh
        # Forwarded to createInversionMesh
        mesh = mt.createMesh(geom, quality=34) # area=0.2

        # [[regionNumber, resistivity], [regionNumber, resistivity], [...]
        # TODO: set markers in .poly file and link them with a romap
        pg.viewer.noShow()
        ax, _ = pg.viewer.showMesh(
            mesh,
            rhomap,
            markers=True,
            showNodes=True,
            showMesh=True,
            figsize=(10, 6)
        )

        fig: Figure = ax.get_figure()
        fig.tight_layout()

        image = io.BytesIO()
        fig.savefig(image, format='png')
        plt.close()

        return {
            'image': f'data:image/png;base64,{base64.b64encode(image.getvalue()).decode()}'
        }

@app.post('/apparent')
def get_apparent_sections():
    body = request.get_json()
    poly_file_str = body['poly_file_str']
    rhomap = body['rhomap']

    # workflow from
    # https://github.com/halbmy/pyGIMLi-workshop/blob/main/2_ERT/1_2D_surface_ERT_rrays.ipynb

    # write string to a tempfile
    with tempfile.NamedTemporaryFile(suffix='.poly', delete=False) as f:
        f.write(poly_file_str.encode())
        f.close()

        geom = mt.readPLC(f.name)
        scheme = ert.createData(elecs=np.linspace(start=0, stop=50, num=50), schemeName='dd')

        for p in scheme.sensors():
            geom.createNode(p)
            geom.createNode(p - [0, 5])

        # Create a mesh for the finite element modelling with appropriate mesh quality.
        # https://www.pygimli.org/pygimliapi/_generated/pygimli.physics.ert.html#pygimli.physics.ert.ERTManager.createMesh
        # Forwarded to createInversionMesh
        mesh = mt.createMesh(geom, quality=34) # area=0.2

        # [[regionNumber, resistivity], [regionNumber, resistivity], [...]
        # TODO: set markers in .poly file and link them with a romap
        pg.viewer.noShow()
        data = ert.simulate(
            mesh,
            scheme=scheme,
            res=rhomap,
            noiseLevel=1,
            noiseAbs=1e-6,
            seed=1337
        )
        data.remove(data['rhoa'] < 0)

        ax, _ = pg.show(
            data,
            # markers=True,
            showMesh=True,
            # showBoundary=True,
            figsize=(10, 6)
        )
        # ax.figure.savefig('hola2.png', bbox_inches='tight')

        ax.get_figure().tight_layout()

        image = io.BytesIO()
        plt.savefig(image, format='png')

        return {
            'image': f'data:image/png;base64,{base64.b64encode(image.getvalue()).decode()}'
        }

@app.post('/invert')
def invert_data():
    body = request.get_json()
    poly_file_str = body['poly_file_str']
    rhomap = body['rhomap']

    # workflow from
    # https://github.com/halbmy/pyGIMLi-workshop/blob/main/2_ERT/1_2D_surface_ERT_rrays.ipynb

    # write string to a tempfile
    with tempfile.NamedTemporaryFile(suffix='.poly', delete=False) as f:
        f.write(poly_file_str.encode())
        f.close()

        geom = mt.readPLC(f.name)
        scheme = ert.createData(elecs=np.linspace(start=0, stop=50, num=50), schemeName='dd')

        for p in scheme.sensors():
            geom.createNode(p)
            geom.createNode(p - [0, 0.1])

        # Create a mesh for the finite element modelling with appropriate mesh quality.
        # https://www.pygimli.org/pygimliapi/_generated/pygimli.physics.ert.html#pygimli.physics.ert.ERTManager.createMesh
        # Forwarded to createInversionMesh
        mesh = mt.createMesh(geom, quality=40) # area=0.2

        data = ert.simulate(
            mesh,
            scheme=scheme,
            res=rhomap,
            noiseLevel=1,
            noiseAbs=1e-6,
            seed=1337
        )
        data.remove(data['rhoa'] < 0)

        data["err"] = pg.Vector(data.size(), 0.01)
        mgr = ert.Manager(data)
        mgr.invert()
        ax, _ = mgr.showResult(cMin=10, cMax=1000, xlabel="x (m)", ylabel="y (m)",);
        ax.get_figure().tight_layout()

        image = io.BytesIO()
        plt.savefig(image, format='png')

        return {
            'image': f'data:image/png;base64,{base64.b64encode(image.getvalue()).decode()}'
        }
