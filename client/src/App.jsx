import { useEffect, useMemo, useState } from "react";
import { places as bundledPlaces } from "../../shared/places.js";

const STORAGE_KEY = "ntr-ai-yatra-mern-v1";
const interests = ["Heritage", "Nature", "Rivers", "Culture", "Food"];
const views = { home: "Discover", planner: "Trip planner", saved: "Saved places", guide: "AI local guide", safety: "Travel safety" };
const bundledPlacesById = new Map(bundledPlaces.map(place => [place.id, place]));

function getPhoto(place) {
  const fallback = bundledPlacesById.get(place.id);
  return {
    url: place.photoUrl || fallback?.photoUrl,
    credit: place.photoCredit || fallback?.photoCredit,
    source: place.photoSource || fallback?.photoSource,
    license: place.photoLicense || fallback?.photoLicense
  };
}

function readPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (error) {
    console.warn("Could not read saved browser data.", error);
    return {};
  }
}

function PlaceCard({ place, saved, onSave, onOpen }) {
  const photo = getPhoto(place);
  return (
    <article className="place-card">
      <div className={`place-art ${place.scene}`}>
        {photo.url && <img className="place-photo" src={photo.url} alt={`${place.name} in ${place.area}`} loading="lazy" />}
        <span className="scene-sun" aria-hidden="true" />
        <span className="scene-icon" aria-hidden="true">{place.icon}</span>
        <span className="art-caption">{place.caption}</span>
        {photo.source && <a className="photo-credit" href={photo.source} target="_blank" rel="noopener noreferrer" aria-label={`Photo by ${photo.credit}, ${photo.license}. View source on Wikimedia Commons`}>Photo: {photo.credit}</a>}
        <button className={`heart-button ${saved ? "saved" : ""}`} onClick={() => onSave(place.id)} aria-label={`${saved ? "Remove" : "Save"} ${place.name}`} aria-pressed={saved}>{saved ? "♥" : "♡"}</button>
      </div>
      <div className="card-content">
        <div className="card-topline"><span className="category-label">{place.category}</span><span className="demo-label">DEMO NOTES</span></div>
        <h3>{place.name}</h3><p>{place.note}</p>
        <div className="card-footer"><div className="card-tags">{place.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><button className="card-open" onClick={() => onOpen(place)}>Explore ↗</button></div>
      </div>
    </article>
  );
}

function PlaceDialog({ place, onClose, onAdd, saved, onSave }) {
  useEffect(() => {
    if (!place) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [place, onClose]);

  if (!place) return null;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.area}, Andhra Pradesh`)}`;
  const photo = getPhoto(place);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="place-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close place details">×</button>
        <div className={`place-art ${place.scene}`}>{photo.url && <img className="place-photo" src={photo.url} alt={`${place.name} in ${place.area}`} />}<span className="scene-sun" aria-hidden="true" /><span className="scene-icon" aria-hidden="true">{place.icon}</span><span className="art-caption">{place.caption}</span>{photo.source && <a className="photo-credit" href={photo.source} target="_blank" rel="noopener noreferrer" aria-label={`Photo by ${photo.credit}, ${photo.license}. View source on Wikimedia Commons`}>Photo: {photo.credit}</a>}</div>
        <div className="eyebrow muted-eyebrow">{place.category} · {place.area}</div>
        <h2 id="dialog-title">{place.name}</h2><p>{place.note}</p>
        <div className="dialog-detail-note"><strong>Demo content:</strong> Visitor details, hours and historical context need authoritative local review. Approximate visit time: {place.duration} minutes.</div>
        <div className="dialog-actions"><button className="button button-dark" onClick={() => onAdd(place.id)}>Add to my day <span>＋</span></button><button className="button button-light" onClick={() => onSave(place.id)}>{saved ? "♥ Saved" : "♡ Save place"}</button><a className="button button-map" href={mapUrl} target="_blank" rel="noopener noreferrer">Open map ↗</a></div>
      </section>
    </div>
  );
}

function App() {
  const persisted = useMemo(readPreferences, []);
  const [places, setPlaces] = useState(bundledPlaces);
  const [catalogueSource, setCatalogueSource] = useState("Bundled demo catalogue");
  const [apiStatus, setApiStatus] = useState("Checking API");
  const [view, setView] = useState("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState(() => new Set((persisted.savedIds || []).filter(id => bundledPlaces.some(place => place.id === id))));
  const [duration, setDuration] = useState(persisted.duration === 4 ? 4 : 8);
  const [pace, setPace] = useState(persisted.pace || "balanced");
  const [startArea, setStartArea] = useState(persisted.startArea || "");
  const [selectedInterests, setSelectedInterests] = useState(persisted.interests || ["Heritage"]);
  const [itinerary, setItinerary] = useState((persisted.itinerary || []).filter(id => bundledPlaces.some(place => place.id === id)));
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);
  const [chat, setChat] = useState([{ role: "guide", text: "Namaskaram! Ask me about a place in our demo notes. Answers are based on the bundled catalogue, not a connected AI service." }]);
  const [question, setQuestion] = useState("");
  const [photo, setPhoto] = useState("");
  const [storyPlaceId, setStoryPlaceId] = useState(bundledPlaces[0].id);
  const [story, setStory] = useState("");
  const [shareStatus, setShareStatus] = useState("No location has been requested or shared.");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    let active = true;
    fetch("/api/places")
      .then(response => {
        if (!response.ok) throw new Error(`Catalogue request failed (${response.status}).`);
        return response.json();
      })
      .then(data => {
        if (!active || !Array.isArray(data.places)) return;
        setPlaces(data.places);
        setCatalogueSource(data.source === "mongodb" ? "MongoDB catalogue" : "Demo seed catalogue");
        setStoryPlaceId(current => data.places.some(place => place.id === current) ? current : data.places[0]?.id || "");
        setApiStatus("API connected");
      })
      .catch(error => {
        console.warn("Using bundled demo places because the API is unavailable.", error);
        if (active) setApiStatus("Offline demo");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          savedIds: [...savedIds], itinerary, duration, pace, startArea, interests: selectedInterests
        }));
      } catch (error) {
        console.error("Could not save trip data in this browser.", error);
        notify("Browser storage is unavailable; changes may not persist.");
      }
    };
    save();
  }, [savedIds, itinerary, duration, pace, startArea, selectedInterests]);

  useEffect(() => {
    const onlineHandler = () => setOnline(navigator.onLine);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", onlineHandler);
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", onlineHandler);
    };
  }, []);

  useEffect(() => () => {
    if (toastTimer) window.clearTimeout(toastTimer);
  }, [toastTimer]);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("/service-worker.js", { updateViaCache: "none" })
        .catch(error => console.error("Offline app shell could not be registered.", error));
    }
  }, []);

  function notify(message) {
    setToast(message);
    setToastTimer(previous => {
      if (previous) window.clearTimeout(previous);
      return window.setTimeout(() => setToast(""), 2800);
    });
  }

  function toggleSaved(id) {
    setSavedIds(previous => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
        notify("Removed from your saved places.");
      } else {
        next.add(id);
        notify("Saved for your next NTR day.");
      }
      return next;
    });
  }

  function navigate(nextView) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addStop(id) {
    setItinerary(previous => previous.includes(id) ? previous : [...previous, id]);
    setSelectedPlace(null);
    navigate("planner");
    notify("Added to your editable itinerary.");
  }

  const visiblePlaces = places.filter(place => {
    const categoryMatches = category === "All" || place.category === category || place.interests.includes(category);
    const haystack = [place.name, place.area, place.category, ...place.tags, ...place.interests, place.note].join(" ").toLowerCase();
    return categoryMatches && haystack.includes(search.trim().toLowerCase());
  });
  const savedPlaces = places.filter(place => savedIds.has(place.id));
  const chosenPlaces = itinerary.map(id => places.find(place => place.id === id)).filter(Boolean);

  function createPlan(event) {
    event.preventDefault();
    if (!selectedInterests.length) return notify("Choose at least one interest to shape your day.");
    const targetCount = pace === "relaxed" ? 2 : pace === "packed" ? 5 : duration === 4 ? 2 : 4;
    const candidates = places
      .map((place, index) => ({ place, index, score: place.interests.reduce((score, item) => score + Number(selectedInterests.includes(item)), 0) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index);
    let elapsed = 0;
    const selected = [];
    for (const { place } of candidates) {
      if (selected.length === targetCount) break;
      const travel = selected.length ? place.travel : 0;
      if (elapsed + travel + place.duration <= duration * 60) {
        elapsed += travel + place.duration;
        selected.push(place.id);
      }
    }
    if (!selected.length) return notify("Those preferences do not fit. Try another interest or more time.");
    setItinerary(selected);
    notify("Your editable demo itinerary is ready.");
  }

  function answer(questionText) {
    const normalized = questionText.toLowerCase();
    const match = places.find(place => normalized.includes(place.name.toLowerCase()) ||
      (place.id.startsWith("kondapalli") && normalized.includes("kondapalli")) ||
      (place.id === "prakasham-barrage" && /river|barrage|waterfront/.test(normalized)) ||
      (place.id === "local-food" && /food|eat|flavour/.test(normalized)));
    if (match) return match.guide;
    if (/half|few hours|4 hour/.test(normalized)) return "For a shorter visit, choose one or two interests. Use the planner to make an editable route; timings and access need local checking.";
    if (/river|near/.test(normalized)) return "The demo catalogue includes Prakasam Barrage and Bhavani Island as river-related ideas. Check current local access before planning.";
    return "I don't have a verified answer in this demo. Ask about a listed place or check an authoritative local source; I won't guess at hours, prices, or history.";
  }

  function submitQuestion(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setChat(previous => [...previous, { role: "user", text: question.trim() }, { role: "guide", text: answer(question.trim()) }]);
    setQuestion("");
  }

  function generateStory() {
    const place = places.find(item => item.id === storyPlaceId);
    if (!place) return notify("Choose a supported place first.");
    setStory(place.story);
  }

  function createItineraryMarkup() {
    if (!chosenPlaces.length) return <div className="itinerary-placeholder"><div className="placeholder-art">✧</div><h3>Your day is waiting</h3><p>Choose a few interests and we'll shape a local route around them.</p><div className="mini-route"><span /><span /><span /></div></div>;
    let clock = 9 * 60;
    let visits = 0;
    let travel = 0;
    return <>
      <div className="itinerary-head"><div><div className="eyebrow">YOUR {duration}-HOUR JOURNEY</div><h2>A day shaped around you</h2><p>{startArea || "Starting area flexible"} · Adjust your stops anytime</p></div><button className="save-plan" onClick={() => notify("Your plan is saved on this device.")}>♡ Saved</button></div>
      <div className="itinerary-summary"><span>◷ {duration} hr window</span><span>✦ {chosenPlaces.length} stops</span></div>
      <div className="route-list">{chosenPlaces.map((place, index) => {
        if (index) { clock += place.travel; travel += place.travel; }
        const arrival = `${(Math.floor(clock / 60) % 12) || 12}:${String(clock % 60).padStart(2, "0")} ${clock >= 720 ? "PM" : "AM"}`;
        clock += place.duration;
        visits += place.duration;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.area}, Andhra Pradesh`)}`;
        return <article className="route-stop" key={`${place.id}-${index}`}><div className="stop-marker">{String(index + 1).padStart(2, "0")}</div><div className="stop-main"><span className="stop-time">{arrival}</span><h3>{place.name}</h3><p>{place.note}</p><div className="stop-controls"><button onClick={() => moveStop(index, -1)} disabled={index === 0}>↑ Earlier</button><button onClick={() => moveStop(index, 1)} disabled={index === chosenPlaces.length - 1}>↓ Later</button><button onClick={() => setItinerary(previous => previous.filter((_, current) => current !== index))}>Remove</button><a href={mapUrl} target="_blank" rel="noopener noreferrer">Map ↗</a></div></div><span className="stop-duration">{place.duration} min</span></article>;
      })}</div>
      <div className="route-total"><span>Estimated visits + travel</span><strong>{Math.floor((visits + travel) / 60) ? `${Math.floor((visits + travel) / 60)} hr ` : ""}{(visits + travel) % 60} min</strong></div>
      <p className="route-note">Illustrative order and times, not live routing or verified opening hours. Check current local information before travel.</p>
    </>;
  }

  function moveStop(index, direction) {
    setItinerary(previous => {
      const next = [...previous];
      const destination = index + direction;
      if (destination < 0 || destination >= next.length) return previous;
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  async function shareLocation() {
    if (!navigator.geolocation) return setShareStatus("Location access is not available. Nothing was shared.");
    setShareStatus("Waiting for your browser's location permission…");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const mapUrl = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
      try {
        if (navigator.share) {
          await navigator.share({ title: "My location", text: "My current location (shared by me)", url: mapUrl });
          setShareStatus("Your device completed the share action. This demo does not track delivery.");
        } else {
          await navigator.clipboard.writeText(mapUrl);
          setShareStatus("Location link copied. It has not been sent; share it only where you choose.");
        }
      } catch (error) {
        if (error.name === "AbortError") setShareStatus("Sharing cancelled. Your location was not shared.");
        else {
          console.error("Location sharing failed.", error);
          setShareStatus("Could not share the location. Nothing was sent.");
        }
      }
    }, error => {
      setShareStatus(error.code === 1 ? "Permission denied. Nothing was shared." : "Could not get your location. Nothing was shared.");
    }, { maximumAge: 0, timeout: 10000 });
  }

  function toggleInterest(interest) {
    setSelectedInterests(previous => previous.includes(interest) ? previous.filter(item => item !== interest) : [...previous, interest]);
  }

  const navButton = (id, label, icon, extra = null) => <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => navigate(id)}><span aria-hidden="true">{icon}</span>{label}{extra}</button>;

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); navigate("home"); }} aria-label="NTR AI Yatra home"><img className="brand-mark" src="/assets/ntr-ai-yatra-logo.png" alt="" /><span><strong>NTR AI Yatra</strong><small>YOUR LOCAL JOURNEY</small></span></a>
      <p className="nav-label">YOUR JOURNEY</p>
      <nav className="main-nav">{navButton("home", "Discover", "⌂")}{navButton("planner", "Trip planner", "✦")}{navButton("saved", "Saved places", "♡", <span className="saved-count">{savedIds.size}</span>)}{navButton("guide", "AI local guide", "◉")}{navButton("safety", "Travel safety", "+")}</nav>
      <div className="sidebar-spacer" />
      <button className="safety-link" onClick={() => navigate("safety")}><span className="safety-icon">+</span><span><strong>Travel safety</strong><small>Contacts & location sharing</small></span><span aria-hidden="true">›</span></button>
      <div className="sidebar-note"><span className="status-dot" /> Demo experience <span>·</span> English</div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="mobile-brand"><img className="brand-mark" src="/assets/ntr-ai-yatra-logo.png" alt="" /> NTR AI Yatra</div><div className="breadcrumb">NTR District, Andhra Pradesh <span>/</span> <strong>{views[view]}</strong></div><div className="top-actions"><span className={`offline-status ${online ? "" : "offline"}`}><i /> <span>{online ? apiStatus : "Offline"}</span></span><span className="avatar" aria-label="Guest profile">G</span></div></header>
      <div className="content-wrap">
        {view === "home" && <section className="view active">
          <section className="hero"><div className="hero-content"><div className="eyebrow"><span className="eyebrow-dot" /> NTR DISTRICT · ANDHRA PRADESH</div><h1>Make a little time<br />feel like <em>a whole journey.</em></h1><p>Find your kind of Vijayawada. Build a thoughtful day, then discover the stories behind every stop.</p><div className="hero-actions"><button className="button button-light" onClick={() => navigate("planner")}>Plan my day <span>↗</span></button><button className="text-button" onClick={() => document.querySelector("#places")?.scrollIntoView({ behavior: "smooth" })}>Explore places <span>↓</span></button></div><div className="hero-meta"><span>✦</span> PERSONAL TO YOU <b>·</b> ROOTED IN NTR</div></div><div className="hero-art" aria-label="Illustration of the Krishna river and a temple"><div className="sun" /><div className="distant-hills" /><div className="temple"><span className="temple-top" /><span className="temple-tower" /><span className="temple-base" /></div><div className="river" /><div className="river-glow" /><div className="art-label"><span className="pin">●</span><span><b>Vijayawada</b><small>RIVER, CULTURE & CONNECTION</small></span></div></div><div className="hero-index"><b>01</b><span>—</span> DISCOVER THE REAL NTR</div></section>
          <section className="quick-strip"><div className="quick-intro"><span className="sparkle">✳</span><span><strong>Your day, your way</strong><small>What are you in the mood for?</small></span></div><div className="quick-chips">{["Heritage", "Nature", "Food", "Rivers"].map(item => <button key={item} className={`interest-chip ${selectedInterests.includes(item) ? "selected" : ""}`} onClick={() => toggleInterest(item)}>{item}</button>)}</div><button className="quick-plan" onClick={() => navigate("planner")}>Build a day <span>→</span></button></section>
          <section className="section-block" id="places"><div className="section-heading"><div><div className="eyebrow muted-eyebrow">A GOOD PLACE TO BEGIN</div><h2>Places with a point of view</h2></div><button className="plain-link" onClick={() => navigate("planner")}>Make me a route <span>↗</span></button></div>
            <div className="filter-row">{["All", "Heritage", "Nature", "Rivers", "Culture"].map(item => <button key={item} className={`filter-pill ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item === "All" ? "All places" : item}{item === "All" && <span>{places.length}</span>}</button>)}</div>
            <div className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search places, experiences, or interests" aria-label="Search places" /></div>
            <div className="place-grid">{visiblePlaces.map(place => <PlaceCard key={place.id} place={place} saved={savedIds.has(place.id)} onSave={toggleSaved} onOpen={setSelectedPlace} />)}</div>
            {!visiblePlaces.length && <div className="empty-state">No places match that search. Try another name or category.</div>}
          </section>
          <section className="story-banner"><div className="story-icon">✧</div><div><div className="eyebrow">THE STORY BEHIND THE SHOT</div><h2>A photo can be a way in.</h2><p>Choose a known place and explore a story grounded in its local notes.</p></div><button className="button button-outline-light" onClick={() => navigate("guide")}>Meet your guide <span>→</span></button></section>
          <footer className="site-footer"><span>Designed for curious journeys.</span><span>{catalogueSource} · verify content before public use</span></footer>
        </section>}

        {view === "planner" && <section className="view active"><div className="page-heading"><div><div className="eyebrow muted-eyebrow">YOUR DAY, THOUGHTFULLY PLANNED</div><h1>Build your NTR day</h1><p>Tell us what matters. Your plan stays editable, always.</p></div><span className="page-stamp">✦ PERSONAL TRIP PLANNER</span></div>
          <div className="planner-layout"><form className="planner-form" onSubmit={createPlan}>
            <div className="form-section"><div className="form-number">01</div><div className="form-content"><h3>How much time do you have?</h3><div className="segmented">{[4, 8].map(item => <button type="button" key={item} className={`segment ${duration === item ? "active" : ""}`} onClick={() => setDuration(item)}>{item === 4 ? "A few hours" : "One day"}<small>~{item} hrs</small></button>)}</div></div></div>
            <div className="form-section"><div className="form-number">02</div><div className="form-content"><h3>What sounds like you?</h3><p className="form-hint">Choose all that fit.</p><div className="choice-grid">{interests.map((item, index) => <label className="choice" key={item}><input type="checkbox" checked={selectedInterests.includes(item)} onChange={() => toggleInterest(item)} /><span>{["◈", "♧", "≈", "✺", "⌁"][index]}</span>{item === "Food" ? "Local food" : item}</label>)}</div></div></div>
            <div className="form-section"><div className="form-number">03</div><div className="form-content"><h3>Set your pace</h3><div className="select-wrap"><select value={pace} onChange={event => setPace(event.target.value)}><option value="balanced">A little of everything</option><option value="relaxed">Slow & unhurried</option><option value="packed">See as much as I can</option></select><span>⌄</span></div></div></div>
            <div className="form-section"><div className="form-number">04</div><div className="form-content"><h3>Starting area <span className="optional">OPTIONAL</span></h3><div className="select-wrap"><select value={startArea} onChange={event => setStartArea(event.target.value)}><option value="">I'll choose later</option><option>Vijayawada city</option><option>Near Kanaka Durga Temple</option><option>Near Prakasam Barrage</option></select><span>⌄</span></div><p className="form-hint">No precise location is collected for planning.</p></div></div>
            <button className="button button-dark generate-button" type="submit">Create my itinerary <span>✦</span></button><p className="disclaimer">Suggestions and travel times are illustrative demo estimates, not live routing.</p>
          </form><div className="itinerary-panel">{createItineraryMarkup()}</div></div>
        </section>}

        {view === "saved" && <section className="view active"><div className="page-heading"><div><div className="eyebrow muted-eyebrow">YOUR LITTLE LIST OF MAYBES</div><h1>Saved for later</h1><p>Keep the places you want to come back to.</p></div></div>{savedPlaces.length ? <div className="place-grid">{savedPlaces.map(place => <PlaceCard key={place.id} place={place} saved onSave={toggleSaved} onOpen={setSelectedPlace} />)}</div> : <div className="empty-state"><div className="empty-illustration">♡</div><h3>A few places will look good here.</h3><p>Tap the heart on any place to keep it close.</p><button className="button button-dark" onClick={() => navigate("home")}>Find a place</button></div>}</section>}

        {view === "guide" && <section className="view active"><div className="page-heading"><div><div className="eyebrow muted-eyebrow">A LITTLE MORE THAN A MAP</div><h1>Stories make places stay.</h1><p>Explore local demo notes or create a story for a supported place.</p></div></div><div className="guide-layout">
          <section className="guide-card"><div className="guide-card-head"><div className="guide-avatar">✦</div><div><strong>Your NTR local guide</strong><small><span className="status-dot" /> {catalogueSource} · no live AI</small></div><span className="demo-tag">DEMO MODE</span></div>
            <div className="chat-messages">{chat.map((item, index) => <div className={`chat-message ${item.role === "user" ? "user-message" : "guide-message"}`} key={`${index}-${item.role}`}><span className="reply-copy">{item.text}</span>{item.role === "guide" && <button className="speak-button" onClick={() => { if (!("speechSynthesis" in window)) return notify("Read-aloud is not available in this browser."); window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(item.text); utterance.lang = "en-IN"; window.speechSynthesis.speak(utterance); }}>◖ Listen</button>}</div>)}</div>
            <div className="prompt-chips">{["What can I see near the river?", "Tell me about Kondapalli", "I have half a day"].map(item => <button className="prompt-chip" key={item} onClick={() => setChat(previous => [...previous, { role: "user", text: item }, { role: "guide", text: answer(item) }])}>{item}</button>)}</div>
            <form className="chat-form" onSubmit={submitQuestion}><label className="sr-only" htmlFor="chat-input">Ask the local guide</label><input id="chat-input" value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about a supported place…" /><button aria-label="Send message" type="submit">↑</button></form><p className="grounding-note">Demo responses use bundled place notes, not a live AI model. All destination content needs source review.</p>
          </section>
          <section className="photo-card"><div className="eyebrow muted-eyebrow">AI PHOTO STORYTELLER · SHOWCASE</div><h2>Give your photo a little context.</h2><p>Select a photo for a local preview and choose a supported place. The image is not uploaded or analyzed.</p>
            <label className="upload-zone"><span className="upload-symbol">＋</span><strong>Choose a photo <span>(optional)</span></strong><small>JPG, PNG · stays in this browser</small><input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) return notify("Please select an image file."); setPhoto(URL.createObjectURL(file)); }} /></label>
            {photo && <div className="photo-preview"><img src={photo} alt="Local preview of your selected photo" /><button onClick={() => { URL.revokeObjectURL(photo); setPhoto(""); }} aria-label="Remove photo">×</button></div>}
            <label className="field-label" htmlFor="story-place">Which supported place is this?</label><select id="story-place" value={storyPlaceId} onChange={event => { setStoryPlaceId(event.target.value); setStory(""); }}>{places.map(place => <option key={place.id} value={place.id}>{place.name} · {place.category}</option>)}</select>
            <button className="button button-dark storyteller-button" onClick={generateStory}>Create a place story <span>✧</span></button>{story && <div className="story-result" aria-live="polite"><div className="eyebrow">A DEMO PHOTO STORY</div><h3>A moment from your journey</h3><p>{story}</p><p className="story-caveat">Creative demo text, not historical information. Your photo was not uploaded or analyzed.</p></div>}
          </section>
        </div></section>}

        {view === "safety" && <section className="view active"><div className="page-heading"><div><div className="eyebrow muted-eyebrow">A CLEAR PLAN HELPS YOU FEEL READY</div><h1>Travel safety</h1><p>Helpful actions should be clear, verified, and always in your hands.</p></div><span className="safety-badge">CONTACTS NOT CONFIGURED</span></div><div className="safety-layout">
          <section className="safety-card"><div className="safety-card-top"><div className="safety-big-icon">+</div><div><h2>Need help?</h2><p>This prototype has no verified local emergency numbers configured.</p></div></div><div className="contact-list">{["Police", "Ambulance & medical", "Women, children & lost property"].map(label => <div className="contact-row" key={label}><span className="contact-icon">✳</span><span><strong>{label}</strong><small>Official local contact not configured</small></span><span className="contact-state">NOT VERIFIED</span></div>)}</div><div className="safety-warning">For immediate danger, use your device to contact local emergency services. Do not rely on this demo.</div></section>
          <section className="share-card"><div className="share-illustration">⌖</div><div className="eyebrow muted-eyebrow">YOU ARE IN CONTROL</div><h2>Share your location</h2><p>Your browser location is requested only after you choose to share. Nothing is sent automatically.</p><button className="button button-dark" onClick={shareLocation}>Choose to share my location <span>↗</span></button><p className="share-state" aria-live="polite">{shareStatus}</p><div className="privacy-note"><span>◉</span><span><strong>Private by default</strong><small>This showcase does not store location history.</small></span></div></section>
        </div></section>}
      </div>
    </main>
    {toast && <div className="toast show" role="status" aria-live="polite">{toast}</div>}
    <PlaceDialog place={selectedPlace} onClose={() => setSelectedPlace(null)} onAdd={addStop} saved={selectedPlace ? savedIds.has(selectedPlace.id) : false} onSave={toggleSaved} />
  </div>;
}

export default App;
