// StatsCard.jsx (updated component)
import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ title, value, icon, gradient = "from-blue-500 to-blue-600" }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}></div>
    </motion.div>
  );
};

export default StatsCard;