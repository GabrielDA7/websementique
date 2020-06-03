import React, {useState} from 'react';
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import './App.css';
import {Button, Card, Col, Container, Form, FormControl, Navbar, Row} from "react-bootstrap";
import ScrollContainer from 'react-indiana-drag-scroll';

const MyNodeComponent = ({node}) => {
    return (
        <div className="initechNode">{ node.name }</div>
    );
};

function App() {
    const [input, setInput] = useState('');
    const [error, setError] = useState();
    const [personList, setPersonList] = useState([]);
    const [data, setData] = useState([]);

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

    const getTree = (person) => {
        const query = "SELECT DISTINCT ?item ?depth ?itemLabel ?image ?child ?gender ?deathLocationCoordinates " +
            "WHERE {" +
            "  SERVICE gas:service {" +
            "    gas:program gas:gasClass \"com.bigdata.rdf.graph.analytics.SSSP\" ;" +
            "                gas:in wd:" + person.id + " ;" +
            "                gas:traversalDirection \"Forward\" ;" +
            "                gas:out ?item ;" +
            "                gas:out1 ?depth ;" +
            "                gas:maxIterations 10;" +
            "                gas:linkType wdt:P40 ." +
            "  }" +
            "  OPTIONAL { ?item wdt:P40 ?child }" +
            "  OPTIONAL { ?item wdt:P18 ?image }" +
            "  OPTIONAL { ?item wdt:P21 ?gender }" +
            "  OPTIONAL { " +
            "    ?item wdt:P20 ?deathLocation." +
            "    ?deathLocation wdt:P625 ?deathLocationCoordinates" +
            "  }" +
            "  SERVICE wikibase:label {bd:serviceParam wikibase:language \"fr,en\" }" +
            "}" +
            "ORDER BY ?depth";

        return fetch("https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=" + query)
            .then(res => res.json())
            .then(json => json.results.bindings.map(res => {
                    return {
                        id: extractIdFromWikidataUrl(res.item.value),
                        depth: res.depth?.value | 0,
                        image: res.image?.value,
                        gender: extractIdFromWikidataUrl(res.gender.value),
                        name: res.itemLabel.value,
                        child: extractIdFromWikidataUrl(res.child?.value),
                        deathLocation: res.deathLocationCoordinates?.value
                    };
                })
            );
    };

    const extractIdFromWikidataUrl = (url) => {
        if (url === undefined)
            return url;
        return url.replace("http://www.wikidata.org/entity/", "");
    };

    const mergeDuplicate = (tree) => {
        let mergedPerson = [];
        tree.forEach(person => {
            if (mergedPerson.filter(p => p.name === person.name).length > 0)
                return;
            let samePerson = tree.filter(p => p.name === person.name);
            samePerson[0].child = samePerson.map(p => p.child).filter(child => child !== undefined);
            mergedPerson.push(samePerson[0]);
        });
        return mergedPerson;
    };

    const formatData = (people) => {
        let rootPerson = people.filter(person => person.depth === 0);
        rootPerson = rootPerson[0];
        getChildren(rootPerson, people);
        return rootPerson;
    };

    const getChildren = (person, people) => {
        let children = people.filter(p => person.child.includes(p.id));
        children.forEach(child => getChildren(child, people));
        person.children = children;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let personList = await getPersonFromWikidata(input);
        if(personList.length <= 0) {
            setError('Not found');
        } else {
            setPersonList(personList);
        }
    };

    const handleChoosePerson = async (person) => {
        let tree = await getTree(person);
        let people = mergeDuplicate(tree);
        let data = formatData(people);
        setData(data);
    };

    const shouldDisplayGraph = () => {
        return Object.entries(data).length > 0;
    };

    const shouldDisplayChoice = () => {
        return Object.entries(data).length === 0 && Object.entries(personList).length;
    };

  return (
    <div className="App">
        <Navbar style={{backgroundColor: "#3f3f44"}} expand="lg">
            <Navbar.Brand style={{color: "#ffffff"}}>Généalogie</Navbar.Brand>
        </Navbar>
        <div style={{
            backgroundColor: "#cceabb",
            padding: "35px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <h2>Find celebrity descendants</h2>
            <Form className="mt-2" inline onSubmit={handleSubmit}>
                <FormControl type="text" value={input} placeholder="Search" onChange={(e) => setInput(e.target.value)} className="mr-sm-2" />
                <Button type="submit" variant="dark">Search</Button>
            </Form>
        </div>
        <Container fluid>
            {error ? <span>{error}</span> : null}
            {shouldDisplayChoice() ? <PersonList onClick={handleChoosePerson} data={personList} /> : null}
            {shouldDisplayGraph() ?
                    <ScrollContainer className="scroll-container">
                        <OrgChart tree={data} NodeComponent={MyNodeComponent} />
                    </ScrollContainer>
                : null}
        </Container>
    </div>
  );
}

function PersonList(props) {
    const {data, onClick} = props;

    return (
        <Row className="pt-2">
        {data.map((person, index) =>
            <Col xs lg="4" key={index}>
                <Card style={{ width: '18rem' }}>
                    <Card.Img style={{height: "300px"}} variant="top" src={person.image} />
                    <Card.Body>
                        <Card.Title>{person.name}</Card.Title>
                        <Card.Text>{person.description}</Card.Text>
                        <Button variant="dark" onClick={() => onClick(person)}>Select</Button>
                    </Card.Body>
                </Card>
            </Col>
        )}
        </Row>
    )
}

export default App;
