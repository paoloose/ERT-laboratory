
#let term(content) = {
    text(red, content)
}

#let important(content) = {
    text(orange, content)
}

#let citation(body, padding: 12pt) = {
    pad(left: padding, [#body])
}
