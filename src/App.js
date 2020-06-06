import React, {useEffect, useState} from 'react';
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import './App.css';
import NoImage from './assets/no-image.jpg';
import {
    Button,
    Card,
    Col,
    Container,
    Image,
    ListGroup,
    Modal,
    Navbar,
    Row
} from "react-bootstrap";
import {ModalProvider, useModal} from "./context/ModalContext";
import SearchForm from "./form/SearchForm";
import {extractIdFromWikidataUrl, formatData, mergeDuplicate} from "./lib/lib";
import TopSearch from "./component/TopSearch";

const MaleId = "Q6581097";

const MyNodeComponent = ({node}) => {
    const { showModal } = useModal();
    const sexeClass = node.gender === MaleId ? "male-node" : "female-node";

    return (
        <div className="inittechNode" onClick={() => showModal(node)}>
            <span className={sexeClass}>
                { node.name }
            </span>
        </div>

    );
};

function App() {
    const [data, setData] = useState({
        chart: [],
        step: {
            choicePerson: false,
            displayChart: false
        },
        personList: [],
        user: {name: undefined}
    });

    const MemoizedPersonList = React.memo(PersonList);
    const MemoizedOrgchart = React.memo(OrgChart);


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
                        gender: extractIdFromWikidataUrl(res.gender?.value),
                        name: res.itemLabel.value,
                        child: extractIdFromWikidataUrl(res.child?.value),
                        deathLocation: res.deathLocationCoordinates?.value
                    };
                })
            );
    };

    const handleSubmit = async (personList) => {
        setData({personList: personList, step: {choicePerson: true, displayChart: false}});
    };

    const addViewIp = async (person) => {
        await fetch(' https://websementique-server.herokuapp.com/search-person', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: person.id,
                personName: person.name
            })
        })
            .then(response => response.json())
            .catch(err => console.log(err));
    }

    const handleChoosePerson = async (person) => {
        await addViewIp(person);
        let tree = await getTree(person);
        let people = mergeDuplicate(tree);
        let data = formatData(people);
        setData({data: data, step: {choicePerson: false, displayChart: true}});
    };

    const shouldDisplayGraph = () => {
        return data.step.displayChart;
    };

    const shouldDisplayChoice = () => {
        return data.step.choicePerson;
    };


    return (
        <ModalProvider>
            <div className="App" style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                flexDirection: "column"
            }}>
                <div style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0
                }}>
                    <Navbar style={{backgroundColor: "#3f3f44"}} expand="lg">
                        <Navbar.Brand style={{color: "#ffffff"}}>Généalogie</Navbar.Brand>
                        <SearchForm onSubmit={handleSubmit} />
                    </Navbar>
                    <div style={{
                        backgroundColor: "#cceabb",
                        padding: "35px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <TopSearch />
                    </div>
                    <Container fluid style={{
                        flexGrow: 1,
                        overflow: "auto",
                        minHeight: 1
                    }}>
                        {shouldDisplayChoice() ? <MemoizedPersonList onClick={handleChoosePerson} data={data.personList} />  : null}
                        {shouldDisplayGraph() ?
                            <div>
                                <MemoizedOrgchart tree={data.data} NodeComponent={MyNodeComponent} />
                                <ModalNode />
                            </div>
                            : null}
                    </Container>
                </div>
            </div>
        </ModalProvider>
    );
}



function ModalNode() {
    const {data, closeModal} = useModal();

    function getDeathPositionUrlMap(deathPosition) {
        let str = deathPosition.replace('Point(', '');
        str = str.replace(')', '');
        const positionArray = str.split(' ');
        return `https://www.google.com/maps/search/?api=1&query=${positionArray[1]},${positionArray[0]}`;
    }

    return (
        <Modal show={data.show} onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>{data.node.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row style={{justifyContent: "center"}}>
                    <Image style={{height: "300px"}} src={data.node.image ? data.node.image : NoImage} rounded />
                </Row>
                <Row style={{justifyContent: "center"}}>
                    <ListGroup>
                        <ListGroup.Item>Genre : {data.node.gender === MaleId ? "Homme" : "Femme"}</ListGroup.Item>
                        {data.node.deathLocation ? <ListGroup.Item>Position de sa mort : <a href={getDeathPositionUrlMap(data.node.deathLocation)}>{data.node.deathLocation}</a></ListGroup.Item> : null}
                    </ListGroup>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={closeModal}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function PersonList(props) {
    const {data, onClick} = props;

    return (
        <Row className="pt-2" style={{justifyContent: "center"}}>
            {data.length > 0 ? data.map((person, index) =>
                <Col xs lg="4" key={index} style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "30px"
                }}>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img style={{height: "300px"}} variant="top" src={person.image} />
                        <Card.Body>
                            <Card.Title>{person.name}</Card.Title>
                            <Card.Text>{person.description}</Card.Text>
                            <Button variant="dark" onClick={() => onClick(person)}>Select</Button>
                        </Card.Body>
                    </Card>
                </Col>
            ) : <span>Not Found</span>}
        </Row>
    )
}

export default App;
