'use client';

import { TASKS } from '@/config/models';

interface TaskSelectorProps {
  selectedTask: string;
  onSelectTask: (taskId: string) => void;
}

/**
 * El índice de las ocho secciones. Es el mismo gesto que en la portada —los
 * numerales 01…08 y una regla debajo— reducido a una barra de navegación.
 *
 * Los iconos se han ido: el numeral ya identifica la sección, ocupa menos y
 * es lo que ata esta pantalla con la portada. Un icono al lado del texto no
 * añadía información, solo ruido de otra casa.
 */
export default function TaskSelector({ selectedTask, onSelectTask }: TaskSelectorProps) {
  return (
    <nav aria-label="Tipo de tarea" className="border-b border-hairline">
      <div className="a-indice mx-auto flex max-w-5xl overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TASKS.map((task, i) => {
          const isSelected = selectedTask === task.id;
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              aria-pressed={isSelected}
              /* La regla inferior es siempre de 2px, transparente cuando no
                 está elegida: si apareciera solo al elegir, la fila entera
                 daría un salto de dos píxeles en cada cambio. */
              className={`group flex shrink-0 items-baseline gap-2 border-b-2 px-3.5 py-3 whitespace-nowrap transition-colors first:pl-0 ${
                isSelected
                  ? 'border-accent text-ink'
                  : 'border-transparent text-ink-tertiary hover:text-ink'
              }`}
            >
              <span className={`a-num ${isSelected ? 'text-accent' : 'text-ink-tertiary'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[13px]">{task.shortName}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
