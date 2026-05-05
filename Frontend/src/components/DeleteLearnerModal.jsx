import React, { useState } from 'react';
import { AlertTriangle, X, UserMinus } from 'lucide-react';

const DeleteLearnerModal = ({ isOpen, onClose, learnerName }) => {
  const [reason, setReason] = useState('Expulsión');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Confirmar Eliminación</span>
          </div>
          <button onClick={onClose}><X className="text-gray-400" /></button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4 font-medium">¿Por qué quieres borrar a este aprendiz?</p>
          
          <div className="space-y-3 mb-6">
            {['Expulsión', 'Retiro Voluntario', 'Graduación', 'Error de Registro'].map((option) => (
              <label key={option} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="reason" 
                  checked={reason === option}
                  onChange={() => setReason(option)}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>

          <label className="block text-gray-400 font-bold text-xs mb-2 tracking-wide uppercase">Observaciones Adicionales</label>
          <textarea 
            className="w-full border rounded-md p-3 text-sm h-24 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Ingrese detalles adicionales sobre la eliminación..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t">
          <button onClick={onClose} className="px-6 py-2 border rounded-md font-semibold text-gray-500 bg-white">Cancelar</button>
          <button className="px-6 py-2 bg-green-500 text-white rounded-md font-semibold flex items-center gap-2">
            <UserMinus className="w-4 h-4" />
            Confirmar Eliminación
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLearnerModal;