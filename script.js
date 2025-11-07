const exercises = [
            { name: 'Push-ups', unit: 'reps', defaultTarget: 20, category: 'Upper Body' },
            { name: 'Squats', unit: 'reps', defaultTarget: 30, category: 'Lower Body' },
            { name: 'Plank', unit: 'seconds', defaultTarget: 60, category: 'Core' },
            { name: 'Jumping Jacks', unit: 'reps', defaultTarget: 50, category: 'Cardio' },
            { name: 'Lunges', unit: 'reps', defaultTarget: 20, category: 'Lower Body' },
            { name: 'Burpees', unit: 'reps', defaultTarget: 15, category: 'Full Body' },
            { name: 'Mountain Climbers', unit: 'reps', defaultTarget: 40, category: 'Core' },
            { name: 'Pull-ups', unit: 'reps', defaultTarget: 10, category: 'Upper Body' },
            { name: 'Sit-ups', unit: 'reps', defaultTarget: 30, category: 'Core' },
            { name: 'Running', unit: 'minutes', defaultTarget: 20, category: 'Cardio' }
        ];

        let workouts = [];
        let currentExercise = null;
        let timerInterval = null;
        let timerSeconds = 0;
        let isTimerRunning = true;

        function switchTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tab + '-tab').classList.add('active');
            
            if (tab === 'history') {
                renderHistory();
            }
        }

        function toggleExerciseList() {
            const list = document.getElementById('exercises-list');
            const isHidden = list.classList.contains('hidden');
            
            if (isHidden) {
                renderExercises();
                list.classList.remove('hidden');
            } else {
                list.classList.add('hidden');
            }
        }

        function renderExercises() {
            const list = document.getElementById('exercises-list');
            list.innerHTML = exercises.map((ex, idx) => `
                <div class="exercise-card" onclick="startExercise(${idx})">
                    <div class="exercise-name">${ex.name}</div>
                    <div class="exercise-category">${ex.category}</div>
                    <div class="exercise-target">Target: ${ex.defaultTarget} ${ex.unit}</div>
                </div>
            `).join('');
        }

        function startExercise(idx) {
            const exercise = exercises[idx];
            currentExercise = {
                ...exercise,
                sets: [],
                startTime: Date.now()
            };

            document.getElementById('exercises-list').classList.add('hidden');
            document.getElementById('start-exercise-btn').classList.add('hidden');
            document.getElementById('workout-panel').classList.remove('hidden');
            
            document.getElementById('current-exercise-name').textContent = exercise.name;
            document.getElementById('current-exercise-category').textContent = exercise.category;
            document.getElementById('unit-label').textContent = exercise.unit;
            document.getElementById('total-unit').textContent = exercise.unit;
            
            timerSeconds = 0;
            isTimerRunning = true;
            startTimer();
        }

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (isTimerRunning) {
                    timerSeconds++;
                    updateTimerDisplay();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const hrs = Math.floor(timerSeconds / 3600);
            const mins = Math.floor((timerSeconds % 3600) / 60);
            const secs = timerSeconds % 60;
            document.getElementById('timer-display').textContent = 
                `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function toggleTimer() {
            isTimerRunning = !isTimerRunning;
            document.getElementById('timer-icon').textContent = isTimerRunning ? '⏸' : '▶';
            document.getElementById('timer-text').textContent = isTimerRunning ? 'Pause' : 'Resume';
        }

        function resetTimer() {
            timerSeconds = 0;
            updateTimerDisplay();
        }

        function addSet() {
            const input = document.getElementById('reps-input');
            const value = parseInt(input.value);
            
            if (!value || value <= 0) return;
            
            currentExercise.sets.push({
                reps: value,
                timestamp: Date.now()
            });
            
            input.value = '';
            renderSets();
            document.getElementById('complete-btn').disabled = false;
        }

        function renderSets() {
            const container = document.getElementById('sets-container');
            const list = document.getElementById('sets-list');
            
            container.classList.remove('hidden');
            document.getElementById('sets-count').textContent = currentExercise.sets.length;
            
            list.innerHTML = currentExercise.sets.map((set, idx) => `
                <div class="set-item">
                    <span>Set ${idx + 1}</span>
                    <span class="set-value">${set.reps} ${currentExercise.unit}</span>
                </div>
            `).join('');
            
            const total = currentExercise.sets.reduce((sum, set) => sum + set.reps, 0);
            document.getElementById('total-reps').textContent = total;
        }

        function completeExercise() {
            if (!currentExercise || currentExercise.sets.length === 0) return;
            
            const totalReps = currentExercise.sets.reduce((sum, set) => sum + set.reps, 0);
            const duration = Math.floor((Date.now() - currentExercise.startTime) / 1000);
            
            const workout = {
                id: Date.now(),
                exercise: currentExercise.name,
                category: currentExercise.category,
                sets: currentExercise.sets.length,
                totalReps,
                unit: currentExercise.unit,
                duration,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };
            
            workouts.unshift(workout);
            cancelExercise();
            updateStats();
        }

        function cancelExercise() {
            currentExercise = null;
            if (timerInterval) clearInterval(timerInterval);
            timerSeconds = 0;
            isTimerRunning = true;
            
            document.getElementById('workout-panel').classList.add('hidden');
            document.getElementById('start-exercise-btn').classList.remove('hidden');
            document.getElementById('sets-container').classList.add('hidden');
            document.getElementById('sets-list').innerHTML = '';
            document.getElementById('complete-btn').disabled = true;
            updateTimerDisplay();
        }

        function updateStats() {
            const today = new Date().toLocaleDateString();
            const todayWorkouts = workouts.filter(w => w.date === today);
            
            document.getElementById('stat-exercises').textContent = todayWorkouts.length;
            document.getElementById('stat-sets').textContent = todayWorkouts.reduce((sum, w) => sum + w.sets, 0);
            document.getElementById('stat-reps').textContent = todayWorkouts.reduce((sum, w) => sum + w.totalReps, 0);
            document.getElementById('stat-minutes').textContent = Math.floor(todayWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60);
        }

        function renderHistory() {
            const container = document.getElementById('history-content');
            
            if (workouts.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <p class="empty-text">No workouts yet. Start tracking!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="history-list">
                    ${workouts.map(workout => `
                        <div class="history-item">
                            <div class="history-header">
                                <div class="history-title">
                                    <h3>${workout.exercise}</h3>
                                    <p class="exercise-category">${workout.category}</p>
                                </div>
                                <button class="btn-delete" onclick="deleteWorkout(${workout.id})">✕</button>
                            </div>
                            <div class="history-stats">
                                <div class="history-stat">
                                    <div class="history-stat-label">Sets</div>
                                    <div class="history-stat-value">${workout.sets}</div>
                                </div>
                                <div class="history-stat">
                                    <div class="history-stat-label">Total</div>
                                    <div class="history-stat-value">${workout.totalReps} ${workout.unit}</div>
                                </div>
                                <div class="history-stat">
                                    <div class="history-stat-label">Duration</div>
                                    <div class="history-stat-value">${formatTime(workout.duration)}</div>
                                </div>
                            </div>
                            <div class="history-date">${workout.date} at ${workout.time}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function deleteWorkout(id) {
            workouts = workouts.filter(w => w.id !== id);
            renderHistory();
            updateStats();
        }

        function formatTime(seconds) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        // Handle Enter key in input
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('reps-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addSet();
                }
            });
        });