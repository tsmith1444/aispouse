import React, { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState('profile');
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');

  console.log('RENDER STEP:', step);

  const renderProfileForm = () => (
    <div className="profile-form">
      <h2>Choose Your AI Spouse</h2>
      <form>
        <div className="form-group">
          <label>Your Spouse's Name</label>
          <input
            type="text"
            placeholder="e.g. Luna"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Select a Personality</label>
          <div className="preset-selector">
            {[
              { label: 'Luna', personality: 'Romantic' },
              { label: 'Sage', personality: 'Supportive' },
              { label: 'Maya', personality: 'Funny' },
              { label: 'Nova', personality: 'Driven' },
              { label: 'Bliss', personality: 'Soothing' }
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`preset-button ${personality === option.personality ? 'selected' : ''}`}
                onClick={() => {
                  setPersonality(option.personality);
                  setName(option.label);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p><strong>Selected:</strong> {name} ({personality})</p>
      </form>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Spouse Debug Mode</h1>
      </header>
      <main>
        {step === 'profile' && renderProfileForm()}
      </main>
      <footer>
        <p>Test footer. If you see this, React is working.</p>
      </footer>
    </div>
  );
}

export default App;
