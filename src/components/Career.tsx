import "./styles/Career.css";

const Career = () => {
  return (
    <section className="career-section section-container" aria-labelledby="career-heading">
      <div className="career-container">
        <h2 id="career-heading">
          Education <span>&</span>
          <br /> learning journey
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Bachelor of Science in Software Engineering</h4>
                <h5>University of Central Punjab (UCP), Lahore</h5>
              </div>
              <h3>2024 – Present</h3>
            </div>
            <p>
              Building my foundation in software development, system design,
              engineering principles, and practical project execution.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Intermediate (ICS)</h4>
                <h5>Forman Christian College University, Lahore</h5>
              </div>
              <h3>2022 – 2024</h3>
            </div>
            <p>
              Strengthened my academic base in computing fundamentals, logical
              problem-solving, and core programming concepts.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Core Focus</h4>
                <h5>Software Development & Problem Solving</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Working with Java, Python, JavaScript, DSA, OOP, UI/UX design,
              databases, and full-stack fundamentals to build impactful projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Career;
