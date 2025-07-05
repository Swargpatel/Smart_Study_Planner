const moongose = require('mongoose');
const subjectSchema = new moongose.Schema({
    sub: String, 
    date: Date, 
    syllabus: String, 
    DifficultyLevel: String, 
    comments: String 
});

module.exports = moongose.model('SubjectSheet', subjectSchema);