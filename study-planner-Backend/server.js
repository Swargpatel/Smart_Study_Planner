const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const SubjectSheet = require('./models/SubjectSheet')
const upload = require('./middleware/multer');

const app = express();
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the uploads directory

const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', require('./routes/authRoutes'));
// mongoose.connect('mongodb://localhost:27017/study-planner');
// const subjectSchema = new mongoose.Schema({
//     sub: String, 
//     date: Date, 
//     syllabus: String, 
//     DifficultyLevel: String, 
//     comments: String 
// })
// const SubjectSheet = mongoose.model('SubjectSheet',subjectSchema);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("mongoDB connected"))
.catch(err => console.error('MongoDB connection error:', err));

//GET: Fetch all Subject Data from database
app.get('/api/exam',async(req,res) => {
    try{
        const subjects = await SubjectSheet.find();
        res.json(subjects);
        console.log("Fetched Subjects:", subjects);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
})

//POST: Add a new Subject to the database
app.post('/api/exam', upload.single('syllabus'), async(req,res) => {
    try{
        const newSubject = new SubjectSheet({
            sub: req.body.sub,
            date: req.body.date,
            syllabus: req.file ? req.file.path : "", // Save the file path if a file is uploaded
            DifficultyLevel: req.body.DifficultyLevel,
            comments: req.body.comments
        })

        const savedSubject = await newSubject.save();
        res.json({ message: 'Subject added successfully', data: savedSubject });
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
})

// DELETE: Remove a Data
app.delete('/api/exam/:id',async(req,res) => {
    try{
        const deletedSubject = await SubjectSheet.findByIdAndDelete(req.params.id);
        res.json(deletedSubject);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
});

app.listen(PORT,()=>{console.log(`Server is running on ${PORT}`)});