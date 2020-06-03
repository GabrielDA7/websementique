import React, {useState} from 'react';
import './App.css';

function App() {
    const [error, setError] = useState(null);
    const [input, setInput] = useState('');


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
        </main>
    </div>
  );
}

export default App;
