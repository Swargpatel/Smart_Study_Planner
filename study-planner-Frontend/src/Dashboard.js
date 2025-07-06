

import './Dashboard.css'
import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import API from './services/api';

function App() {

    const [data, Dataset] = useState([]);

    const [hours, setHours] = useState(() => {
        // Get hours from localStorage if available, else undefined
        const saved = localStorage.getItem('study_hours');
        return saved !== null ? Number(saved) : '';
    });

    // boolean variable
    const [lock, setLock] = useState(() => {
        return localStorage.getItem('study_hours') !== null;
    });

    const [subject, setSubject] = useState("");
    const [examDate, setExamDate] = useState(new Date());
    const [syllabus, setSyllabus] = useState("");
    const [level, setLevel] = useState("");
    const [comments, setComments] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // For plan display
    const [aiPlan, setAiPlan] = useState("");

    // Save hours to localStorage whenever it changes
    useEffect(() => {
        if (hours !== '') {
            localStorage.setItem('study_hours', hours);
        }
    }, [hours]);
    
    useEffect(() => {
        API.get('/exam').then((response) => {
            console.log("Backend Response:", response.data);
            Dataset(response.data);
        })
    }, []);

    const addSubject = async (e) => {

        e.preventDefault(); // prevent form reload

        try {
        const response = await API.post('/exam', {
            sub: subject,
            date: examDate.toISOString(),
            syllabus: syllabus,
            DifficultyLevel: level,
            comments: comments
        });
        console.log("✅ Server response:", response.data);

        Dataset([...data, response.data.data]);

        // Reset form fields
        setSubject('');
        setExamDate(new Date());
        setSyllabus('');
        setLevel('');
        setComments('');

        // Show toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setLoading(false);
        } catch (error) {
        console.error("❌ Upload failed:", error);
        }
    };

    const deleteSubject = (id) => {
        API.delete(`/exam/${id}`).then(() => {
            Dataset(data.filter((info) => info._id !== id));
        });
    };

    const showSubjectform = () => {
        return (
            <div>
                <form>
                    <fieldset style={{ margin: '0 auto', width: '50%' }}>
                        <legend>Please Fill All Details Compulsory!!! </legend>
                        <div className="form-container">
                            <label>Subject Name:</label>
                            <input
                                type='text'
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder='Enter Subject Name'
                            /><br></br>

                            <label>Exam Date:</label>
                            <input
                                type='date'
                                value={examDate.toISOString().substring(0, 10)}
                                onChange={(e) => setExamDate(new Date(e.target.value))}
                            /><br></br>

                            <label>Syllabus:</label>
                            <textarea
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                placeholder='Enter the syllabus or Topics that you want to cover'
                                rows={11}
                                cols={50}
                            ></textarea><br></br>


                            <label>Difficulty Level:</label>
                            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value=''>Select Level</option>
                                <option value='easy'>Easy</option>
                                <option value='medium'>Medium</option>
                                <option value='hard'>Hard</option>
                            </select><br></br>

                            <label>Comments:</label><br></br>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder='which chapter you feel hard and which are important that you want to cover first!!!'
                                rows={5}
                                cols={50}
                            ></textarea><br></br>

                            {/* <button className="add-subject-button" onClick={addSubject}>Add Subject</button> */}
                            <button className="add-subject-button" onClick={addSubject} disabled={loading}>
                                {loading ? <span className="spinner"></span> : "Add Subject"}
                            </button>

                        </div>
                    </fieldset>
                </form>
                {showToast && (
                    <div className="toast">✅ Subject added successfully!</div>
                )}

            </div>
        )
    }

    // Creating prompt to call API
    const handleChat = async () => {
    try {
        const res = await API.post('/chat', {
        prompt: "Create a table with [Date, Chapters, Tasks]",
        hours: hours
        });

        setAiPlan(res.data.output);
    } catch (error) {
        console.error("Error fetching AI plan:", error);
        setAiPlan("Failed to generate study plan.");
    }
    };
    return (
        <div>
            <button
                onClick={() => {
                    setDarkMode(!darkMode);
                    document.body.classList.toggle('dark');
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: darkMode ? '#66ccff' : '#007acc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 20px',
                    cursor: 'pointer'
                }}
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <h1>SMART STUDY PLANNER</h1>
            <h3>Let's plan together to crack exams</h3>
            <div className="study-hours">
                <label>Hours of Study per Day:</label>
                <input
                    type='number'
                    value={hours}
                    placeholder='Enter hours of study'
                    disabled={lock}
                    onChange={(e) => {
                    setHours(e.target.value);
                    setLock(true); // <== This ensures field becomes locked again after saving
                }}
                />
                {lock && (
                <button
                    onClick={() => {
                    localStorage.removeItem('study_hours'); // This clears the lock
                    setLock(false);                         // Enable editing
                    }}
                    style={{ marginLeft: '10px' }}
                >
                    Edit
                </button>
                )}
            </div>

            <div className="add-subject">
                <button className="plus-button" onClick={() => setShowForm((view) => !view)}>+</button>
                <label>Add Subject</label>
            </div>

            {showForm && (
                <div className="subject-form">
                    {showSubjectform()}
                </div>
            )}

            <br></br><br></br>
            <h2>Stored Subject</h2>
            <table border="1" align='center'>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Exam Date</th>
                        <th>Syllabus</th>
                        <th>Difficulty Level</th>
                        <th>comments</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((info) => (
                        <tr key={info._id}>
                            <td>{info.sub}</td>
                            <td>{new Date(info.date).toISOString().split('T')[0]}</td>
                            <td>{info.syllabus}</td>
                            <td>{info.DifficultyLevel}</td>
                            <td>{info.comments}</td>
                            <td>
                                <button onClick={() => deleteSubject(info._id)}>Delete Subject</button>
                            </td>
                        </tr>
                        ))}
                </tbody>
            </table>

            <br /><br />
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleChat} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Generate Smart Study Plan
                </button>
            </div>

            <br />
            {aiPlan && (
                <div style={{ margin: '20px auto', width: '80%', whiteSpace: 'pre-wrap', backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '10px' }}>
                <h3>📘 Smart Study Plan</h3>
                <div>{aiPlan}</div>
                <p>Take screenshot of the above plan before leaving this page.</p>
                </div>
            )}
        </div>
    );
}

export default App;

