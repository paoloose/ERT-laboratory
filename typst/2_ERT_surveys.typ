#import "template.mod.typ": *
#import "functions.mod.typ": *

#show: article.with(
  title: "ERT surveys",
  subtitle: "Understanding ERT",
)

= ERT survey

In the context of geophysics, surveying is the process of collecting geophysical
data in form of signals to indirecly determine the subsurface properties and its
spacial structure.

#citation[
  Geophysical surveys are essentially source-response geological studies; source
  being the natural fields of the earth (passive methods) or by artificially
  energizing the earth (active methods) and the responses are interpreted as due
  to the geological variations. @geosurvey_india
]

Geophysical survey methods are separated by the type of energy source used to
excite the subsurface #footnote[
  In general, we distinguish from magnetic, electromagnetic, seismic, and
  electrical methods.
]. ERT falls into the category of electrical methods.

== Injecting DC current into the ground

So, ERT energizes the earth by injecting current into the ground. Here we need
to moved beyond the image of current flowing linearly through a wire. In any
3D shaped body, electrical current is not constrained to follow a single path.

#figure(
  image("../assets/current_flow.png", width: 100%),
  caption: [
    Simplified current flow lines and equipotential surfaces arising from (a) a
    single current source and from (b) a set of current electrodes (a source and
    sink).
  ],
) <current_flow>

In the @current_flow above, a) shows how current flows when injected into the
ground through a single electrode. In ERT, two electrodes (A and B) are used to
inject current into the ground, as shown in b)
#footnote[
  Here, you are looking at 2D current flow lines. However, is worth to mention
  that current actually flows trough the 3D space. a) is radially symmetric,
  while b) _seems_ ellipsoidal. Try to think of how the current flow lines would
  look like in the subsurface 3D space.
]. The current flows from the positive
electrode into the ground and back to the negative one. Electrodes M are N are
used to measure the potential difference between them. Later, we will see why
this is important.

#figure(
  image("../assets/heterogeneities.png", width: 100%),
  caption: [
    Current flow lines in uniform and non-uniform earth models.
  ],
) <two_sources>

Back into reality, since Earth is not uniform, current flow lines are distorted
by the presence of resistivity heterogeneities. Current density ($J$), the
amount of electric current flowing per unit cross-sectional area of a material,
increases in areas of low resistivity and decreases in areas of high
resistivity. This current propagation is described by Ohm's law
#footnote[
  Physicists use the term Ohm's law to refer to the many forms on which the
  relation ($V = I R$) can be represented. You can think on this form as a 3D
  version of this relation, since it involves the flow of current through a
  material.
]:

$ J = sigma E $ <current_density>

Where:
- $J$ is the current density (SI unit: $A/m^2$);
- $sigma$ is the conductivity (SI unit: $S/m$ or $1/(ohm m)$);
- $E$ is the electric field (SI unit: $V/m$ or $N/C$).

You can think of this as "The amount of current passing through a cross
sectional area $J$ is proportional to the existing electric field $E$, where
the conductivity $sigma$ is the constant of proportionality: current density
increases within conductive regions, and decreases within resistive regions".

// TODO:
/*
Do this have anything to do with why we measure the potential difference?
https://gpg.geosci.xyz/content/DC_resistivity/DC_basic_principles_equations.html

Roadmap:
- understand the above question
- prove the relation of resistivity with current and potential
- // we will see...
*/

== Measuring potential difference

Potential difference ($V$) is measured between two points, in this case, between
electrodes M and N.

#bibliography("bibliography.bib", style: "apa")
