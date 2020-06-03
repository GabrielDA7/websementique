import React, {useState} from 'react';
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import './App.css';

const MyNodeComponent = ({node}) => {
    return (
        <div className="initechNode">{ node.name }</div>
    );
};

function App() {
    const [error, setError] = useState(null);
    const [input, setInput] = useState('');
    const [personList, setPersonList] = useState([]);

    const [step, setStep] = useState({choose : false, displayChart: false});

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
        console.log(getTree(personList[0]));
    };

    const handleChoosePerson = (person) => {
        console.log(JSON.stringify(person));
    };

  return (
    <div className="App">
      <header className="App-header">
        Généalogie
      </header>
        <main>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}/>
                <button type="submit">Search</button>
            </form>
            {personList ? <PersonList onClick={handleChoosePerson} data={personList} /> : null}
            {step.displayChart ? <OrgChart tree={data} NodeComponent={MyNodeComponent} /> : null}
        </main>
    </div>
  );
}

function PersonList(props) {
    const {data, onClick} = props;

    return (
        data.map(person => {
            return (
                <a href="#" onClick={(e) => {
                    e.preventDefault();
                    onClick(person)}
                }>
                  <div className="person-card">
                      <div className="row">
                          <img src={person.image}/>
                      </div>
                      <div className="row">
                          {person.name}
                      </div>
                  </div>
                </a>
            );
        })
    )
}

export default App;
