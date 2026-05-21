import { useMemo, useState } from 'react';

const ALLOWED_USERS = {
  'gabriellucpk@gmail.com': {
    name: 'Gabriel',
    email: 'gabriellucpk@gmail.com',
  },
  'diegogomezgonza9@gmail.com': {
    name: 'Diego',
    email: 'diegogomezgonza9@gmail.com',
  },
};

function App() {
  const [email, setEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const matchedUser = ALLOWED_USERS[normalizedEmail];

    if (!matchedUser) {
      setCurrentUser(null);
      setError('Correo no autorizado. Solo dos usuarios pueden iniciar sesión.');
      return;
    }

    setCurrentUser(matchedUser);
    setError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setError('');
  };

  if (currentUser) {
    return (
      <main className="container">
        <section className="card">
          <h1>Sesión iniciada</h1>
          <p>
            Bienvenido, <strong>{currentUser.name}</strong>.
          </p>
          <p>Correo: {currentUser.email}</p>
          <button type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Iniciar sesión</h1>
        <p>Solo se permiten dos correos autorizados.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu-correo@gmail.com"
            required
          />
          <button type="submit">Entrar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}

export default App;
