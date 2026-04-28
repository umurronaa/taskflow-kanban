"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  DndContext, rectIntersection, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragOverlay, TouchSensor 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const dynamic = "force-dynamic";

// --- KART BİLEŞENİ ---
function TaskCard({ title, isDragging, isOverlay, onDelete }) {
  return (
    <div style={{
      padding: '14px', backgroundColor: 'white', borderRadius: '10px',
      boxShadow: isDragging ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
      marginBottom: '12px', cursor: isOverlay ? 'grabbing' : 'grab',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155',
      opacity: isDragging ? 0.4 : 1, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', touchAction: 'none'
    }}>
      <span style={{ fontWeight: '600', wordBreak: 'break-word' }}>{title}</span>
      {!isOverlay && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '20px', padding: '0 5px', lineHeight: 1 }}>×</button>
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

// --- SÜTUN BİLEŞENİ ---
function ColumnContainer({ id, title, items, children }) {
  const { setNodeRef } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ 
      flex: '0 0 320px', width: '320px', backgroundColor: '#f1f5f9', borderRadius: '18px', 
      padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '550px', 
      boxSizing: 'border-box', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ margin: '0 0 20px 4px', color: '#475569', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title} ({items.length})
      </h3>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div style={{ flexGrow: 1 }}>{children}</div>
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        await fetchTasks(user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchTasks = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('order_index');
    
    if (error) console.error('Fetch Error:', error);
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
    if (!val || !user) return;
    const newTask = { id: Date.now().toString(), content: val, column_id: colId, order_index: columns[colId].items.length, user_id: user.id };
    setColumns(prev => ({ ...prev, [colId]: { ...prev[colId], items: [...prev[colId].items, { id: newTask.id, content: newTask.content }] } }));
    setNewTasks(prev => ({ ...prev, [colId]: '' }));
    await supabase.from('tasks').insert([newTask]);
  };

  const deleteTask = async (colId, taskId) => {
    setColumns(prev => ({ ...prev, [colId]: { ...prev[colId], items: prev[colId].items.filter(i => i.id !== taskId) } }));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (loading || !user) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: '40px 0', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto 50px', padding: '0 20px' }}>
        <h1 style={{ color: '#0f172a', fontWeight: '900', fontSize: '32px', margin: 0, letterSpacing: '-0.02em' }}>TaskFlow <span style={{ color: '#2563eb' }}>Kanban</span></h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Çıkış Yap</button>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
        {/* DIŞ KATMAN: Kaydırma ve Firefox uyumluluğu */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '40px', WebkitOverflowScrolling: 'touch' }}>
          {/* İÇ KATMAN: Sütunları sığmıyorsa sola yaslar, sığıyorsa ortalar */}
          <div style={{ 
            display: 'inline-flex', // ÖNEMLİ: Firefox taşma sorunu için
            minWidth: '100%',
            justifyContent: 'center', 
            padding: '0 20px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              {Object.keys(columns).map((colId) => (
                <ColumnContainer key={colId} id={colId} title={columns[colId].title} items={columns[colId].items}>
                  {columns[colId].items.map((task) => (
                    <SortableTaskCard key={task.id} id={task.id} title={task.content} onDelete={() => deleteTask(colId, task.id)} />
                  ))}
                  <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                    <input 
                      type="text" 
                      placeholder="+ Kart ekle..." 
                      value={newTasks[colId]} 
                      onChange={(e) => setNewTasks(prev => ({ ...prev, [colId]: e.target.value }))} 
                      onKeyDown={(e) => e.key === 'Enter' && addTask(colId)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }} 
                    />
                  </div>
                </ColumnContainer>
              ))}
            </div>
          </div>
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
    const findColumn = (id) => (id in columns ? id : Object.keys(columns).find(key => columns[key].items.some(item => item.id === id)));
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