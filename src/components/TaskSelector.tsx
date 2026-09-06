'use client';

import { TASKS } from '@/config/models';

interface TaskSelectorProps {
  selectedTask: string;
  onSelectTask: (taskId: string) => void;
}

export default function TaskSelector({ selectedTask, onSelectTask }: TaskSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {TASKS.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task.id)}
          className={`p-4 rounded-xl border transition ${
            selectedTask === task.id
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-200 hover:border-red-300 dark:border-gray-700'
          }`}
        >
          <div className="text-2xl mb-2">{task.icon}</div>
          <div className="font-semibold text-sm">{task.name}</div>
          <div className="text-xs text-gray-500 mt-1">{task.description}</div>
        </button>
      ))}
    </div>
  );
}
