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
      padding: '12px', backgroundColor: 'white', borderRadius: '8px',
      boxShadow: isDragging ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '10px', cursor: isOverlay ? 'grabbing' : 'grab',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155',
      opacity: isDragging ? 0.3 : 1, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', touchAction: 'none'
    }}>
      <span style={{ fontWeight: '500' }}>{title}</span>
      {!isOverlay && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', padding: '0 5px' }}>×</button>
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
      flex: '0 0 280px', // Sütunların büzülmesini engeller
      width: '280px', 
      backgroundColor: '#f1f5f9', borderRadius: '16px', 
      padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '450px', boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: '0 0 20px 4px', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
        {title}
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
  const router = useRouter();

  // 1. OTURUM KONTROLÜ
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        fetchTasks(user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchTasks = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId) // Sadece giriş yapan kullanıcının verilerini çek
      .order('order_index');
    
    if (error) {
      console.error('Veri çekme hatası:', error);
    } else {
      const newCols = { 
        todo: { ...columns.todo, items: [] }, 
        doing: { ...columns.doing, items: [] }, 
        done: { ...columns.done, items: [] } 
      };
      data.forEach(task => {
        if (newCols[task.column_id]) {
          newCols[task.column_id].items.push({ id: task.id, content: task.content });
        }
      });
      setColumns(newCols);
    }
  };

  const addTask = async (colId) => {
    const val = newTasks[colId].trim();
    if (!val || !user) return;
    
    const newTask = { 
      id: Date.now().toString(), 
      content: val, 
      column_id: colId, 
      order_index: columns[colId].items.length,
      user_id: user.id // Kullanıcı ID'sini mutlaka ekliyoruz
    };
    
    // Önce arayüzü güncelle (Hız hissi için)
    setColumns(prev => ({ 
      ...prev, 
      [colId]: { ...prev[colId], items: [...prev[colId].items, { id: newTask.id, content: newTask.content }] } 
    }));
    setNewTasks(prev => ({ ...prev, [colId]: '' }));

    // Sonra veritabanına kaydet
    const { error } = await supabase.from('tasks').insert([newTask]);
    if (error) console.error('Ekleme hatası:', error);
  };

  const deleteTask = async (colId, taskId) => {
    setColumns(prev => ({ 
      ...prev, 
      [colId]: { ...prev[colId], items: prev[colId].items.filter(i => i.id !== taskId) } 
    }));
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

  if (!user) return <div style={{ padding: '50px', textAlign: 'center' }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: '40px 10px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto 40px' }}>
        <h1 style={{ color: '#0f172a', fontWeight: '800', fontSize: '28px', margin: 0 }}>TaskFlow Kanban</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Çıkış Yap</button>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
        {/* ANA KAPSAYICI: Sağa kaydırma özelliği eklendi */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          overflowX: 'auto', // Kritik: Sağa kaydırmayı sağlar
          paddingBottom: '30px',
          paddingLeft: '10px',
          paddingRight: '10px',
          WebkitOverflowScrolling: 'touch' 
        }}>
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
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                />
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