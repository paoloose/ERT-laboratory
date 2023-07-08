from flask import Flask, request

app = Flask(__name__)

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

    # workflow from
    # https://github.com/halbmy/pyGIMLi-workshop/blob/main/2_ERT/1_2D_surface_ERT_rrays.ipynb

    # write string to a tempfile
    with tempfile.NamedTemporaryFile(suffix='.poly', delete=False) as f:
        f.write(poly_file_str.encode())
        f.close()

        geom = mt.readPLC(f.name)
        scheme = ert.createData(elecs=np.linspace(start=-40, stop=40, num=50), schemeName='dd')

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
            # markers=True,
            showMesh=True,
            # showBoundary=True,
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
