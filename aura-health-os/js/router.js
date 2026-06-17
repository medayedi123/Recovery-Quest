function initRouter() {
  const navLinks = document.querySelectorAll('[data-page]');
  const topbarProfile = document.querySelector('.topbar-profile');
  const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
  const appShell = document.getElementById('app-shell');

  // Page switching logic
  function handleNavClick(e) {
    e.preventDefault();
    const pageId = this.getAttribute('data-page');
    window.store.setPage(pageId);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // Topbar profile navigates to settings profile
  if (topbarProfile) {
    topbarProfile.onclick = () => window.store.setPage('profile');
  }

  // Sidebar collapse click trigger (Requested by user)
  if (sidebarToggle) {
    sidebarToggle.onclick = () => {
      window.store.toggleSidebarCollapse();
    };
  }


}

// Subscribe routing store states
window.store.subscribe((state) => {
  const appShell = document.getElementById('app-shell');
  const navItems = document.querySelectorAll('.sidebar-item');
  const mobileItems = document.querySelectorAll('.mobile-nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');

  if (!appShell) return;

  // 1. Sidebar Collapse State styling
  if (state.sidebarCollapsed) {
    appShell.classList.add('sidebar-collapsed');
  } else {
    appShell.classList.remove('sidebar-collapsed');
  }



  // Mobile navigation items
  mobileItems.forEach(item => {
    if (item.getAttribute('data-page') === state.activePage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 3. View visibility toggles
  viewPanels.forEach(panel => {
    if (panel.id === `${state.activePage}-view`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
});

// Bind Window Router Load
window.addEventListener('DOMContentLoaded', initRouter);
window.initRouter = initRouter;
