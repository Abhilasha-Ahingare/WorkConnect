import React from "react";
import { Link } from "react-router-dom";

const ClientCard = ({ client, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Lead': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Converted': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {client.name}
          </h3>
          <div className="mt-2 space-y-1">
            {client.email && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📧</span>
                {client.email}
              </p>
            )}
            {client.phone && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📞</span>
                {client.phone}
              </p>
            )}
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
          {client.status}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <Link
          to={`/clients/${client._id}`}
          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View Details
        </Link>
        <button
          onClick={() => onEdit(client)}
          className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit Client"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(client._id)}
          className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Client"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ClientCard;