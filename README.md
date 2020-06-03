### Request : Find Person

SELECT ?item ?itemLabel ?image ?sexe WHERE {
  ?item wdt:P31 wd:Q5.
  ?item ?label "Elon Musk"@fr .
  ?item wdt:P18 ?image .
  ?item wdt:P21 ?sexe .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}

###Request : Find child

SELECT ?childLabel ?image ?sexe
WHERE
{
  wd:Q317521 wdt:P40 ?child.
  OPTIONAL {?child wdt:P18 ?image}.
  OPTIONAL {?child wdt:P21 ?sexe}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
