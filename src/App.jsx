import { useEffect, useMemo, useState } from 'react';

const ALLOWED_USERS = {
  'gabriellucpk@gmail.com': {
    name: 'Gabriel',
    email: 'gabriellucpk@gmail.com',
    role: 'Game Developer',
  },
  'diegogomezgonza9@gmail.com': {
    name: 'Diego',
    email: 'diegogomezgonza9@gmail.com',
    role: 'Code Developer',
  },
};

const MEETINGS_STORAGE_KEY = 'reaper_meetings_v1';

function App() {
  const [email, setEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    datetime: '',
    participants: [],
  });

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  useEffect(() => {
    const savedMeetings = localStorage.getItem(MEETINGS_STORAGE_KEY);
    if (!savedMeetings) return;

    try {
      const parsedMeetings = JSON.parse(savedMeetings);
      if (Array.isArray(parsedMeetings)) {
        setMeetings(parsedMeetings);
      }
    } catch {
      setMeetings([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
  }, [meetings]);

  const now = new Date();

  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );

  const pastMeetings = sortedMeetings.filter(
    (meeting) => new Date(meeting.datetime).getTime() < now.getTime(),
  );

  const futureMeetings = sortedMeetings.filter(
    (meeting) => new Date(meeting.datetime).getTime() >= now.getTime(),
  );

  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) || null;

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
    setSelectedMeetingId(null);
    setShowCreateForm(false);
  };

  const handleParticipantChange = (targetEmail) => {
    setFormData((prev) => {
      const alreadySelected = prev.participants.includes(targetEmail);
      return {
        ...prev,
        participants: alreadySelected
          ? prev.participants.filter((userEmail) => userEmail !== targetEmail)
          : [...prev.participants, targetEmail],
      };
    });
  };

  const handleCreateMeeting = (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.datetime || formData.participants.length === 0) {
      return;
    }

    const newMeeting = {
      id: crypto.randomUUID(),
      title: formData.title.trim(),
      datetime: formData.datetime,
      participants: formData.participants,
      createdBy: currentUser.email,
    };

    setMeetings((prev) => [...prev, newMeeting]);
    setFormData({ title: '', datetime: '', participants: [] });
    setShowCreateForm(false);
  };

  const formatMeetingDate = (datetime) =>
    new Date(datetime).toLocaleString('es-ES', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

  const renderMeetingItem = (meeting, canNavigate) => (
    <li key={meeting.id} className="meeting-item">
      <button
        type="button"
        className="meeting-link"
        onClick={() => canNavigate && setSelectedMeetingId(meeting.id)}
      >
        <span>{meeting.title}</span>
        <small>{formatMeetingDate(meeting.datetime)}</small>
      </button>
    </li>
  );

  if (currentUser) {
    return (
      <main className="page">
        <header className="header">
          <h1>REAPER</h1>
        </header>

        <section className="card">
          <h2>Sesión iniciada</h2>
          <p>
            Bienvenido, <strong>{currentUser.name}</strong>.
          </p>
          <p className="role">{currentUser.role}</p>
          <p>Correo: {currentUser.email}</p>

          <section className="meetings">
            <div className="meetings-title-row">
              <h3>Meetings</h3>
              <button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
                +
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateMeeting} className="meeting-form">
                <label htmlFor="meeting-title">Título del meet</label>
                <input
                  id="meeting-title"
                  type="text"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />

                <label htmlFor="meeting-datetime">Fecha y hora</label>
                <input
                  id="meeting-datetime"
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, datetime: event.target.value }))
                  }
                  required
                />

                <fieldset>
                  <legend>Participantes (correos de la página)</legend>
                  {Object.keys(ALLOWED_USERS).map((allowedEmail) => (
                    <label key={allowedEmail} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(allowedEmail)}
                        onChange={() => handleParticipantChange(allowedEmail)}
                      />
                      {allowedEmail}
                    </label>
                  ))}
                </fieldset>

                <button type="submit">Crear meet</button>
              </form>
            )}

            <div className="meeting-columns">
              <div>
                <h4>Reuniones pasadas</h4>
                <ul>
                  {pastMeetings.length > 0 ? pastMeetings.map((meeting) => renderMeetingItem(meeting, false)) : <li>No hay reuniones pasadas.</li>}
                </ul>
              </div>

              <div>
                <h4>Reuniones futuras</h4>
                <ul>
                  {futureMeetings.length > 0 ? futureMeetings.map((meeting) => renderMeetingItem(meeting, true)) : <li>No hay reuniones futuras.</li>}
                </ul>
              </div>
            </div>

            {selectedMeeting && (
              <article className="meeting-detail">
                <h4>Meet seleccionado</h4>
                <p>
                  <strong>{selectedMeeting.title}</strong>
                </p>
                <p>{formatMeetingDate(selectedMeeting.datetime)}</p>
                <p>Creado por: {selectedMeeting.createdBy}</p>
                <p>Participantes: {selectedMeeting.participants.join(', ')}</p>
              </article>
            )}
          </section>

          <button type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <h1>REAPER</h1>
      </header>

      <section className="card">
        <h2>Iniciar sesión</h2>
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
