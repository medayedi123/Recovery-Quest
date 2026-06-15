// Workout Planning System - Rule-based implementation
class WorkoutPlanner {
  constructor() {
    this.workoutPlans = [];
    this.currentPlan = null;
  }

  /**
   * Generate a structured workout plan
   * @param {string} goal - fat loss / muscle gain / maintenance / strength
   * @param {number} daysPerWeek - 1-7
   * @param {string} equipment - home / gym / none
   * @returns {Object} - Generated workout plan
   */
  generatePlan(goal, daysPerWeek, equipment) {
    // Rule-based workout templates
    const templates = {
      'muscle gain': this.getMuscleGainTemplate(daysPerWeek, equipment),
      'fat loss': this.getFatLossTemplate(daysPerWeek, equipment),
      'strength': this.getStrengthTemplate(daysPerWeek, equipment),
      'maintenance': this.getMaintenanceTemplate(daysPerWeek, equipment)
    };

    if (!templates[goal]) {
      throw new Error(`Invalid goal: ${goal}`);
    }

    this.currentPlan = {
      goal,
      daysPerWeek,
      equipment,
      workouts: templates[goal],
      createdAt: new Date(),
      progressionRules: this.getProgressionRules(goal)
    };

    this.workoutPlans.push(this.currentPlan);
    return this.currentPlan;
  }

  /**
   * Get progression rules based on goal
   * @param {string} goal 
   * @returns {string} - Progression rules description
   */
  getProgressionRules(goal) {
    const rules = {
      'muscle gain': "Increase reps by 1-2 per week when completing all sets with good form",
      'fat loss': "Increase intensity by reducing rest time by 5-10 seconds weekly",
      'strength': "Increase weight by 2.5-5% when completing all reps with good form",
      'maintenance': "Maintain current intensity, focus on perfect form and consistency"
    };
    return rules[goal] || "Add +1 rep per week if completed easily";
  }

  // Workout templates would be defined here...
  getMuscleGainTemplate(days, equipment) {
    // Implementation would return different templates based on days/equipment
    return [/* array of workout objects */];
  }
  
  // Other template methods...

  /**
   * Record a completed workout
   * @param {Object} workout - Completed workout data
   */
  recordWorkout(workout) {
    if (!this.currentPlan) return;
    
    this.currentPlan.completedWorkouts = this.currentPlan.completedWorkouts || [];
    this.currentPlan.completedWorkouts.push({
      ...workout,
      date: new Date()
    });
  }

  /**
   * Get workout consistency feedback
   * @returns {string} - Feedback message
   */
  getConsistencyFeedback() {
    if (!this.currentPlan || !this.currentPlan.completedWorkouts) return "";
    
    const completed = this.currentPlan.completedWorkouts.length;
    const expected = this.currentPlan.daysPerWeek * 4; // Assume 4 weeks
    
    const ratio = completed / expected;
    
    if (ratio >= 0.9) return "Excellent consistency! Keep pushing!";
    if (ratio >= 0.7) return "Good consistency. Try to hit all scheduled workouts.";
    if (ratio >= 0.5) return "Moderate consistency. You've missed several workouts.";
    return "Poor consistency. Focus on making workouts a priority.";
  }
}

// Initialize and expose to global scope
window.WorkoutPlanner = new WorkoutPlanner();