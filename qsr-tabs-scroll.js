/**
 * QSR Tabs Scroll Functionality
 * Adds horizontal scroll with arrow buttons for live search results tabs
 */

/**
 * Scroll QSR tabs left or right
 * @param {number} distance - Pixels to scroll (negative = left, positive = right)
 */
function scrollQsrTabs(distance) {
  const tabsContainer = document.getElementById('qsr-db-tabs-scroll');
  if (!tabsContainer) return;
  
  tabsContainer.scrollBy({
    left: distance,
    behavior: 'smooth'
  });
  
  // Update arrow visibility after scroll
  setTimeout(updateQsrScrollArrows, 300);
}

/**
 * Update scroll arrow visibility based on scroll position
 */
function updateQsrScrollArrows() {
  const tabsContainer = document.getElementById('qsr-db-tabs-scroll');
  const leftArrow = document.getElementById('qsr-scroll-left');
  const rightArrow = document.getElementById('qsr-scroll-right');
  
  if (!tabsContainer) return;
  
  const scrollLeft = tabsContainer.scrollLeft;
  const scrollWidth = tabsContainer.scrollWidth;
  const clientWidth = tabsContainer.clientWidth;
  
  // Show/hide left arrow
  if (leftArrow) {
    if (scrollLeft <= 10) {
      leftArrow.classList.add('hidden');
    } else {
      leftArrow.classList.remove('hidden');
    }
  }
  
  // Show/hide right arrow
  if (rightArrow) {
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      rightArrow.classList.add('hidden');
    } else {
      rightArrow.classList.remove('hidden');
    }
  }
}

/**
 * Initialize QSR tabs scroll functionality
 * Call this after search results are rendered
 */
function initQsrTabsScroll() {
  const tabsContainer = document.getElementById('qsr-db-tabs-scroll');
  if (!tabsContainer) return;
  
  // Add scroll event listener
  tabsContainer.addEventListener('scroll', updateQsrScrollArrows);
  
  // Initial arrow state
  setTimeout(updateQsrScrollArrows, 100);
  
  // Add keyboard navigation
  tabsContainer.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // Horizontal scroll - let it happen naturally
      return;
    } else if (e.deltaY !== 0) {
      // Vertical scroll - convert to horizontal
      e.preventDefault();
      tabsContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

// Export to window
window.scrollQsrTabs = scrollQsrTabs;
window.updateQsrScrollArrows = updateQsrScrollArrows;
window.initQsrTabsScroll = initQsrTabsScroll;

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQsrTabsScroll);
  } else {
    setTimeout(initQsrTabsScroll, 100);
  }
}
