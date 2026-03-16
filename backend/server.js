require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'hasini-solar-secret-2024';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hasini_solar';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, default: 'staff' },
  createdAt: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  village:      { type: String, required: true },
  bank:         { type: String, required: true },
  bankVillage:  { type: String, required: true },
  bankAccountName: { type: String, default: '' },
  bankOfficePhone: { type: String, default: '' },
  phone:        { type: String, required: true },
  status: {
    type: String,
    enum: ['bank_payment_1','site_installation','bank_payment_2','site_completed'],
    default: 'bank_payment_1'
  },
  notes:     { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const User     = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET customers - ONLY current user's customers
app.get('/api/customers', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = { createdBy: req.user.id };
    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, 'i') },
        { village:      new RegExp(search, 'i') },
        { bank:         new RegExp(search, 'i') },
        { bankAccountName: new RegExp(search, 'i') },
        { bankOfficePhone: new RegExp(search, 'i') },
        { phone:        new RegExp(search, 'i') },
      ];
    }
    if (status) filter.status = status;
    const customers = await Customer.find(filter).collation({ locale: 'en' }).sort({ customerName: 1 });
    res.json(customers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE customer - always belongs to current user
app.post('/api/customers', auth, async (req, res) => {
  try {
    const { customerName, phone } = req.body;
    const existing = await Customer.findOne({ 
      $or: [{ customerName }, { phone }] 
    });
    if (existing) {
      return res.status(400).json({ message: 'ఈ పేరు లేదా ఫోన్ నంబర్‌తో కస్టమర్ ఇప్పటికే ఉన్నారు' });
    }
    const customer = await Customer.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE customer - only owner can edit
app.put('/api/customers/:id', auth, async (req, res) => {
  try {
    const exists = await Customer.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!exists) return res.status(404).json({ message: 'Not found or not authorized' });
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE customer - only owner can delete
app.delete('/api/customers/:id', auth, async (req, res) => {
  try {
    const exists = await Customer.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!exists) return res.status(404).json({ message: 'Not found or not authorized' });
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// STATS - only current user's data
app.get('/api/stats', auth, async (req, res) => {
  try {
    const userFilter = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    const total = await Customer.countDocuments(userFilter);
    const byStatus = await Customer.aggregate([
      { $match: userFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ total, byStatus });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model('Announcement', announcementSchema);

// ANNOUNCEMENT ENDPOINTS
app.get('/api/announcements', auth, async (req, res) => {
  try {
    const anns = await Announcement.find().sort({ updatedAt: -1 });
    res.json(anns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/announcements', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });
    const ann = await Announcement.create({ message: req.body.message });
    res.json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/announcements/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });
    const ann = await Announcement.findByIdAndUpdate(
      req.params.id,
      { message: req.body.message, updatedAt: Date.now() },
      { new: true }
    );
    res.json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/announcements/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
