const fs = require('fs');
const path = require('path');
const {
  initialCategories,
  initialUsers,
  initialItems,
  initialBorrowRequests,
  initialTransactions,
  initialReviews,
  initialNotifications,
  initialReports,
  initialRiskFlags
} = require('./seedData');

const DB_FILE = path.join(__dirname, 'db_snapshot.json');

class Store {
  constructor() {
    this.data = {
      users: [...initialUsers],
      categories: [...initialCategories],
      items: [...initialItems],
      requests: [...initialBorrowRequests],
      transactions: [...initialTransactions],
      reviews: [...initialReviews],
      notifications: [...initialNotifications],
      reports: [...initialReports],
      riskFlags: [...initialRiskFlags]
    };
    this.loadSnapshot();
  }

  loadSnapshot() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
        console.log('[Store] Loaded database snapshot from disk.');
      }
    } catch (err) {
      console.warn('[Store] Snapshot file corrupted or unreadable, using default seed data.', err.message);
    }
  }

  saveSnapshot() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[Store] Failed to write snapshot to disk:', err.message);
    }
  }

  // Generic helpers
  find(collectionName, filterFn = () => true) {
    const list = this.data[collectionName] || [];
    return list.filter(filterFn);
  }

  findOne(collectionName, filterFn) {
    const list = this.data[collectionName] || [];
    return list.find(filterFn) || null;
  }

  findById(collectionName, id) {
    return this.findOne(collectionName, item => (item.id === id || item._id === id));
  }

  create(collectionName, item) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    const newItem = {
      id: item.id || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      ...item
    };
    this.data[collectionName].unshift(newItem);
    this.saveSnapshot();
    return newItem;
  }

  update(collectionName, id, updates) {
    const list = this.data[collectionName] || [];
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveSnapshot();
    return list[index];
  }

  delete(collectionName, id) {
    const list = this.data[collectionName] || [];
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.saveSnapshot();
    return true;
  }

  resetToSeed() {
    this.data = {
      users: [...initialUsers],
      categories: [...initialCategories],
      items: [...initialItems],
      requests: [...initialBorrowRequests],
      transactions: [...initialTransactions],
      reviews: [...initialReviews],
      notifications: [...initialNotifications],
      reports: [...initialReports],
      riskFlags: [...initialRiskFlags]
    };
    this.saveSnapshot();
    return true;
  }
}

const store = new Store();
module.exports = store;
