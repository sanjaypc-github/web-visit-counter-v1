const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection with more detailed logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic-counter', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Add connection error handling
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Traffic Schema
const trafficSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  sessionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  pageUrl: String,
  referrer: String,
  viewDuration: { type: Number, default: 0 },
  isNewVisitor: Boolean
});

const Traffic = mongoose.model('Traffic', trafficSchema);

// Add logging to track data operations
app.post('/api/traffic/record-visit', async (req, res) => {
  try {
    const { visitorId, sessionId, pageUrl, referrer, isNewVisitor } = req.body;
    console.log('Recording new visit:', { visitorId, sessionId, pageUrl });
    
    const traffic = new Traffic({
      visitorId,
      sessionId,
      pageUrl,
      referrer,
      isNewVisitor
    });

    await traffic.save();
    console.log('Visit recorded successfully:', traffic._id);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Traffic.aggregate([
      {
        $match: {
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalDuration: { $sum: '$viewDuration' },
          newVisitors: { $sum: { $cond: ['$isNewVisitor', 1, 0] } }
        }
      }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const historical = await Traffic.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalDuration: { $sum: '$viewDuration' }
        }
      },
      {
        $project: {
          _id: 1,
          visits: 1,
          uniqueVisitors: 1,
          avgViewDuration: { $divide: ['$totalDuration', '$visits'] }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const stats = {
      today: {
        totalVisits: todayStats[0]?.totalVisits || 0,
        uniqueVisitors: todayStats[0]?.uniqueVisitors || [],
        avgViewDuration: todayStats[0]?.totalDuration / todayStats[0]?.totalVisits || 0,
        newVisitors: todayStats[0]?.newVisitors || 0
      },
      historical
    };

    res.json(stats);
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ error: 'Error recording visit' });
  }
});

app.post('/api/traffic/update-duration', async (req, res) => {
  try {
    const { sessionId, duration } = req.body;
    console.log('Updating duration for session:', sessionId);
    await Traffic.findOneAndUpdate(
      { sessionId },
      { viewDuration: duration }
    );
    console.log('Duration updated successfully for session:', sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating duration:', error);
    res.status(500).json({ error: 'Error updating duration' });
  }
});

app.get('/api/traffic/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Traffic.aggregate([
      {
        $match: {
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalDuration: { $sum: '$viewDuration' },
          newVisitors: { $sum: { $cond: ['$isNewVisitor', 1, 0] } }
        }
      }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const historical = await Traffic.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalDuration: { $sum: '$viewDuration' }
        }
      },
      {
        $project: {
          _id: 1,
          visits: 1,
          uniqueVisitors: 1,
          avgViewDuration: { $divide: ['$totalDuration', '$visits'] }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const stats = {
      today: {
        totalVisits: todayStats[0]?.totalVisits || 0,
        uniqueVisitors: todayStats[0]?.uniqueVisitors || [],
        avgViewDuration: todayStats[0]?.totalDuration / todayStats[0]?.totalVisits || 0,
        newVisitors: todayStats[0]?.newVisitors || 0
      },
      historical
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

app.get('/api/traffic/insights', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Traffic.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          totalViewDuration: { $sum: '$viewDuration' },
          newVisitors: { $sum: { $cond: ['$isNewVisitor', 1, 0] } },
          shortVisits: { 
            $sum: { 
              $cond: [
                { $lt: ['$viewDuration', 30] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          totalVisits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          avgViewDuration: { $divide: ['$totalViewDuration', '$totalVisits'] },
          newVisitors: 1,
          bounceRate: {
            $multiply: [
              { $divide: ['$shortVisits', '$totalVisits'] },
              100
            ]
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({ dailyStats });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Error fetching insights' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
