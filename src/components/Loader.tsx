import { motion } from 'framer-motion';

export function Loader() {
  return (
    <motion.div
      className="mx-auto h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    />
  );
}
