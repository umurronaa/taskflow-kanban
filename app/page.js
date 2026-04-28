"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  DndContext, rectIntersection, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragOverlay 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- KART BİLEŞENİ ---
function TaskCard({ title, isDragging, isOverlay, onDelete }) {
  return (
    <div style={{
      padding: '12px', backgroundColor: 'white', borderRadius: '8px',
      boxShadow: isDragging ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '10px', cursor: isOverlay ? 'grabbing' : 'grab',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155',
      opacity: isDragging ? 0.3 : 1, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ fontWeight: '500' }}>{title}</span>
      {!isOverlay && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>×</button>
      )}
    </div>
  );
}

// --- SÜRÜKLENEBİLİR KART SARMALAYICI ---
function SortableTaskCard({ id, title, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} {...attributes} {...listeners}>
      <TaskCard title={title} isDragging={isDragging} onDelete={onDelete} />
    </div>
  );
}

// --- SÜTUN BİLEŞENİ (BOŞ OLSA BİLE ALGILANIR) ---
function ColumnContainer({ id, title, items, children }) {
  const { setNodeRef } = useSortable({ id }); // Sütunu da droppable yapıyoruz

  return (
    <div ref={setNodeRef} style={{ 
      width: '300px', backgroundColor: '#f1f5f9', borderRadius: '16px', 
      padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '300px' 
    }}>
      <h3 style={{ margin: '0 0 20px 4px', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
        {title}
      </h3>
      
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div style={{ flexGrow: 1 }}>
          {children}
        </div>
      </SortableContext>
    </div>
  );
}

export default function TaskFlow() {
  const [columns, setColumns] = useState({
    todo: { title: 'Yapılacaklar', items: [] },
    doing: { title: 'Devam Edenler', items: [] },
    done: { title: 'Tamamlananlar', items: [] }
  });
  const [activeId, setActiveId] = useState(null);
  const [newTasks, setNewTasks] = useState({ todo: '', doing: '', done: '' });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('order_index');
    if (error) console.error('Hata:', error);
    else {
      const newCols = { todo: { ...columns.todo, items: [] }, doing: { ...columns.doing, items: [] }, done: { ...columns.done, items: [] } };
      data.forEach(task => {
        if (newCols[task.column_id]) newCols[task.column_id].items.push({ id: task.id, content: task.content });
      });
      setColumns(newCols);
    }
  };

  const addTask = async (colId) => {
    const val = newTasks[colId].trim();
    if (!val) return;
    const newTask = { id: Date.now().toString(), content: val, column_id: colId, order_index: columns[colId].items.length };
    
    setColumns(prev => ({ ...prev, [colId]: { ...prev[colId], items: [...prev[colId].items, { id: newTask.id, content: newTask.content }] } }));
    setNewTasks(prev => ({ ...prev, [colId]: '' }));

    await supabase.from('tasks').insert([newTask]);
  };

  const deleteTask = async (colId, taskId) => {
    setColumns(prev => ({ ...prev, [colId]: { ...prev[colId], items: prev[colId].items.filter(i => i.id !== taskId) } }));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  return (
    <div style={{ padding: '50px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px', color: '#0f172a', fontWeight: '800' }}>TaskFlow Kanban</h1>
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={rectIntersection} // Alan kesişimi algılaması
        onDragStart={(e) => setActiveId(e.active.id)} 
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', alignItems: 'flex-start' }}>
          {Object.keys(columns).map((colId) => (
            <ColumnContainer key={colId} id={colId} title={columns[colId].title} items={columns[colId].items}>
              {columns[colId].items.map((task) => (
                <SortableTaskCard key={task.id} id={task.id} title={task.content} onDelete={() => deleteTask(colId, task.id)} />
              ))}
              <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                <input type="text" placeholder="+ Kart ekle..." value={newTasks[colId]} onChange={(e) => setNewTasks(prev => ({ ...prev, [colId]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addTask(colId)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </ColumnContainer>
          ))}
        </div>
        <DragOverlay>
          {activeId ? <TaskCard title={Object.values(columns).flatMap(c => c.items).find(i => i.id === activeId)?.content} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const findColumn = (id) => {
      if (id in columns) return id;
      return Object.keys(columns).find(key => columns[key].items.some(item => item.id === id));
    };

    const activeCol = findColumn(active.id);
    const overCol = findColumn(over.id);

    if (!activeCol || !overCol) return;

    if (activeCol !== overCol) {
      setColumns(prev => {
        const activeItems = [...prev[activeCol].items];
        const overItems = [...prev[overCol].items];
        const movedItem = activeItems.find(i => i.id === active.id);
        activeItems.splice(activeItems.indexOf(movedItem), 1);
        overItems.push(movedItem);
        return { ...prev, [activeCol]: { ...prev[activeCol], items: activeItems }, [overCol]: { ...prev[overCol], items: overItems } };
      });
      await supabase.from('tasks').update({ column_id: overCol }).eq('id', active.id);
    } else {
      setColumns(prev => {
        const items = [...prev[activeCol].items];
        const oldIdx = items.findIndex(i => i.id === active.id);
        const newIdx = items.findIndex(i => i.id === over.id);
        return { ...prev, [activeCol]: { ...prev[activeCol], items: arrayMove(items, oldIdx, newIdx) } };
      });
    }
  }
}