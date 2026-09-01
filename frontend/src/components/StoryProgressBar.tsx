import React from 'react';

interface StoryProgressBarProps {
  exercises: any[];
  activeExerciseIndex: number;
  setLogs: { [exerciseIndex: number]: any[] };
  onSelectExercise: (index: number) => void;
}

export const StoryProgressBar: React.FC<StoryProgressBarProps> = ({
  exercises = [],
  activeExerciseIndex,
  setLogs = {},
  onSelectExercise,
}) => {
  if (!exercises || exercises.length <= 1) return null;

  return (
    <div className="story-progress-container">
      {exercises.map((ex, idx) => {
        const logs = setLogs[idx] || [];
        const isCompleted = logs.length > 0 && logs.every((s: any) => s.completed);
        const isActive = idx === activeExerciseIndex;
        
        let statusClass = 'pending';
        if (isCompleted) statusClass = 'completed';
        else if (isActive) statusClass = 'active';

        const exerciseName = typeof ex === 'string' ? ex : (ex.name || ex.nameEn || `Exercise ${idx + 1}`);

        return (
          <div
            key={idx}
            onClick={() => onSelectExercise(idx)}
            className={`story-progress-segment ${statusClass}`}
            title={`${idx + 1}. ${exerciseName} (${isCompleted ? 'Completed' : isActive ? 'Active' : 'Upcoming'})`}
          />
        );
      })}
    </div>
  );
};
