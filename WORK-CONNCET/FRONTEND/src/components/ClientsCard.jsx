import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, Edit3, Trash2, Eye, User } from "lucide-react";

const ClientCard = ({ client, onEdit, onDelete, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Lead': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Converted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Lead': return '💡';
      case 'In Progress': return '🔄';
      case 'Converted': return '✅';
      default: return '👤';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
    >
      {/* Decorative accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-indigo-600"></div>
      
      <div className="flex items-start justify-between mb-4 ml-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              {client.name}
            </h3>
          </div>
          
          <div className="mt-3 space-y-2 ml-1">
            {client.email && (
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{client.email}</span>
              </p>
            )}
            {client.phone && (
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                {client.phone}
              </p>
            )}
          </div>
        </div>
        
        <motion.span 
          whileHover={{ scale: 1.05 }}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)} flex items-center gap-1`}
        >
          {getStatusIcon(client.status)} {client.status}
        </motion.span>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-4">
        <Link
          to={`/clients/${client._id}`}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-center py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(client)}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit Client"
        >
          <Edit3 className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(client._id)}
          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Client"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ClientCard;