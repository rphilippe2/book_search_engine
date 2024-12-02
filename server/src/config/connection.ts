import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');



mongoose.connection.on('connected', () => {
  console.log('Database connected successfully');
});


mongoose.connection.on('error', (err) => {
  console.log('Database connection error:', err);
});

export default mongoose.connection;
