// "use client";

// import { useState, useMemo, AwaitedReactNode, ClassAttributes, HTMLAttributes, JSX, JSXElementConstructor, LegacyRef, ReactElement, ReactNode, ReactPortal, RefAttributes, RefAttributes } from 'react';
// import { motion, AnimatePresence, HTMLMotionProps, HTMLMotionProps } from 'framer-motion';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { FiHome, FiCheckSquare, FiUsers, FiGift, FiSettings, FiPlus, FiEdit2, FiTrash2, FiSquare } from 'react-icons/fi';
// import Image from 'next/image';
// import '@fontsource/playfair-display/400.css';
// import '@fontsource/inter/400.css';

// const navItems = [
//   { icon: FiHome, label: 'Overview', href: '/' },
//   { icon: FiCheckSquare, label: 'Tasks', href: '/tasks', active: true },
//   { icon: FiUsers, label: 'Guests', href: '/guests' },
//   { icon: FiGift, label: 'Vendors', href: '/vendors' },
//   { icon: FiSettings, label: 'Settings', href: '/settings' },
// ];

// export default function TasksPage() {
//   const [tasks, setTasks] = useState([
//     { id: '1', title: 'Choose wedding cake', description: '', date: '2025-07-20', status: 'Pending' },
//     { id: '2', title: 'Schedule dress fittings', description: '', date: '2025-06-15', status: 'Completed' },
//     { id: '3', title: 'Book a photographer', description: '', date: '2025-07-15', status: 'Pending' },
//     { id: '4', title: 'Hire a wedding planner', description: '', date: '2025-06-05', status: 'Completed' },
//     { id: '5', title: 'Select floral arrangements', description: '', date: '2025-07-10', status: 'Pending' },
//     { id: '6', title: 'Book the venue', description: '', date: '2025-05-25', status: 'Completed' },
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({ title: '', description: '', date: '', status: 'Pending' });

//   const inProgress = tasks.filter(t => t.status === 'Pending');
//   const completed = tasks.filter(t => t.status === 'Completed');

//   function onDragEnd(result: { source: any; destination: any; }) {
//     const { source, destination } = result;
//     if (!destination) return;

//     const updated = Array.from(tasks);
//     const [moved] = updated.splice(source.index + (source.droppableId === 'completed' ? inProgress.length : 0), 1);
//     moved.status = destination.droppableId === 'pending' ? 'Pending' : 'Completed';
//     updated.splice(destination.index + (destination.droppableId === 'completed' ? inProgress.length : 0), 0, moved);

//     setTasks(updated);
//   }

//   function addTask() {
//     const newTask = { ...form, id: Date.now().toString() };
//     setTasks(prev => [newTask, ...prev]);
//     setForm({ title: '', description: '', date: '', status: 'Pending' });
//     setShowModal(false);
//   }

//   function handleDelete(id: string) {
//     setTasks(prev => prev.filter(t => t.id !== id));
//   }

//   return (
//     <div className="bg-[#FEFBF9] min-h-screen flex font-sans">
//       {/* Sidebar */}
//       <aside className="hidden md:flex flex-col w-64 p-6 bg-[#FAF5F0] rounded-2xl shadow-md">
//         <h2 className="text-2xl font-serif mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Celebre</h2>
//         {navItems.map(({ icon: Icon, label, href, active }) => (
//           <a
//             key={label}
//             href={href}
//             className={`flex items-center gap-4 px-4 py-3 mb-2 rounded-xl transition-colors ${
//               active ? 'bg-[#E9D8C7] text-[#C67C5A]' : 'text-[#6B5E57]'
//             }`}
//             style={{ fontFamily: 'Inter, sans-serif' }}
//           >
//             <Icon className="w-5 h-5" />
//             {label}
//           </a>
//         ))}
//       </aside>

//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="sticky top-0 bg-white bg-opacity-50 backdrop-blur rounded-b-2xl shadow flex items-center justify-between px-6 py-4 z-10">
//           <h1 className="text-2xl font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>Tasks</h1>
//           <button
//             onClick={() => setShowModal(true)}
//             className="py-2 px-4 bg-[#F9F1E8] rounded-xl font-medium"
//             style={{ fontFamily: 'Inter, sans-serif' }}
//           >
//             <FiPlus className="inline-block mr-2" /> Add New
//           </button>
//         </header>

//         {/* Drag-and-Drop Boards */}
//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* In Progress */}
//             <div>
//               <h2 className="text-lg font-semibold mb-4">In Progress</h2>
//               <Droppable droppableId="pending">
//                 {(provided: { innerRef: LegacyRef<HTMLDivElement> | undefined; droppableProps: JSX.IntrinsicAttributes & ClassAttributes<HTMLDivElement> & HTMLAttributes<HTMLDivElement>; placeholder: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }) => (
//                   <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
//                     {inProgress.map((task, index) => (
//                       <Draggable key={task.id} draggableId={task.id} index={index}>
//                         {(prov: { innerRef: LegacyRef<HTMLDivElement> | undefined; draggableProps: JSX.IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>; dragHandleProps: JSX.IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>; }) => (
//                           <motion.div
//                             ref={prov.innerRef}
//                             {...prov.draggableProps}
//                             {...prov.dragHandleProps}
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: 10 }}
//                             className="bg-[#F5E3D0] p-4 rounded-xl flex justify-between items-center"
//                           >
//                             <div>
//                               <p className="font-medium">{task.title}</p>
//                               <p className="text-sm text-[#6B5E57] mt-1">{task.date}</p>
//                             </div>
//                             <FiSquare className="text-[#6B5E57]" />
//                           </motion.div>
//                         )}
//                       </Draggable>
//                     ))}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </div>

//             {/* Completed */}
//             <div>
//               <h2 className="text-lg font-semibold mb-4">Completed</h2>
//               <Droppable droppableId="completed">
//                 {(provided: { innerRef: LegacyRef<HTMLDivElement> | undefined; droppableProps: JSX.IntrinsicAttributes & ClassAttributes<HTMLDivElement> & HTMLAttributes<HTMLDivElement>; placeholder: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }) => (
//                   <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
//                     {completed.map((task, index) => (
//                       <Draggable key={task.id} draggableId={task.id} index={index}>
//                         {(prov: { innerRef: LegacyRef<HTMLDivElement> | undefined; draggableProps: JSX.IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>; dragHandleProps: JSX.IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>; }) => (
//                           <motion.div
//                             ref={prov.innerRef}
//                             {...prov.draggableProps}
//                             {...prov.dragHandleProps}
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: 10 }}
//                             className="bg-[#D0F5E3] p-4 rounded-xl flex justify-between items-center"
//                           >
//                             <div>
//                               <p className="font-medium">{task.title}</p>
//                               <p className="text-sm text-[#6B5E57] mt-1">{task.date}</p>
//                             </div>
//                             <FiCheckSquare className="text-[#2D6A4F]" />
//                           </motion.div>
//                         )}
//                       </Draggable>
//                     ))}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </div>
//           </div>
//         </DragDropContext>

//         {/* Mobile nav */}
//         <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-[#FAF5F0] border-t border-[#ecd8cb] flex justify-around items-center h-16">
//           {navItems.map(({ icon: Icon, label }, idx) => (
//             <a
//               key={label}
//               href="#"
//               className={`flex flex-col items-center text-xs ${label === 'Tasks' ? 'text-[#C67C5A]' : 'text-[#6B5E57]'}`}
//             >
//               <Icon className="w-6 h-6" />
//               <span>{label}</span>
//             </a>
//           ))}
//         </nav>
//       </div>

//       <AnimatePresence>
//             {showModal && (
//               <motion.div
//                 className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//               >
//                 <motion.div
//                   className="bg-white rounded-2xl p-6 w-full max-w-md"
//                   initial={{ scale: 0.8 }}
//                   animate={{ scale: 1 }}
//                   exit={{ scale: 0.8 }}
//                 >
//                   <h2
//                     className="text-xl font-serif mb-4"
//                     style={{ fontFamily: 'Playfair Display, serif' }}
//                   >
//                     New Task
//                   </h2>
//                   <input
//                     type="text"
//                     placeholder="Title"
//                     value={form.title}
//                     onChange={(e) =>
//                       setForm({ ...form, title: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none"
//                     style={{ fontFamily: 'Inter, sans-serif' }}
//                   />
//                   <textarea
//                     placeholder="Description"
//                     value={form.description}
//                     onChange={(e) =>
//                       setForm({ ...form, description: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border rounded-lg mb-3 h-24 focus:outline-none resize-none"
//                     style={{ fontFamily: 'Inter, sans-serif' }}
//                   />
//                   <input
//                     type="date"
//                     value={form.date}
//                     onChange={(e) =>
//                       setForm({ ...form, date: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none"
//                     style={{ fontFamily: 'Inter, sans-serif' }}
//                   />
//                   <div className="flex justify-end gap-3">
//                     <motion.button
//                       onClick={() => setShowModal(false)}
//                       whileHover={{ scale: 1.03 }}
//                       className="px-4 py-2 text-[#6B5E57] rounded-lg"
//                     >
//                       Cancel
//                     </motion.button>
//                     <motion.button
//                       onClick={addTask}
//                       whileHover={{ scale: 1.03 }}
//                       className="px-4 py-2 bg-[#F9F1E8] rounded-lg"
//                     >
//                       Save
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//     </div>
//   );
// }
