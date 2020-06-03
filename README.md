### Request : Find Person

SELECT ?item ?itemLabel ?image WHERE {
  ?item wdt:P31 wd:Q5.
  ?item ?label "Elon Musk"@fr .
  ?item wdt:P18 ?image .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
}

###Request : Find child
