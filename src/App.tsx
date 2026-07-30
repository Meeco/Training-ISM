import { useEffect, useState } from "react";
import TrainingAwareness from "./TrainingAwareness";
import TrainingSDLC from "./TrainingSDLC";
import "./App.css";

type TrainingView = "home" | "awareness" | "sdlc";

function getTrainingView(): TrainingView {
  const view = window.location.hash.slice(1);

  if (view === "awareness" || view === "sdlc") {
    return view;
  }

  return "home";
}

function App(): React.JSX.Element {
  const [view, setView] = useState<TrainingView>(getTrainingView);

  useEffect(() => {
    const handleHashChange = () => setView(getTrainingView());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (view === "awareness") {
    return (
      <div className="training-view">
        <a className="training-home-link" href="#home">
          ← All training
        </a>
        <TrainingAwareness />
      </div>
    );
  }

  if (view === "sdlc") {
    return (
      <div className="training-view">
        <a className="training-home-link" href="#home">
          ← All training
        </a>
        <TrainingSDLC />
      </div>
    );
  }

  return (
    <main className="training-home">
      <section className="training-selector" aria-labelledby="training-title">
        <p className="training-eyebrow">Meeco learning portal</p>
        <h1 id="training-title">Information Security Training</h1>
        <p className="training-intro">Choose the training program that best matches your role.</p>

        <div className="training-options">
          <a className="training-card" href="#awareness">
            <span className="training-card-number">01</span>
            <span className="training-card-content">
              <strong>General Awareness Training</strong>
              <span>
                Security, privacy, phishing, account safety, AI use, and incident reporting.
              </span>
            </span>
            <span className="training-card-arrow" aria-hidden="true">
              →
            </span>
          </a>

          <a className="training-card" href="#sdlc">
            <span className="training-card-number">02</span>
            <span className="training-card-content">
              <strong>Software Development Security</strong>
              <span>
                Secure development, OWASP risks, privacy, AI governance, and incident escalation.
              </span>
            </span>
            <span className="training-card-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}

export default App;
