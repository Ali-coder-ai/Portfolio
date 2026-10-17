import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <section className="landing-section" id="landingDiv" aria-label="Introduction">
        <div className="landing-container">
          <div className="landing-intro">
            <p className="landing-intro-greeting">Hello! I'm</p>
            <h1>
              MUHAMMAD
              <br />
              <span>ALI</span>
            </h1>
          </div>
          <div className="landing-info" aria-label="Role">
            <p className="landing-info-role">Software</p>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Developer</div>
              <div className="landing-h2-2">Engineer</div>
            </h2>
            <h2 className="landing-info-h2-sub">
              <div className="landing-h2-info">Designer</div>
              <div className="landing-h2-info-1">Problem Solver</div>
            </h2>
          </div>
        </div>
        {children}
      </section>
    </>
  );
};

export default Landing;
