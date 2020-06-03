### Request : Find Person

```
SELECT ?item ?itemLabel ?image ?gender 
WHERE {
  ?item wdt:P31 wd:Q5.
  ?item ?label "Elon Musk" .
  ?item wdt:P18 ?image .
  ?item wdt:P21 ?gender .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
```

###Request : Find child

```
SELECT ?child ?childLabel ?image ?gender
WHERE
{
  wd:Q317521 wdt:P40 ?child.
  OPTIONAL {?child wdt:P18 ?image}.
  OPTIONAL {?child wdt:P21 ?gender}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
```
