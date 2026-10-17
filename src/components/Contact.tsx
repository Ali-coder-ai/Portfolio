import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <section className="contact-section section-container" id="contact" aria-labelledby="contact-heading">
      <div className="contact-container">
        <h2 id="contact-heading">Contact</h2>
        <div className="contact-flex">
          <div className="contact-box">
            <h3>Email</h3>
            <p>
              <a
                href="mailto:muhammad.ali992283@gmail.com"
                data-cursor="disable"
              >
                muhammad.ali992283@gmail.com
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h3>Social</h3>
            <a
              href="https://github.com/Ali-coder-ai"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
              aria-label="Muhammad Ali on GitHub"
            >
              GitHub <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com/in/muhammad-ali-sde"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
              aria-label="Muhammad Ali on LinkedIn"
            >
              LinkedIn <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <p className="contact-credit">
              Designed and Developed <br /> by <span>Muhammad Ali</span>
            </p>
            <h5>
              <MdCopyright /> 2025
            </h5>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
