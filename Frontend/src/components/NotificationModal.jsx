import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, text: "Validación completada Ficha 2455129", time: "Hace 10 minutos", color: "bg-green-500" },
    { id: 2, text: "14 nuevos aprendices en Ficha 2475102", time: "Hace 2 horas", color: "bg-blue-500" },
    { id: 3, text: "Reporte mensual generado", time: "Ayer", color: "bg-orange-500" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <ArrowRight className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-700">Notificaciones</h2>
        </div>

        <p className="text-gray-400 font-semibold text-sm tracking-widest mb-4">ACTIVIDAD RECIENTE</p>
        
        <div className="space-y-6">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex gap-4">
              <span className={`w-3 h-3 rounded-full mt-2 ${notif.color}`}></span>
              <div>
                <p className="text-gray-700 font-medium text-lg leading-tight">{notif.text}</p>
                <p className="text-gray-400 text-sm">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;