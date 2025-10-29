const db = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.getComplaints = async (req, res) => {
  const page = +req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const userId = req.user.role === 'admin' ? null : req.user.id;

  try {
    let query = `
      SELECT c.*, u.name as user_name, cat.name as category_name 
      FROM complaints c 
      JOIN users u ON c.user_id = u.id 
      JOIN categories cat ON c.category_id = cat.id
    `;
    let params = [];

    if (!userId) {
      query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
      params = [limit, offset];
    } else {
      query += ` WHERE c.user_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
      params = [userId, limit, offset];
    }

    const [complaints] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM complaints' + (userId ? ' WHERE user_id = ?' : ''), userId ? [userId] : []);

    res.json({ complaints, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createComplaint = async (req, res) => {
  const { title, description, category_id, latitude, longitude } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query(
      `INSERT INTO complaints (user_id, category_id, title, description, latitude, longitude, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id, title, description, latitude, longitude, image_url]
    );

    const [newComplaint] = await db.query('SELECT * FROM complaints WHERE id = ?', [result.insertId]);
    req.io.emit('complaintAdded', newComplaint[0]);

    sendEmail('admin@wms.com', 'New Complaint', `Title: ${title}\nLocation: ${latitude}, ${longitude}`);

    res.status(201).json(newComplaint[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await db.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
    const [updated] = await db.query('SELECT * FROM complaints WHERE id = ?', [id]);
    const complaint = updated[0];

    const [user] = await db.query('SELECT email FROM users WHERE id = ?', [complaint.user_id]);
    sendEmail(user[0].email, 'Complaint Updated', `Status: ${status}`);

    req.io.emit('statusUpdated', complaint);
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};