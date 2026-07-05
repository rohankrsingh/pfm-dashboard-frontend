import mongoose from 'mongoose';
import Budget from './models/Budget.js';

async function run() {
  await mongoose.connect('mongodb+srv://saru:saru@cluster0.e1m7u.mongodb.net/pfm-dashboard?appName=Cluster0');
  const budgets = await Budget.find();
  
  console.log('BUDGETS:');
  budgets.forEach(b => console.log(`Month: ${b.month}, Category: ${b.category}, Amount: ${b.amount}`));
  
  mongoose.disconnect();
}
run();
