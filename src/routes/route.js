const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv').config();
const db = require('../config/db.config');
const router = express.Router();

// FreshSales API configuration
const FRESHSALES_API_KEY = process.env.FRESHSALES_API;
const FRESHSALES_API_URL = process.env.FRESHSALES_API_URL;

console.log('Dot env', FRESHSALES_API_KEY);
console.log('Dot env', FRESHSALES_API_URL);

// Create Contact
router.post('/createContact', async (req, res) => {
  const { first_name, last_name, email, mobile_number, data_store } = req.body;
  if (data_store === 'CRM') {
    try {
      const response = await axios.post(
        FRESHSALES_API_URL,
        {
          contact: { first_name: first_name, last_name: last_name, email: email, mobile_number: mobile_number },
        },
        {
          headers: {
            Authorization: `Token token=${FRESHSALES_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Body of response: ', response);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (data_store === 'DATABASE') {
    db.query('INSERT INTO contacts SET ?', { first_name, last_name, email, mobile_number }, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: results.insertId, ...req.body });
    });
  } else {
    res.status(400).json({ error: 'Invalid data_store value' });
  }
});

// Get Contact
router.post('/getContact', (req, res) => {
  const { contact_id, data_store } = req.body;

  if (data_store === 'CRM') {
    axios
      .get(`${FRESHSALES_API_URL}/${contact_id}`, {
        headers: {
          Authorization: `Token token=${FRESHSALES_API_KEY}`,
        },
      })
      .then((response) => {
        res.json(response.data);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  } else if (data_store === 'DATABASE') {
    db.query('SELECT * FROM contacts WHERE id = ?', [contact_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: 'Contact not found' });
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid data_store value' });
  }
});

// Update Contact
router.post('/updateContact', (req, res) => {
  const { contact_id, new_email, new_mobile_number, data_store } = req.body;

  if (data_store === 'CRM') {
    axios
      .put(
        `${FRESHSALES_API_URL}/${contact_id}`,
        {
          contact: { email: new_email, mobile_number: new_mobile_number },
        },
        {
          headers: {
            Authorization: `Token token=${FRESHSALES_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        res.json(response.data);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  } else if (data_store === 'DATABASE') {
    db.query(
      'UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?',
      [new_email, new_mobile_number, contact_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Contact updated successfully' });
      }
    );
  } else {
    res.status(400).json({ error: 'Invalid data_store value' });
  }
});

// Delete Contact
router.post('/deleteContact', (req, res) => {
  const { contact_id, data_store } = req.body;

  if (data_store === 'CRM') {
    axios
      .delete(`${FRESHSALES_API_URL}/${contact_id}`, {
        headers: {
          Authorization: `Token token=${FRESHSALES_API_KEY}`,
        },
      })
      .then((response) => {
        console.log(response);
        res.json(response.data);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  } else if (data_store === 'DATABASE') {
    db.query('DELETE FROM contacts WHERE id = ?', [contact_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contact deleted successfully' });
    });
  } else {
    res.status(400).json({ error: 'Invalid data_store value' });
  }
});

module.exports = router;
