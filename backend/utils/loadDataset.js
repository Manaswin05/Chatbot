const fs = require('fs');
const csv = require('csv-parser');
const Conversation = require('../models/Conversation');

async function loadCSVDataset(filePath) {
  const conversations = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.question && row.answer) {
          conversations.push({
            question: row.question.trim(),
            answer: row.answer.trim(),
            confidence: 1.0
          });
        }
      })
      .on('end', async () => {
        try {
          await Conversation.deleteMany({});
          await Conversation.insertMany(conversations);
          console.log(`Loaded ${conversations.length} conversations into database`);
          resolve(conversations.length);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

module.exports = { loadCSVDataset };
