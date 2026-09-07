'use client';

import { TASKS } from '@/config/models';
import { TaskIcon } from './icons';

interface TaskSelectorProps {
  selectedTask: string;
  onSelectTask: (taskId: string) => void;
}

export default function TaskSelector({ selectedTask, onSelectTask }: TaskSelectorProps) {
  return (
    <nav
      aria-label="Tipo de tarea"
      className="border-b border-hairline bg-canvas/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-x-visible [&::-webkit-scrollbar]:hidden">
        {TASKS.map((task) => {
          const isSelected = selectedTask === task.id;
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              aria-pressed={isSelected}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                isSelected
                  ? 'bg-ink text-canvas'
                  : 'text-ink-secondary hover:bg-elevated hover:text-ink'
              }`}
            >
              <TaskIcon name={task.icon} className="size-[15px]" />
              {task.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
