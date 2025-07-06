

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 5000;

// To create API call
import axios from "axios";

app.use(bodyParser.json());
app.use(cors());
app.use('/api/auth', require('./routes/authRoutes'));

mongoose.connect(process.env.MONGO_URI);
const subjectSchema = new mongoose.Schema({
    sub: String, 
    date: Date, 
    syllabus: String, 
    DifficultyLevel: String, 
    comments: String 
})
const SubjectSheet = mongoose.model('SubjectSheet',subjectSchema);

//GET: Fetch all Subject Data from database
app.get('/api/exam',async(req,res) => {
    try{
        const subjects = await SubjectSheet.find();
        res.json(subjects);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
})

//POST: Add a new Subject to the database
app.post('/api/exam', async(req,res) => {
    try{
        const newSubject = new SubjectSheet({
            sub: req.body.sub,
            date: req.body.date,
            syllabus: req.body.syllabus,
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

// To create API call to Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
    const { prompt: userPrompt, hours } = req.body;

    try {
        const subjects = await SubjectSheet.find();
        console.log(`Found ${subjects.length} subjects in database`);

        let syllabusDetails = "";

        for (const subj of subjects) {

            syllabusDetails += `Subject: ${subj.sub}, Exam Date: ${new Date(subj.date).toDateString()}, Difficulty: ${subj.DifficultyLevel}, Comments: ${subj.comments}, Syllabus: ${subj.syllabus}\n\n`;
        }

        const finalPrompt = `Generate a smart daily study plan in table format (Date | Topics | Tasks). Study hours/day: ${hours}. 

        Analyze the following subjects and syllabus content carefully:
        ${syllabusDetails}

        Create a comprehensive study plan that:
        1. Prioritizes harder subjects and chapters
        2. Allocates more time to subjects with earlier exam dates
        3. Includes revision sessions
        4. Accounts for the difficulty level of each subject
        5. Provides specific chapter/topic recommendations based on the syllabus content ${userPrompt ? `\n\nUser Prompt: ${userPrompt}` : ""}`;

        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

        console.log('Sending prompt to Gemini API...');
        const result = await model.generateContent(finalPrompt);
        const text = result.response.text();

        console.log('Received response from Gemini API');
        // console.log("Gemini Response:", text);
        res.json({ output: text });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI generation failed", details: error.message });
    }
});

app.listen(PORT,()=>{console.log("Server is running on port", PORT)});