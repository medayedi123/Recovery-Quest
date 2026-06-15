function initGamification() {
  const state = window.store.state;

  // 1. Render achievements grid inside Profile page or Dashboard widgets
  renderAchievementsList(state.gamification.achievements);
}

function renderAchievementsList(achievements) {
  const container = document.getElementById('profile-achievements-list');
  if (!container) return;
  container.innerHTML = '';

  achievements.forEach(ach => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '1rem';
    card.style.opacity = ach.unlocked ? '1' : '0.4';
    card.style.borderLeft = ach.unlocked ? '3px solid #ef4444' : '3px solid var(--border-light)';
    
    card.innerHTML = `
      <div style="font-size: 2rem; background: rgba(255,255,255,0.02); width: 50px; height: 50px; border-radius: var(--border-radius-md); display: flex; align-items: center; justify-content: center">
        ${ach.icon}
      </div>
      <div style="flex: 1">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff">${ach.title}</h4>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem">${ach.desc}</p>
      </div>
      <div>
        <span class="badge ${ach.unlocked ? 'badge-nutrition' : 'badge-secondary'}" style="font-size: 0.65rem; text-transform: uppercase">
          ${ach.unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Bind Global Window Callback for Routing
window.initGamification = initGamification;

// Listen for global changes to adjust layout displays
window.store.subscribe((state) => {
  // Hide or Show all Gamification elements globally
  const gamificationElements = document.querySelectorAll('.gamification-element');
  gamificationElements.forEach(el => {
    el.style.display = state.gamificationEnabled ? '' : 'none';
  });

  if (state.activePage === 'profile' || state.activePage === 'dashboard') {
    initGamification();
  }
});
