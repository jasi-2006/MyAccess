import React, { useState } from 'react';
import NotificationModal from './NotificationModal';
import DeleteLearnerModal from './DeleteLearnerModal';

const InstructorDashboard = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar - Área de Instructor */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 text-green-500 text-2xl font-bold border-b">MyAccess</div>
        <nav className="flex-1 p-4 space-y-4">
          <div className="text-green-600 font-bold text-sm mb-4">Area de instructor</div>
          <button className="w-full text-left p-3 rounded-lg flex items-center gap-3 bg-green-50 text-green-600 font-bold border-r-4 border-green-500">
            <span>FICHAS</span>
          </button>
          <button className="w-full text-left p-3 text-gray-500 flex items-center gap-3 hover:bg-gray-100 transition">
            <span>VALIDACIÓN</span>
          </button>
          <button onClick={() => setShowDelete(true)} className="w-full text-left p-3 text-gray-500 flex items-center gap-3 hover:bg-gray-100 transition">
            <span>APRENDICES</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header / Navbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="flex gap-8 text-gray-400 font-medium">
            <span className="text-gray-800">Inicio</span>
            <span>Configuracion</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <input type="text" placeholder="Buscar..." className="bg-gray-100 rounded-full px-4 py-1 text-sm outline-none" />
            </div>
            <button onClick={() => setShowNotif(true)} className="relative text-gray-400">
              <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full">4</span>
              {/* Icono de Campana */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
               <img src="https://via.placeholder.com/150" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Dash Content (Aquí van tus tarjetas de fichas) */}
        <div className="p-10">
          <h1 className="text-2xl font-bold text-gray-800">Mis fichas</h1>
          <p className="text-gray-500 mb-8">Seleccione sus fichas o busque aprendices para validar informacion</p>
          
          {/* Aquí iría la tabla de aprendices del diseño */}
          <div className="bg-purple-50 rounded-xl p-8">
             {/* Componente de Tabla... */}
          </div>
        </div>
      </main>

      {/* Modales */}
      <NotificationModal isOpen={showNotif} onClose={() => setShowNotif(false)} />
      <DeleteLearnerModal isOpen={showDelete} onClose={() => setShowDelete(false)} />
    </div>
  );
};

export default InstructorDashboard;