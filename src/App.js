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


    const handleSubmit = (event) => {
        event.preventDefault();

    }

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
            <OrgChart tree={data} NodeComponent={MyNodeComponent} />
        </main>
    </div>
  );
}

export default App;
