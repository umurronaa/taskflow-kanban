"use client";
import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  TouchSensor, 
  MouseSensor, 
  useSensor, 
  useSensors, 
  closestCorners,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import { supabase } from '@/lib/supabase.js';

export const dynamic = "force-dynamic";

// KART BİLEŞENİ (Aynı dosya içinde)
function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-4 rounded shadow-md cursor-grab active:cursor-grabbing border-l-4 border-blue-500"
    >
      <p className="text-gray-800 font-medium">{task.title}</p>
    </div>
  );
}

// SÜTUN BİLEŞENİ (Aynı dosya içinde)
function Column({ id, title, tasks }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className="bg-gray-200 p-4 rounded-lg w-full md:w-80 min-h-[300px] shadow-inner"
    >
      <h2 className="font-bold mb-4 text-gray-600 uppercase text-xs tracking-widest border-b border-gray-300 pb-2">
        {title} ({tasks.length})
      </h2>
      <div className="flex flex-col gap-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

// ANA KANBAN TAHTASI
export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const columns = ['To Do', 'In Progress', 'Done'];

  // MOBİL VE PC SENSÖRLERİ
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Mobilde 200ms basılı tutunca sürükleme başlar
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*');
    if (data) setTasks(data);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(t => t.id === activeId);
    
    // Eğer bir sütunun üzerine bırakıldıysa durumunu güncelle
    if (columns.includes(overId) && activeTask.status !== overId) {
      const { error } = await supabase
        .from('tasks')
        .update({ status: overId })
        .eq('id', activeId);
      
      if (!error) {
        setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: overId } : t));
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <h1 className="text-2xl font-black text-center mb-10 text-gray-800 tracking-tighter">
        TASKFLOW <span className="text-blue-600">KANBAN</span>
      </h1>
      
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        {/* MOBİLDE ALT ALTA (flex-col), PC'DE YAN YANA (md:flex-row) */}
        <div className="flex flex-col md:flex-row justify-center gap-6 items-start max-w-6xl mx-auto">
          {columns.map(col => (
            <Column 
              key={col} 
              id={col} 
              title={col} 
              tasks={tasks.filter(t => t.status === col)} 
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}