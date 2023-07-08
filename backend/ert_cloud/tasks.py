import os
from celery import Celery
import json

app = Celery('ert_cloud')

# result ordering?
# https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/redis.html#group-result-ordering
app.conf.update(
    enable_utc = True,
    task_serializer = 'json',
    result_serializer = 'json',
    accept_content = ['json'],
    result_expires = 60 * 60 * 24, # one week,
    # broker_url = 'amqp://myuser:mypassword@localhost:5672/myvhost',
    broker_url = os.environ.get('AMQP_ADDR', 'amqp://localhost'),
    result_backend = 'redis://localhost:6379/0'
)

# TODO: move this to flask
# make this work in insomnia

@app.task()
def render_3d_shape(poly_file_str: str, rhomap: list[list[float, float]]) -> int:
    # workflow from
    # https://github.com/halbmy/pyGIMLi-workshop/blob/main/2_ERT/1_2D_surface_ERT_rrays.ipynb
    import numpy as np
    from matplotlib import pyplot as plt
    from matplotlib.backends.backend_agg import FigureCanvasAgg
    import pygimli as pg
    from pygimli import meshtools as mt
    from pygimli.physics import ert
    import tempfile

    # write string to a tempfile
    with tempfile.NamedTemporaryFile(suffix='.poly', delete=True) as f:
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

        # would be nice to send this to the client:
        # pg.show(mesh, markers=True, showMesh=True);

        # [[regionNumber, resistivity], [regionNumber, resistivity], [...]
        # TODO: set markers in .poly file and link them with a romap
        ax, _ = pg.viewer.showMesh(
            mesh,
            rhomap,
            # markers=True,
            showMesh=True,
            # showBoundary=True,
            figsize=(10, 6)
        )

        fig = ax.get_figure()
        fig.tight_layout()
        canvas = FigureCanvasAgg(fig)

        # Retrieve a view on the renderer buffer
        canvas.draw()
        buf = canvas.buffer_rgba()

        # save buffer to file
        import PIL.Image
        PIL.Image.frombuffer(
            'RGBA',
            (buf.shape[1], buf.shape[0]),
            buf,
            'raw',
            'RGBA',
            0,
            1
        )

        plt.close()
    return 69
