import "./styles/About.css";

const About = () => {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="about-me">
        <h2 className="title" id="about-heading">About Me</h2>
        <p className="para">
          I am Muhammad Ali, a Software Engineering student with a strong interest
          in building reliable, user-focused digital experiences. I enjoy
          designing and developing software that combines clean logic, efficient
          problem-solving, and a polished user interface.
        </p>
        <p className="para">
          My foundation includes Java, Python, C++, JavaScript, HTML, CSS,
          Node.js, databases, DSA, OOP, and UI/UX design. I am passionate about
          continuous learning, teamwork, and turning ideas into practical,
          scalable solutions.
        </p>
      </div>
    </section>
  );
};

export default About;
