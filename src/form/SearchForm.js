import React, {useState} from 'react';
import {Button, Form, FormControl} from "react-bootstrap";
import {extractIdFromWikidataUrl} from "../lib/lib";

function SearchForm(props) {
    const {onSubmit} = props;
    const [input, setInput] = useState('');

    const getPersonFromWikidata = (personName) => {
        const queryPerson = "SELECT ?item ?itemLabel ?itemDescription ?image ?gender " +
            "WHERE {" +
            "  ?item wdt:P31 wd:Q5." +
            "  ?item ?label \"" + personName + "\"@fr." +
            "  ?item wdt:P18 ?image." +
            "  ?item wdt:P21 ?gender." +
            "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"fr,en\". }" +
            "}";

        return fetch("https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=" + queryPerson)
            .then(res => res.json())
            .then(json => json.results.bindings.map(res => {
                    return {
                        id: extractIdFromWikidataUrl(res.item.value),
                        image: res.image.value,
                        gender: extractIdFromWikidataUrl(res.gender.value),
                        name: res.itemLabel.value,
                        description: res.itemDescription?.value
                    };
                })
            );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let personList = await getPersonFromWikidata(input);
        onSubmit(personList);
    }

    return (
        <Form className="mt-2" inline onSubmit={handleSubmit}>
            <FormControl type="text" value={input} placeholder="Search" onChange={(e) => setInput(e.target.value)} className="mr-sm-2" />
            <Button type="submit" variant="dark">Search</Button>
        </Form>
    )
}

export default SearchForm;
