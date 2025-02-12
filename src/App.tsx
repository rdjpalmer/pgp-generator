import { useReducer } from 'react';
import './App.css';
import * as openpgp from 'openpgp';

interface State {
  name: string;
  email: string;
  publicKey: string;
  privateKey: string;
  revocationCertificate: string;
}

const initialState: State = {
  name: '',
  email: '',
  publicKey: '',
  privateKey: '',
  revocationCertificate: '',
};

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_KEYS'; payload: { publicKey: string; privateKey: string } }
  | { type: 'SET_REVOCATION_CERTIFICATE'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_KEYS':
      return {
        ...state,
        publicKey: action.payload.publicKey,
        privateKey: action.payload.privateKey,
      };
    case 'SET_REVOCATION_CERTIFICATE':
      return { ...state, revocationCertificate: action.payload };
    default:
      return state;
  }
}

export default function KeyGenerator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const generateKeysAndCertificate = async () => {
    const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
      userIDs: [{ name: state.name, email: state.email }],
    });

    dispatch({ type: 'SET_KEYS', payload: { publicKey, privateKey } });
    dispatch({ type: 'SET_REVOCATION_CERTIFICATE', payload: revocationCertificate });
  };

  const download = (filename: string, text: string) => {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const emailPart = state.email ? `-${state.email}` : '';
    const fullFilename = `${filename}-${date}${emailPart}.asc`;

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fullFilename;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={state.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={state.email}
          onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
        />
        <button onClick={generateKeysAndCertificate}>Generate Keys & Certificate</button>
      </div>
      <div>
        <button
          onClick={() => download('public-key', state.publicKey)}
          disabled={!state.publicKey}
        >
          Download Public Key
        </button>
        <button
          onClick={() => download('private-key', state.privateKey)}
          disabled={!state.privateKey}
        >
          Download Private Key
        </button>
        <button
          onClick={() => download('revocation-certificate', state.revocationCertificate)}
          disabled={!state.revocationCertificate}
        >
          Download Revocation Certificate
        </button>
        <button
          onClick={() => download('pgp-keys', `${state.publicKey}\n${state.privateKey}`)}
          disabled={!state.publicKey || !state.privateKey}
        >
          Download Both Keys
        </button>
      </div>
    </div>
  );
}
