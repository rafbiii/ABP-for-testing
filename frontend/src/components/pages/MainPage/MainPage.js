import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiPlus, 
  FiChevronDown,
  FiFilter,
  FiUsers,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { fetchMainPageData, transformArticles } from '../../../services/MainPageService';
import { verifyAdmin } from '../../../services/VerificationService';
import { initializeTheme } from '../../../services/themeUtils';
import Navbar from '../../common/Navbar/Navbar';
import './MainPage.css';

function MainPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [username, setUsername] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Track if component just mounted
  const isInitialMount = useRef(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore last visited page from sessionStorage
    const savedPage = sessionStorage.getItem('mainPageCurrentPage');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const articlesPerPage = 10;

  // Sort options tanpa icon
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Popular' }
  ];

  // Scroll to saved position when component mounts
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('mainPageScrollPosition');
    if (savedScrollPosition) {
      // Use timeout to ensure content is loaded before scrolling
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('mainPageScrollPosition');
      }, 100);
    }
    // Don't scroll to top automatically - let the saved page stay
  }, []);

  // Save current page to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('mainPageCurrentPage', currentPage.toString());
  }, [currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize theme on component mount
  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    const loadMainPageData = async () => {
      console.log(localStorage.getItem('token'));
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return; 
        }

        // Verify admin role using service
        const verifyResult = await verifyAdmin(token);

        if (!verifyResult.success) {
          if (verifyResult.error === 'token invalid') {
            localStorage.removeItem('token');
            alert('Token invalid. Please login again.');
            navigate('/login');
            return;
          }

          if (verifyResult.error === 'backend error') {
            console.warn('Backend error during admin verification');
          }
          
          setIsAdmin(false);
        } else {
          setIsAdmin(verifyResult.isAdmin);
        }

        // Fetch data using service
        const result = await fetchMainPageData(token);

        if (!result.success) {
          // Handle different error types
          if (result.error === 'network_error') {
            setError('Network error. Please check your connection.');
          } else if (result.data?.confirmation === 'token invalid') {
            localStorage.removeItem('token');
            alert('Token invalid. Please login again.');
            navigate('/login');
            return;
          } else if (result.data?.confirmation === 'backend error') {
            setError('Server is busy, try again later');
          } else {
            setError('An error occurred. Please try again.');
          }
          setLoading(false);
          return;
        }

        const data = result.data;

        // Handle different response confirmations
        if (data.confirmation === 'token invalid') {
          localStorage.removeItem('token');
          alert('Token invalid. Please login again.');
          navigate('/login');
          return;
        }

        if (data.confirmation === 'backend error') {
          setError('Server is busy, try again later');
          setLoading(false);
          return;
        }

        if (data.confirmation === 'fetch data successful') {
          setUsername(data.username);
          const transformedArticles = transformArticles(data.list_article);
          setArticles(transformedArticles);
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error in loadMainPageData:', error);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    loadMainPageData();
  }, [navigate]);

  // Filter and sort articles
  const getFilteredArticles = () => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered = [...filtered].reverse();
    } else if (sortBy === 'oldest') {
      filtered = [...filtered];
    }
    // Note: 'popular' sorting would need additional data from backend

    return filtered;
  };

  // Reset to page 1 when search or sort changes (but NOT on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      // Skip reset on first render
      isInitialMount.current = false;
    } else {
      // Only reset page when user actively changes search or sort
      setCurrentPage(1);
      sessionStorage.setItem('mainPageCurrentPage', '1');
    }
  }, [searchTerm, sortBy]);

  // Get paginated articles
  const getPaginatedArticles = () => {
    const filtered = getFilteredArticles();
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filtered = getFilteredArticles();
    return Math.ceil(filtered.length / articlesPerPage);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Clear saved scroll position when manually changing pages
    sessionStorage.removeItem('mainPageScrollPosition');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save scroll position before navigating to article
  const handleArticleClick = (articleId) => {
    sessionStorage.setItem('mainPageScrollPosition', window.scrollY.toString());
    navigate(`/article/${articleId}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2
        );
      }
    }
    
    return pageNumbers;
  };

  // Handle sort selection
  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsDropdownOpen(false);
  };

  // Get current sort label
  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Sort';
  };

  // Loading state
  if (loading) {
    return (
      <div className="main-page">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
        <div className="bg-shape-3"></div>

        <Navbar showAccount={true} />

        <div className="container">
          <div className="loading-message">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="main-page">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
        <div className="bg-shape-3"></div>

        <Navbar showAccount={true} />

        <div className="container">
          <div className="error-message">
            <h2>{error}</h2>
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredArticles = getFilteredArticles();
  const paginatedArticles = getPaginatedArticles();
  const totalPages = getTotalPages();
  const pageNumbers = getPageNumbers();

  return (
    <div className="main-page">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <div className="bg-shape-3"></div>

      <Navbar showAccount={true} />

      <div className="container">
        <div className="hero-section">
          <div className="hero-accent"></div>
          <h1>Featured Reviews</h1>
          <p>Discover the best laptops reviewed by our community</p>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <FiSearch className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search articles"
            />
          </div>

          <div className="filter-actions">
            {/* Modern Dropdown */}
            <div className="sort-box" ref={dropdownRef}>
              <button
                className={`sort-button ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Sort options"
              >
                <span className="sort-label">
                  <FiFilter size={16} />
                  {getCurrentSortLabel()}
                </span>
                <FiChevronDown 
                  className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} 
                  size={16} 
                />
              </button>

              <div className={`sort-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`sort-option ${sortBy === option.value ? 'selected' : ''}`}
                    onClick={() => handleSortSelect(option.value)}
                  >
                    <span className="option-text">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <>
                <button className="btn-add-article" onClick={() => navigate('/admin/write')}>
                  <FiPlus size={18} />
                  <span className="btn-add-text">Article</span>
                </button>

                <button className="btn-manage-user" onClick={() => navigate('/admin/users')}>
                  <FiUsers size={18} />
                  <span className="btn-manage-text">Manage User</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="articles-list">
          {paginatedArticles.length > 0 ? (
            paginatedArticles.map((article) => (
              <div
                key={article.id}
                className="article-card"
                onClick={() => handleArticleClick(article.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleArticleClick(article.id);
                }}
              >
                <div className="card-accent"></div>
                <div className="article-image">
                  {article.image ? (
                    <img src={article.image} alt={article.title} />
                  ) : (
                    <div className="image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="article-content">
                  <span className="category">{article.category}</span>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No articles found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredArticles.length > articlesPerPage && (
          <div className="pagination">
            {/* Previous Button */}
            <button
              className="pagination-button pagination-arrow"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNumber)}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Next Button */}
            <button
              className="pagination-button pagination-arrow"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;