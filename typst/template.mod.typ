#let article(
  title: "Untitled article",
  paper: "iso-b5",
  subtitle: none,
  body,
) = {
  // Set the document's metadata.

  set document(title: title)
  set text(font: "TeX Gyre Pagella")

  // Page properties
  set page(
    paper: paper,
    margin: (bottom: 1.75cm, top: 2.2cm)
  )

  // The first page
  page(align(center + horizon)[
    #text(2em)[*#title*]
    #v(2em, weak: true)
    #text(1.4em, subtitle)
  ])

  pagebreak()

  // Configure paragraph properties.
  set par(
    leading: 0.78em,
    justify: true
  )
  show par: set block(spacing: 1.4em)

  // Add padding to headings.
  show heading: it => [
    #pad(bottom: 0.75em, it.body)
  ]

  show link: underline;

  set math.equation(numbering: "(1)")

  show emph: it => {
    text(it.body, style: "italic")
  }

  // Configure page properties.
  set page(
    numbering: "1",

    // The header always contains the book title on odd pages and
    // the chapter title on even pages, unless the page is one
    // the starts a chapter (the chapter title is obvious then).
  )

  body
}
