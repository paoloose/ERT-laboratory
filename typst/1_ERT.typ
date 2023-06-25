#import "template.mod.typ": *
#import "functions.mod.typ": *

#show: article.with(
  title: "What is ERT?",
  subtitle: "Understanding ERT",
)

= Electrical Resistivity Tomography

Electrical Resistivity Tomography (ERT) is a #term[geophysical suvery], and
therefore, it energizes the earth in order to get some information about it.
The main product of ERT is the visualization of the subsurface structure by
looking at its resistivity distribution, and this is achieved this by injecting
a known amount of direct current (DC) at strategic points throughout an entire
surface and measuring the resulting voltage on each of them, thus being able to
calculate its resistivity (actually an #important[apparent resistivity]).
Finally, as in every #link("https://www.youtube.com/watch/dn358iX_WxQ",
[tomography]) method, we solve the
#link("https://en.wikipedia.org/wiki/Inverse_problem", [#term[inverse problem]])
for our data, obtaining a visual representation of who caused the resistivity
that we measured.

#figure(
  image("../assets/ERTplot_result.png", width: 100%),
  caption: [
    ERT plot from `.xlsx` data from
    #link("https://github.com/lhalloran/ERTplot", [lhalloran/ERTplot.])
  ],
)

ERT is applied as a non-invasive technique for geological or hydrological
subsurface structure detection, to finding pollution leakages, and since the
1940s it is being used for mineral exploration
#footnote[In the 1940s, Andrey
Nikolayevich worked on solving the inverse problem for the not yet formalized
ERT technique, managing to discover large deposits of copper without any help
from computers.].

This method demands simple equipment and provides good spatial resolution.
The following document will discuss about some whys about ERT and its
mathematical and physics principles.

// Why the obtained resistivity is an apparent resistivity?

== Why resistivity?

Electrical resistivity $rho$ ($ohm dot m$) is a bulk property of materials that
characterizes how much they oppose the flow of electrical current. Materials
with low resistivity are called conductors, while those with high resistivity
are called insulators. Resistivity is the reciprocal of electrical conductivity
$sigma$ ($"siemens"/m$), which is the ability of a material to conduct electric
current.

Both resistivity and conductivity are _intensive properties_
#footnote[
  Not to be confused with their _extensive_ versions: resistance and
  conductance.
],
which mans that they do not depend on the amount of material. This means that,
by visualizing the subsurface resistivity distribution, we are also viewing at
the material distribution, and we can easily distinguish between conductive and
insulating materials (e.g. minerals and rocks).

The figure below shows the resistivity range of some common subsurface
materials.

#figure(
  image("../assets/resistivity_table.png"),
  caption: [Electrical conductivity and resistivity of common rocks.],
)

Note that there is no absolute value for resistivity, in our measures,
resistivity will depend on many factors like:

- Porosity of material (how much empty space it has), which increases
  resistivity.
- Moisture content, which may increase or decrease resistivity depending on the
  material.
- Temperature #footnote[
    For better precision, some resistivity tables add an additional column with
    the _Temperature coefficient_ $(K^(-1))$ of the material.
  ], hydraulic permeability, etc.

// review: https://gpg.geosci.xyz/content/DC_resistivity/DC_physical_properties.html
