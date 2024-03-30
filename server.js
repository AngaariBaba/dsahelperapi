const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

const pass = encodeURIComponent(process.env.MONGODB_PASSWORD); // Use environment variable

async function DBConnector() {
    try {
        await mongoose.connect(`mongodb+srv://angaaribaba:${pass}@namancluster.p9d7ksl.mongodb.net/DSA?retryWrites=true&w=majority&appName=NamanCluster`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

DBConnector();

// Define Mongoose schema and model
const questionSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    cpp: {
        type: String,
        required: true
    },
    java: {
        type: String,
        required: true
    },
    python: {
        type: String,
        required: true
    },
    ctags: {
        type: [String],
        required: true,
        validate: {
            validator: (value) => value.length > 0,
            message: 'At least one company tag is required'
        }
    },
    topics: {
        type: [String],
        required: true,
        validate: {
            validator: (value) => value.length > 0,
            message: 'At least one topic tag is required'
        }
    }
});

const Question = mongoose.model('Question', questionSchema);

app.post('/addquestions', async (req, res) => {
    try {
        const data = req.body;

        // Validate input data
        if (!Array.isArray(data)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const important_array = data.map((item) => {
            const cpp = item.extra?.initial_user_func?.cpp?.initial_code || '';
            const java = item.extra?.initial_user_func?.java?.initial_code || '';
            const slug = item.slug || '';
            const ctags = item.tags?.company_tags || [];
            const topics = item.tags?.topic_tags || [];
            const python = item.extra?.initial_user_func?.python3?.initial_code || '';
            return { slug, cpp, java, python, ctags, topics };
        });

        // Insert data using Mongoose model
        await Question.insertMany(important_array);

        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000; // Use environment variable for port
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
