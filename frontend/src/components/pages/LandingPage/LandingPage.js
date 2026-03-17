import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar/Navbar';
import { FiSearch, FiUsers, FiShield, FiZap, FiLock, FiBarChart2 } from 'react-icons/fi';
import './LandingPage.css';
import { initializeTheme } from '../../../services/themeUtils';

function LandingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState(null);

  useEffect(() => {
    initializeTheme();
  }, []);
  
  const laptopDetails = {
    1: {
      title: "Ultralight Silver Laptop",
      description: "A slim silver notebook featuring a minimalist keyboard layout and a vibrant, colorful display.",
      image: "/figures/landingpage_showcase_1.png"
    },
    2: {
      title: "Slim Silver Productivity Laptop",
      description: "A sleek silver notebook with a clean keyboard layout and a bright Windows interface displayed on its screen.",
      image: "/figures/landingpage_showcase_2.png"
    },
    3: {
      title: "RGB Gaming Laptop",
      description: "A black performance-focused notebook featuring a vivid RGB keyboard and a bold, neon-themed display.",
      image: "/figures/landingpage_showcase_3.png"
    }
  };

  const handleShowcaseClick = (laptopId) => {
    setSelectedLaptop(laptopDetails[laptopId]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLaptop(null);
  };

  return (
    <>
      <div className="grid-background"></div>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <div className="bg-shape-3"></div>
      <div className="bg-shape-4"></div>
      <div className="bg-shape-5"></div>
      <div className="bg-shape-6"></div>
      <div className="bg-shape-7"></div>
      
      <Navbar />

      <div className="container">
        <div className="hero">
          <h1>Real Ratings. Real People.</h1>
          <p className="subtitle">Honest laptop reviews from consumers, for consumers.</p>
          <button className="btn btn-register" onClick={() => navigate('/register')}>
            Join the Community
          </button>
          
          <div className="badges">
            <div className="badge">100% Consumer Driven</div>
            <div className="badge">Reliable Server</div>
            <div className="badge">Authentic Reviews</div>
          </div>
        </div>

        <div className="showcase-section">
          <div className="showcase-decorations">
            <div className="showcase-circle circle-1"></div>
            <div className="showcase-circle circle-2"></div>
            <div className="showcase-circle circle-3"></div>
          </div>
          <div className="showcase-carousel">
            <div className="showcase-card" onClick={() => handleShowcaseClick(1)}>
              <div className="showcase-image-container">
                <img 
                  src={laptopDetails[1].image}
                  alt={laptopDetails[1].title}
                  className="showcase-image"
                />
              </div>
              <h3 className="showcase-title">{laptopDetails[1].title}</h3>
              <p className="showcase-description">{laptopDetails[1].description}</p>
            </div>
            <div className="showcase-card" onClick={() => handleShowcaseClick(2)}>
              <div className="showcase-image-container">
                <img 
                  src={laptopDetails[2].image}
                  alt={laptopDetails[2].title}
                  className="showcase-image"
                />
              </div>
              <h3 className="showcase-title">{laptopDetails[2].title}</h3>
              <p className="showcase-description">{laptopDetails[2].description}</p>
            </div>
            <div className="showcase-card" onClick={() => handleShowcaseClick(3)}>
              <div className="showcase-image-container">
                <img 
                  src={laptopDetails[3].image}
                  alt={laptopDetails[3].title}
                  className="showcase-image"
                />
              </div>
              <h3 className="showcase-title">{laptopDetails[3].title}</h3>
              <p className="showcase-description">{laptopDetails[3].description}</p>
            </div>
          </div>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <FiSearch />
            </div>
            <h3 className="feature-title">Unbiased Reviews</h3>
            <p className="feature-text">Every rating comes from real users. No paid promotions or hidden agendas.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiUsers />
            </div>
            <h3 className="feature-title">Community Powered</h3>
            <p className="feature-text">Built by consumers, for consumers. Your voice shapes what others buy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiShield />
            </div>
            <h3 className="feature-title">Zero Business Ties</h3>
            <p className="feature-text">Completely independent from manufacturers. Just honest opinions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiZap />
            </div>
            <h3 className="feature-title">Fast & Simple</h3>
            <p className="feature-text">Rate products in seconds. No lengthy forms required.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiLock />
            </div>
            <h3 className="feature-title">Privacy First</h3>
            <p className="feature-text">Your data stays private. We never sell your information.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiBarChart2 />
            </div>
            <h3 className="feature-title">Transparent Data</h3>
            <p className="feature-text">See real statistics and breakdowns. No manipulation.</p>
          </div>
        </div>

        <div className="cta-section">
          <h2 className="cta-title">Ready to Make Informed Decisions?</h2>
          <p className="cta-text">Join thousands of consumers sharing real experiences.</p>
          <button className="btn btn-register" onClick={() => navigate('/register')}>
            Get Started Free
          </button>
        </div>
      </div>

      {showModal && selectedLaptop && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-image-container">
              <img 
                src={selectedLaptop.image} 
                alt={selectedLaptop.title}
                className="modal-image"
              />
            </div>
            <h2 className="modal-title">{selectedLaptop.title}</h2>
            <p className="modal-description">{selectedLaptop.description}</p>
            <button className="btn btn-register" onClick={() => navigate('/register')}>
              Join to See More
            </button>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Retogen</h3>
            <p className="footer-text">Content coming soon...</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><button className="footer-link" onClick={() => navigate('/')}>Home</button></li>
              <li><button className="footer-link" onClick={() => navigate('/reviews')}>Reviews</button></li>
              <li><button className="footer-link" onClick={() => navigate('/community')}>Community</button></li>
              <li><button className="footer-link" onClick={() => navigate('/about')}>About Us</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><button className="footer-link" onClick={() => navigate('/help')}>Help Center</button></li>
              <li><button className="footer-link" onClick={() => navigate('/contact')}>Contact Us</button></li>
              <li><button className="footer-link" onClick={() => navigate('/faq')}>FAQs</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Legal</h3>
            <ul className="footer-links">
              <li><button className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button></li>
              <li><button className="footer-link" onClick={() => navigate('/terms')}>Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Retogen. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;