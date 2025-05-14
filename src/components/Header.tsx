import React from 'react';
import { Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header 
      className="bg-gray-900 border-b border-gray-800 py-4 px-6 mb-8"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-primary-600 p-2 rounded-md mr-3">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DJ Mix Assistant</h1>
            <p className="text-gray-400 text-sm">Find harmonically compatible tracks with BPM-aware key shifting</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;