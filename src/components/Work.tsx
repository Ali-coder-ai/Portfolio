import "./styles/Work.css";
import WorkImage from "./WorkImage";

const projects = [
  {
    title: "Currency Converter",
    category: "Frontend Project",
    description:
      "Responsive converter for 150+ currencies with live rates, flags, and one-click swap.",
    tools: "HTML, CSS, JavaScript, REST API, Async/Await",
    link: "https://github.com/Ali-coder-ai/Currency-Convertor",
    image: "/images/currency-convertor.webp.png",
  },
  {
    title: "Rock Paper Scissors Game",
    category: "Interactive Web Game",
    description:
      "Browser-based game with randomized computer moves, live score tracking, and instant result updates.",
    tools: "HTML, CSS, JavaScript, DOM Manipulation",
    link: "https://github.com/Ali-coder-ai/Rock-Paper-Scissor-Game",
    image: "/images/rock-paper-scissor.webp.png",
  },
  {
    title: "Universal Ticket Booking System",
    category: "Java OOP Project",
    description:
      "Booking platform for movies, flights, trains, concerts, sports, and hotels with inventory control and validation.",
    tools: "Java, OOP, Data Structures, Input Validation",
    link: "https://github.com/Ali-coder-ai/Ticket-Booking-System",
    image: "/images/ticket.webp.jpg",
  },
];

const Work = () => {
  return (
    <section className="work-section" id="work" aria-labelledby="work-heading">
      <div className="work-container section-container">
        <h2 id="work-heading">
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map(({ title, category, description, tools, link, image }, index) => (
            <article className="work-box" key={title} aria-label={title}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{String(index + 1).padStart(2, "0")}</h3>
                  <div>
                    <h4>{title}</h4>
                    <p>{category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{description}</p>
                <p>{tools}</p>
                <a href={link} target="_blank" rel="noreferrer">
                  View Project
                </a>
              </div>
              <WorkImage image={image} alt={title} link={link} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
