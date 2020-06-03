import React, {useState} from 'react';
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import './App.css';
import {Button, Card, Col, Container, Form, FormControl, Navbar, Row} from "react-bootstrap";

const MyNodeComponent = ({node}) => {
    return (
        <div className="initechNode">{ node.name }</div>
    );
};

function App() {
    const [input, setInput] = useState('');
    const [personList, setPersonList] = useState([]);
    const [personChoice, setPersonChoice] = useState({});


    const getPersonFromWikidata = (personName) => {
        const queryPerson = "SELECT ?item ?itemLabel ?image ?gender " +
            "WHERE {" +
            "  ?item wdt:P31 wd:Q5." +
            "  ?item ?label \"" + personName + "\"." +
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
                        name: res.itemLabel.value
                    };
                })
            );
    };

    const getChildren = (parentId) => {
        const queryChild = "SELECT ?child ?childLabel ?image ?gender " +
          "WHERE" +
          "{" +
          "  wd:" + parentId + " wdt:P40 ?child." +
          "  OPTIONAL {?child wdt:P18 ?image}." +
          "  OPTIONAL {?child wdt:P21 ?gender}." +
          "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"fr,en\". }" +
          "}";

        console.log("https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=" + queryChild);
        return fetch("https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=" + queryChild)
            .then(res => res.json())
            .then(json => json.results.bindings.map(res => {
                    return {
                        id: extractIdFromWikidataUrl(res.child.value),
                        image: res.image?.value,
                        gender: extractIdFromWikidataUrl(res.gender.value),
                        name: res.childLabel.value
                    };
                })
            );
    };

    const extractIdFromWikidataUrl = (url) => {
        return url.replace("http://www.wikidata.org/entity/", "");
    };

    const data = {
        name: "Bill Lumbergh",
        actor: "Gary Cole",
        children: [
            {
                name: "Peter Gibbons",
                actor: "Ron Livingston",
                children: [
                    {
                        name: "And More!!",
                        actor: "This is just to show how to build a complex tree with multiple levels of children. Enjoy!"
                    }
                ]
            },
            {
                name: "Milton Waddams",
                actor: "Stephen Root"
            },
            {
                name: "Bob Slydell",
                actor: "John C. McGi..."
            },
        ]
    };

    const getTree = async (person) => {
        const childrenList = await getChildren(person.id);
        if (childrenList.length === 0)
            return person;
        person.children = childrenList.map(child => {
            return getTree(child);
        });
        return person;
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        let personList = await getPersonFromWikidata(input);
        setPersonList(personList);
    };

    const handleChoosePerson = (person) => {
        console.log(JSON.stringify(person));
        setPersonChoice(person);
        //console.log(getTree(personList[0]));
    };

    const shouldDisplayGraph = () => {
        return Object.entries(personChoice).length > 0;
    }

    const shouldDisplayChoice = () => {
        return Object.entries(personChoice).length == 0 && Object.entries(personList).length;
    }

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
                <Button variant="dark">Search</Button>
            </Form>
        </div>
        <Container>
            {shouldDisplayChoice() ? <PersonList onClick={handleChoosePerson} data={personList} /> : null}
            {shouldDisplayGraph() ? <OrgChart tree={data} NodeComponent={MyNodeComponent} /> : null}
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
                        <Card.Text>
                            Some quick example text to build on the card title and make up the bulk of
                            the card's content.
                        </Card.Text>
                        <Button variant="dark" onClick={() => onClick(person)}>Select</Button>
                    </Card.Body>
                </Card>
            </Col>
        )}
        </Row>
    )
}

export default App;
