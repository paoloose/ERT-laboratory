#import "template.mod.typ": *
#import "functions.mod.typ": *

#show: article.with(
  title: "What is ERT?",
  subtitle: "Understanding ERT",
)

= Electrical Resistivity Tomography

Electrical Resistivity Tomography (ERT) is #term[geophysical suvery], and
therefore, it energizes the earth in order to get some information about it.
The main product of ERT is the visualization of the subsurface structure,
and it achieve this by injecting a known amount of direct current (DC) at
strategic points throughout an entire surface and measuring the resulting
voltage on each of them, thus being able to calculate its resistivity (actually
an #important[apparent resistivity]).
Finally, as in every #link("https://www.youtube.com/watch/dn358iX_WxQ", [tomography])
method, we solve the #link("https://www.wikiwand.com/en/Inverse_problem", [#term[inverse problem]])
for our data, obtaining a visual representation of who casued the resistivity
that we measured.

#figure(
  image("../assets/ERTplot_result.png", width: 100%),
  caption: [ ERT plot from `.xlsx` data by #link("https://github.com/lhalloran/ERTplot", [  lhalloran/ERTplot. ]) ],
)

ERT is applied as a non-invasive technique for geological or hydrological
subsurface structure detection, to finding pollution leakages, and since the
1940s it's being used for mineral
exploration
#footnote[In the 1940s, Andrey Nikolayevich worked on solving the inverse
problem for the not yet formalized ERT technique, managing to discover large
deposits of copper without any help from computers.].

This method demands simple equipment and provides good spatial resolution.
The following document will discuss about some whys about ERT and its
mathematical and physics principles.

// Why the obtained resistivity is an apparent resistivity?

== Why resistivity?

// review: https://gpg.geosci.xyz/content/DC_resistivity/DC_physical_properties.html

== ERT limitations

uwu
